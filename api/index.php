<?php

//acepta peticiones desde cualquier origen
header("Access-Control-Allow-Origin: *");
//la respuesta la envía en json con el juego de caracteres utf8
header("Content-Type: application/json; charset=UTF-8");
//acepta las peticiones descritas: GET, POST...
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");


//Incluir los archivos de clases
//Database contiene la clase database que gestiona la conexión con la base de datos
require_once '../config/database.php';
//LibroDB contiene la clase libro DB que realiza las consultas a la tabla libros
require_once '../data/libroDB.php';
//LibroController recibe las peticiones de la tabla libro, las gestiona y devuelve las respuestas
require_once '../controllers/libroController.php';


//Averiguar la URL el método de la request
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Quitar la barra inicial y dividir en segmentos
//Trim en este caso elimina las barras / al principio y al final
//explode divide un stringen segmentos y devuelve un array
$segments = explode('/', trim($requestUri, '/'));

//Compruebo si la direccion es correcta
if($segments[1] !== 'api' || $segments[2] !== 'libros'){
    header('HTTP/1.1 404Not Found');
    echo json_encode(['success' => false, 'error' => 'Endpoint no encontrado']);
    exit();
}
//variable para guardar el id del libro solicitado
$libroId = null;


if(isset($segments[3])){
    $libroId = $segments[3];
};

//Inicio de la base de datos
$database = new Database();
//si viene el id en la dirección lo guardo convierto a entero en $libroId 
$controller = new LibroController($database, $requestMethod, $libroId);

//ya tenemos todos los datos necesarios para procesar la petición

//inicio la base de datos
//se establece la conexión
$database = new Database();


//crea una instancia de LibroController
$controller = new LibroController($database, $requestMethod, $libroId);

//Procesar la petición
$controller->processRequest();

//Cerrar la conexión
$database->close();

