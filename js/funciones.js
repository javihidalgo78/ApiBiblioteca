//Crear evento para que se ejecute

document.addEventListener('DOMContentLoaded', () => {
    const url = 'http://localhost/ApiBiblioteca/api/libros'; 


//realizar la llamada a la api para conseguir los datos
fetch(url)
.then(response => response.json())
.then(data => mostrarLibros(data))
.catch(error => console.error('Error:', error));
})

function mostrarLibros(datos){
    console.log(datos.count)
    console.log(datos.success)
    console.log(datos.data)

    if(datos.success && datos.count > 0){
        const libros = datos.data;
        //TODO muestro libros por pantalla
        document.getElementById('divLibros').innerHTML =
        libros.map(libro => `
            <h3>${libro.titulo}</h3>
            <p>${libro.autor}</p>
            <img src="img/Peques/${libro.Imagen}">
            <p>${libro.resumen}</p>
            <p>${libro.fecha_publicacion}</p>
            <p>${libro.genero}</p>
            `).join(' ')

    }else if(datos.count == 0){
        document.getElementById('divLibros').innerHTML = "<p>No hay libros</p>";

    }

    

    //document.getElementById('divLibros').innerHTML =

    
}