const url = 'http://localhost/ApiBiblioteca/api/libros';

let librosData = [] //almacenar los datos de todos los libros
let modoEdicion = false //para saber si estamos creando o editando
let libroEditandoId = null // ID del libro que se está editando

document.addEventListener('DOMContentLoaded', () => {
    
    //realizo la llamada a la api para conseguir los datos
    fetch(url)
        .then(response => response.json())
        .then(data => mostrarLibros(data))
        .catch(error => console.error('Error:', error));

    document.getElementById("crear").addEventListener('click', () => {
        // si document.querySelector('form').style.display devuelve un valor vacío 
        // estado toma el segundo valor none
        const estado = document.querySelector('form').style.display || 'none';
        if(estado === 'none'){
            document.querySelector('form').style.display = 'grid'
            document.getElementById("crear").textContent = 'Ocultar formulario'
        }else{
            document.querySelector('form').style.display = 'none'
            document.getElementById("crear").textContent = 'Crear nuevo libro'
        }
        if(modoEdicion){
            resetearModoCreacion()
        } 
    })

    document.querySelector('form').addEventListener('submit', enviarDatosNuevoLibro)
})

function mostrarLibros(datos){

    const libros = datos.data;
    librosData = libros
    console.log(libros)
    console.log(datos)

    if(datos.success && datos.count > 0){
        document.getElementById('tablaLibros').innerHTML = 
            "<tr class='cabeceras'>" +
            Object.keys(libros[0]).map(clave =>  
            `
                <td>${clave.toUpperCase()}</td>
                ${
                    clave == 'resumen' ? '<td class="centrado" colspan="2">Acciones</td>' : ''
                }
            `
            ).join('')
            + "</tr>"


        document.getElementById('tablaLibros').innerHTML += 
        libros.map(libro => `
            <tr>
                <td>${libro.id}</td>
                <td>${libro.titulo}</td>
                <td>${libro.autor}</td>
                <td>${libro.genero}</td>
                <td>${libro.fecha_publicacion}</td>
                <td>${(libro.imagen && libro.imagen.trim() !== '') ? `<img src="../img/peques/${libro.imagen}?${new Date().getTime()}" alt="${libro.titulo}" />` : 'Sin imagen'}</td>
                <td class="centrado">${(libro.disponible == 1) ? "Sí" : "No"}</td>
                <td class="centrado">${(libro.favorito == 1) ? "Sí" : "No"}</td>
                <td>${(libro.resumen !== null && libro.resumen.length > 0) ? libro.resumen.substring(0, 100)+"..." : ''}</td>
                <td>
                    <button onclick="editarLibro(${libro.id})">Editar</button>
                </td>
                <td>
                    <button onclick="eliminarLibro(${libro.id}, '${libro.titulo}')" class="btn-delete">Eliminar</button>
                </td>
            </tr>
            `).join(' ')


    }else if(datos.count == 0){
        document.getElementById('divLibros').innerHTML = "<p>No hay libros</p>";
    }
}

function eliminarLibro(id, titulo){
    const confirma = confirm(`¿Seguro que quieres eliminar el libro: ${titulo}?`)

    if(!confirma){
        return
    }

    //El usuario ha confirmado que quiere eliminar el libro
    fetch(`${url}/${id}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => libroEliminado(data))
        .catch(error => console.error('Error:', error));
}

function libroEliminado(data){
    if(data.success){
    fetch(url)
        .then(response => response.json())
        .then(data => mostrarLibros(data))
        .catch(error => console.error('Error:', error));
    }else{
        alert("Hubo un problema al eliminar el libro")
    }
}

function editarLibro(id){
    //ir al inicio de la página de manera suave
    window.scrollTo({top: 0, behavior: 'smooth'})

    //buscamos el libro que queremos modificar
    const libro = librosData.find(lib => lib.id == id)

    if(libro){
        //activar el modo edicion
        modoEdicion = true
        libroEditandoId = id

        //rellenamos el formulario con los datos del libro que queremos editar
        rellenarFormularioEdicion(libro)

        //mostramos formulario en modo edicion
        mostrarFormularioEdicion()
    } else {
        alert("Error: No se encontraron los datos del libro")
    }
}

function rellenarFormularioEdicion(libro){
    document.getElementById('titulo').value = libro.titulo || ''
    document.getElementById('autor').value = libro.autor || ''
    document.getElementById('genero').value = libro.genero || ''
    document.getElementById('fecha_publicacion').value = libro.fecha_publicacion || ''
    document.getElementById('disponible').checked = libro.disponible == 1
    document.getElementById('favorito').checked = libro.favorito == 1
    document.getElementById('resumen').value = libro.resumen || ''

    //limpiar el campo de la imagen
    document.getElementById('imagen').value = ''

    //mostrar la imagen actual si existe
    mostrarImagenActual(libro.imagen, libro.titulo)
}

function mostrarFormularioEdicion(){
    //Mostrar formulario
    document.querySelector('form').style.display = 'grid'

    //cambiar los textos para el modo edicion
    document.querySelector('form h2').textContent = "Editar libro"
    document.getElementById('btnGuardar').textContent = "Actualizar libro"
    document.getElementById("crear").textContent = "Ocultar formulario"
}

function mostrarImagenActual(imagen, titulo){
    //Eliminar imagen previa si existe
    const imagenPrevia = document.getElementById('imagen-actual')
    if(imagenPrevia){
        imagenPrevia.remove()
    }

    //comprobar que el libro tiene imagen
    if(imagen && imagen.trim() !== ''){
        //Crear un elemento para mostrar la imagen actual
        const divImagen = document.createElement('div')
        divImagen.id = 'imagen-actual'
        divImagen.innerHTML = `
            <p><strong>Imagen actual</strong></p>
            <img class="imagenEditar" src="../img/peques/${imagen}?${new Date().getTime()}" alt="${titulo}" />
            <p>Selecciona una nueva imagen para reemplazarla</p>
        `
        //Mostrar el divImagen después del input de imagen
        const inputImagen = document.getElementById('imagen')
        inputImagen.before(divImagen)
    }
}

function enviarDatosNuevoLibro(e){
    //detener el envío del formulario
    e.preventDefault(); 

    const mensajesError = document.querySelectorAll('.error')
    const titulo = document.getElementById('titulo').value.trim()
    const autor = document.getElementById('autor').value.trim()
    const genero = document.getElementById('genero').value.trim()
    const fecha_publicacion = parseInt(document.getElementById('fecha_publicacion').value)
    const imagen = document.getElementById('imagen').files[0]
    const disponible = document.getElementById('disponible').checked 
    const favorito = document.getElementById('favorito').checked
    const resumen = document.getElementById('resumen').value.trim()

    //Limpiar mensajes de error previos
    mensajesError.forEach(elemento => elemento.textContent = '')    

    let errores = false

    //realizar las validaciones
    if(!titulo){
        document.getElementById('error-titulo').textContent = "El título es obligatorio"
        errores = true
    }

    if(!autor){
        document.getElementById('error-autor').textContent = "El autor es obligatorio"
        errores = true
    }

    const anioActual = new Date().getFullYear();
    if(isNaN(fecha_publicacion) || fecha_publicacion < 1000 || fecha_publicacion > anioActual + 1){
        document.getElementById('error-publicacion').textContent = "La fecha de publicación debe ser un año válido (4 dígitos)."
        errores = true
    }

    if(resumen.length > 1000){
        document.getElementById('error-resumen').textContent = "El resumen no puede superar los 1000 caracteres."
        errores = true
    }

    //comprobar el archivo de imagen
    if(imagen){
        const validacionImagen = validarImagen(imagen)
        if(!validacionImagen.esValido){
            document.getElementById('error-imagen').textContent = validacionImagen.mensaje
            errores = true
        }
    }

    if(errores) return //si hay errores no se envía el formulario

    //Si estamos aquí los datos del formulario son válidos
    // const datos = {
    //     titulo: titulo,
    //     autor: autor,
    //     genero: genero,
    //     fecha_publicacion: fecha_publicacion,
    //     disponible: disponible,
    //     favorito: favorito,
    //     resumen: resumen
    // }

    //Si no ponemos el nombre de la clave, se crea una con el mismo nombre de la variable
    const datos = {
        titulo,
        autor,
        genero,
        fecha_publicacion,
        disponible,
        favorito,
        resumen
    }

    const formData = new FormData();
    formData.append("datos", JSON.stringify(datos))

    if(imagen){
        formData.append("imagen", imagen)
    }
    
    const metodo = 'POST'
    const urlPeticion = modoEdicion ? `${url}/${libroEditandoId}` : url
    const mensajeExito = modoEdicion ? "Libro actualizado con éxito" : "Libro guardado con éxito"
    //si estamos en modo edicion añadimos un parámetro _method 
    if(modoEdicion){
        formData.append("_method", "PUT")
    }

    fetch(urlPeticion, {
        method: metodo,
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            alert(mensajeExito)
            //limpio el formulario
            document.querySelector('form').reset()
            //oculto el formulario
            document.querySelector('form').style.display = "none"
            //cambio el texto del boton
            document.getElementById("crear").textContent = "Crear nuevo libro"

            resetearModoCreacion()

            //volvemos a pedir todos los libros
            cargarLibros()
        }else{
            alert("Oppss ocurrió algún error " , data.error)
        }
    })
    .catch(error => {
        console.error("Error al enviar datos: ", error)
        const accion = modoEdicion ? "actualizar" : "guardar"
        alert(`Error al ${accion} el libro`)
    })
}

function cargarLibros(){
    fetch(url)
    .then(response => response.json())
    .then(data => mostrarLibros(data))
    .catch(error => console.error('Error:', error))
}

function validarImagen(archivo){
    console.log('Archivo tipo: ' , archivo.type)
    console.log('Tamaño del archivo: ', archivo.size)
    //si no hay archivo pasa la  validación
    if(!archivo){
        return {
            esValido: true, 
            mensaje: ""
        }
    }

    //Validar el tipo de  archivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if(!tiposPermitidos.includes(archivo.type)){
        return {
            esValido: false,
            mensaje: "Solo se permiten archivos de imagen (JPG, JPEG, PNG, GIF, WebP)"
         }
    }

    //validar el tamaño del archivo
    const tamanioMaximo = 1024 * 1024
    const tamanioMaximoMB = 1
    if(archivo.size > tamanioMaximo){
        return {
            esValido: false,
            mensaje: `La imagen no puede superar los ${tamanioMaximoMB} MB. Tamaño actual: ${(archivo.size / (1024 * 1024)).toFixed(2)} MB.`
         }
    }

    //comprobar que el archivo tenga contenido
    const tamanioMinimo = 1024
    if(archivo.size < tamanioMinimo){
        return {
            esValido: false,
            mensaje: "El archivo de la imagen está vacío o es demasiado pequeño."
         }
    }
    return {
        esValido: true,
        mensaje: ''
    }

}

function resetearModoCreacion(){
    modoEdicion = false
    libroEditandoId = null

    //Restauramos los textos originales
    document.querySelector('form h2').textContent = "Nuevo Libro"
    document.getElementById('btnGuardar').textContent = 'Guardar libro'

    //Eliminar la imagen actual si existe
    const imagenPrevia = document.getElementById('imagen-actual')
    if(imagenPrevia){
        imagenPrevia.remove()
    }

    document.querySelector('form').reset()
}