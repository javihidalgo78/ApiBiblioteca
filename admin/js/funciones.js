const url = 'http://localhost/ApiBiblioteca/api/libros';

let librosData = []; // almacenar los datos de todos los libros
let modoEdicion = false; // para saber si estamos creando o editando
let libroEditandoId = null; // ID del libro que se está editando

// Servicio para obtener portadas de libros
class BookCoverService {
    constructor() {
        this.timeout = 12000; // 12 segundos de timeout
    }

    // Helper para crear fetch con timeout
    fetchWithTimeout(url, timeout = this.timeout) {
        return Promise.race([
            fetch(url),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), timeout)
            )
        ]);
    }

    // Buscar en Google Books
    async getGoogleBooksCover(title, author) {
        const query = `${title} ${author}`.replace(/\s+/g, '+');
        const searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;

        try {
            const response = await this.fetchWithTimeout(searchUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();

            if (data.totalItems > 0 && data.items[0].volumeInfo.imageLinks) {
                return data.items[0].volumeInfo.imageLinks.thumbnail.replace('http://', 'https://');
            }
        } catch (error) {
            console.log(`No se pudo obtener portada de Google Books para "${title}":`, error.message);
        }

        return null;
    }

    // Buscar en Open Library
    async getOpenLibraryCover(title, author) {
        const query = `${title} ${author}`.replace(/\s+/g, '+');
        const searchUrl = `https://openlibrary.org/search.json?title=${query}&limit=1`;

        try {
            const response = await this.fetchWithTimeout(searchUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();

            if (data.docs && data.docs.length > 0) {
                const book = data.docs[0];
                if (book.cover_i) {
                    return `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
                }
            }
        } catch (error) {
            console.log(`No se pudo obtener portada de Open Library para "${title}":`, error.message);
        }

        return null;
    }

    // Método principal que prueba múltiples APIs
    async getCover(title, author) {
        try {
            let coverUrl = await this.getGoogleBooksCover(title, author);
            if (!coverUrl) {
                coverUrl = await this.getOpenLibraryCover(title, author);
            }
            return coverUrl;
        } catch (error) {
            console.log(`Error general buscando portada para "${title}":`, error.message);
            return null;
        }
    }

    // Método para cargar múltiples portadas con límite de tiempo
    async loadMultipleCovers(books) {
        console.log(`Buscando portadas para ${books.length} libros...`);
        
        const promises = books.map(async (book) => {
            try {
                const coverUrl = await this.getCover(book.titulo, book.autor);
                return { ...book, coverUrl: coverUrl || null };
            } catch (error) {
                console.log(`Error buscando portada para "${book.titulo}":`, error.message);
                return { ...book, coverUrl: null };
            }
        });
        
        const results = await Promise.allSettled(promises);
        
        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                console.log(`Falló la búsqueda de portada para "${books[index].titulo}"`);
                return { ...books[index], coverUrl: null };
            }
        });
    }
}

const coverService = new BookCoverService();

document.addEventListener('DOMContentLoaded', () => {
    // Cargar libros al iniciar
        fetch(url)
        .then(response => response.json())
        .then(data => mostrarLibros(data))
        .catch(error => console.error('Error:', error));

    // Event listener para el botón crear
    document.getElementById("crear").addEventListener('click', toggleFormulario);

    // Event listener para el formulario
    document.querySelector('form').addEventListener('submit', enviarDatosNuevoLibro);
});

function toggleFormulario() {
    const form = document.querySelector('form');
    const botonCrear = document.getElementById("crear");
    
    // Si document.querySelector('form').style.display devuelve un valor vacío 
    // estado toma el segundo valor none
    const estado = form.style.display || 'none';
    
    if (estado === 'none') {
        form.style.display = 'grid';
        botonCrear.textContent = 'Ocultar formulario';
    } else {
        form.style.display = 'none';
        botonCrear.textContent = 'Crear nuevo libro';
    }
    
    if (modoEdicion) {
        resetearModoCreacion();
    }
}

async function mostrarLibros(datos) {
    const libros = datos.data;
    librosData = libros;
    console.log(libros);

    if (datos.success && datos.count > 0) {
        // Crear encabezados de la tabla
        document.getElementById('tablaLibros').innerHTML = 
            "<tr class='cabeceras'>" +
            Object.keys(libros[0]).map(clave => 
                `<td>${clave.toUpperCase()}</td>${clave === 'resumen' ? '<td class="centrado" colspan="2">Acciones</td>' : ''}`
            ).join('') + "</tr>";

        // Crear filas de la tabla
        document.getElementById('tablaLibros').innerHTML += 
            libros.map(libro => `
                <tr>
                    <td>${libro.id}</td>
                    <td>${libro.titulo}</td>
                    <td>${libro.autor}</td>
                    <td>${libro.genero}</td>
                    <td>${libro.fecha_publicacion}</td>
                    <td>
                        <img id="book-${libro.id}" 
                             src="../img/peques/${libro.imagen}?${new Date().getTime()}" 
                             alt="${libro.titulo}" 
                             onerror="this.src='../img/no-cover.jpg'" />
                    </td>
                    <td class="centrado">${(libro.disponible == 1) ? "Sí" : "No"}</td>
                    <td class="centrado">${(libro.favorito == 1) ? "Sí" : "No"}</td>
                    <td>${(libro.resumen !== null && libro.resumen.length > 0) ? libro.resumen.substring(0, 100) + "..." : ''}</td>
                    <td>
                        <button onclick="editarLibro(${libro.id})">Editar</button>
                    </td>
                    <td>
                        <button onclick="eliminarLibro(${libro.id}, '${libro.titulo}')" class="btn-delete">Eliminar</button>
                    </td>
                </tr>
            `).join('');

        // Cargar portadas externas si no existe la imagen local
        await loadAllBookCovers(libros);
        
    } else if (datos.count == 0) {
        document.getElementById('divLibros').innerHTML = "<p>No hay libros</p>";
    }
}

async function loadAllBookCovers(libros) {
    const booksWithCovers = await coverService.loadMultipleCovers(libros);

    booksWithCovers.forEach(book => {
        const imgElement = document.getElementById(`book-${book.id}`);

        if (imgElement && imgElement.src.includes('no-cover.jpg')) {
            imgElement.src = book.coverUrl;
            imgElement.onerror = () => {
                imgElement.src = '../img/no-cover.jpg';
            };
        }
    });
}

function eliminarLibro(id, titulo) {
    const confirma = confirm(`¿Seguro que quieres eliminar el libro: ${titulo}?`);

    if (!confirma) {
        return;
    }

    // El usuario ha confirmado que quiere eliminar el libro
    fetch(`${url}/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => libroEliminado(data))
    .catch(error => console.error('Error:', error));
}

function libroEliminado(data) {
    if (data.success) {
        cargarLibros();
    } else {
        alert("Hubo un problema al eliminar el libro");
    }
}

function editarLibro(id) {
    // Ir al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Buscamos el libro que queremos modificar
    const libro = librosData.find(lib => lib.id == id);

    if (libro) {
        // Activar el modo edición
        modoEdicion = true;
        libroEditandoId = id;

        // Rellenamos el formulario con los datos del libro que queremos editar
        rellenarFormularioEdicion(libro);

        // Mostramos formulario en modo edición
        mostrarFormularioEdicion();
    } else {
        alert("Error: No se encontraron los datos del libro");
    }
}

function rellenarFormularioEdicion(libro) {
    document.getElementById('titulo').value = libro.titulo || '';
    document.getElementById('autor').value = libro.autor || '';
    document.getElementById('genero').value = libro.genero || '';
    document.getElementById('fecha_publicacion').value = libro.fecha_publicacion || '';
    document.getElementById('disponible').checked = libro.disponible == 1;
    document.getElementById('favorito').checked = libro.favorito == 1;
    document.getElementById('resumen').value = libro.resumen || '';

    // Limpiar el campo de la imagen
    document.getElementById('imagen').value = '';

    // Mostrar la imagen actual si existe
    mostrarImagenActual(libro.imagen, libro.titulo);
}

function mostrarFormularioEdicion() {
    // Mostrar formulario
    document.querySelector('form').style.display = 'grid';

    // Cambiar los textos para el modo edición
    document.querySelector('form h2').textContent = "Editar libro";
    document.getElementById('btnGuardar').textContent = "Actualizar libro";
    document.getElementById("crear").textContent = "Ocultar formulario";
}

function mostrarImagenActual(imagen, titulo) {
    // Eliminar imagen previa si existe
    const imagenPrevia = document.getElementById('imagen-actual');
    if (imagenPrevia) {
        imagenPrevia.remove();
    }

    // Si hay imagen, mostrarla
    if (imagen && imagen.trim() !== '') {
        const contenedorImagen = document.createElement('div');
        contenedorImagen.id = 'imagen-actual';
        contenedorImagen.innerHTML = `
            <p>Imagen actual:</p>
            <img src="../img/peques/${imagen}" alt="${titulo}" style="max-width: 150px; height: auto;" />
        `;
        
        // Insertar después del campo de imagen
        const campoImagen = document.getElementById('imagen');
        campoImagen.parentNode.insertBefore(contenedorImagen, campoImagen.nextSibling);
    }
}

function enviarDatosNuevoLibro(e) {
    // Detener el envío del formulario
    e.preventDefault();

    const mensajesError = document.querySelectorAll('.error');
    const titulo = document.getElementById('titulo').value.trim();
    const autor = document.getElementById('autor').value.trim();
    const genero = document.getElementById('genero').value.trim();
    const fecha_publicacion = parseInt(document.getElementById('fecha_publicacion').value);
    const imagen = document.getElementById('imagen').files[0];
    const disponible = document.getElementById('disponible').checked;
    const favorito = document.getElementById('favorito').checked;
    const resumen = document.getElementById('resumen').value.trim();

    // Limpiar mensajes de error previos
    mensajesError.forEach(elemento => elemento.textContent = '');

    let errores = false;

    // Realizar las validaciones
    if (!titulo) {
        document.getElementById('error-titulo').textContent = "El título es obligatorio";
        errores = true;
    }

    if (!autor) {
        document.getElementById('error-autor').textContent = "El autor es obligatorio";
        errores = true;
    }

    const anioActual = new Date().getFullYear();
    if (isNaN(fecha_publicacion) || fecha_publicacion < 1000 || fecha_publicacion > anioActual + 1) {
        document.getElementById('error-publicacion').textContent = "La fecha de publicación debe ser un año válido (4 dígitos).";
        errores = true;
    }

    if (resumen.length > 1000) {
        document.getElementById('error-resumen').textContent = "El resumen no puede superar los 1000 caracteres.";
        errores = true;
    }

    // Comprobar el archivo de imagen
    if (imagen) {
        const validacionImagen = validarImagen(imagen);
        if (!validacionImagen.esValido) {
            document.getElementById('error-imagen').textContent = validacionImagen.mensaje;
            errores = true;
        }
    }

    if (errores) return; // Si hay errores no se envía el formulario

    // Si estamos aquí los datos del formulario son válidos
    const datos = {
        titulo,
        autor,
        genero,
        fecha_publicacion,
        disponible,
        favorito,
        resumen
    };
    console.log(datos)
    const formData = new FormData();
    formData.append("datos", JSON.stringify(datos));

    if (imagen) {
        formData.append("imagen", imagen);
    }

// Determinar método y URL según el modo
let metodo = 'POST';
let urlEnvio = url;

if (modoEdicion) {
    urlEnvio = `${url}/${libroEditandoId}`;
    formData.append("_method", "PUT"); // method override para PHP
}

// Realizar el fetch
fetch(urlEnvio, {
    method: metodo, // Siempre POST, incluso en edición
    body: formData
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        const mensaje = modoEdicion ? "Libro actualizado con éxito!" : "Libro guardado con éxito!";
        alert(mensaje);

        // Resetear formulario y estado
        resetearFormulario();

        // Volver a cargar todos los libros
        cargarLibros();
    } else {
        alert("Oppss ocurrió algún error: " + (data.error || 'Error desconocido'));
    }
})
.catch(error => {
    console.error('Error al enviar datos: ', error);
    alert("Error de conexión al enviar los datos");
});


function resetearFormulario() {
    // Limpiar el formulario
    document.querySelector('form').reset();
    
    // Ocultar el formulario
    document.querySelector('form').style.display = "none";
    
    // Cambiar el texto del botón
    document.getElementById("crear").textContent = "Crear nuevo libro";
    
    // Resetear modo edición
    resetearModoCreacion();
}

function cargarLibros() {
    fetch(url)
        .then(response => response.json())
        .then(data => mostrarLibros(data))
        .catch(error => console.error('Error:', error));
}

function validarImagen(archivo) {
    console.log('Archivo tipo:', archivo.type);
    console.log('Tamaño del archivo:', archivo.size);
    
    // Si no hay archivo pasa la validación
    if (!archivo) {
        return {
            esValido: true,
            mensaje: ""
        };
    }

    // Validar el tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(archivo.type)) {
        return {
            esValido: false,
            mensaje: "Solo se permiten archivos de imagen (JPG, JPEG, PNG, GIF, WebP)"
        };
    }

    // Validar el tamaño del archivo
    const tamanioMaximo = 1024 * 1024; // 1MB
    const tamanioMaximoMB = 1;
    if (archivo.size > tamanioMaximo) {
        return {
            esValido: false,
            mensaje: `La imagen no puede superar los ${tamanioMaximoMB} MB. Tamaño actual: ${(archivo.size / (1024 * 1024)).toFixed(2)} MB.`
        };
    }

    // Comprobar que el archivo tenga contenido
    const tamanioMinimo = 1024; // 1KB
    if (archivo.size < tamanioMinimo) {
        return {
            esValido: false,
            mensaje: "El archivo de la imagen está vacío o es demasiado pequeño."
        };
    }
    
    return {
        esValido: true,
        mensaje: ''
    };
}

function resetearModoCreacion() {
    modoEdicion = false;
    libroEditandoId = null;

    // Restauramos los textos originales
    document.querySelector('form h2').textContent = "Nuevo Libro";
    document.getElementById('btnGuardar').textContent = 'Guardar libro';

    // Eliminar la imagen actual si existe
    const imagenPrevia = document.getElementById('imagen-actual');
    if (imagenPrevia) {
        imagenPrevia.remove();
    }
}
}