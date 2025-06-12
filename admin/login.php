<?php
/**
 * Para guardar los datos de una sesión en php se utiliza la variable superglobal
 * $_SESSION es un array asociativo
 * 
 * Para usar esta variable tenemos que iniciar sesión
 * session_start()
 */
if (session_status  () == PHP_SESSION_NONE){
    session_start();
}

 //Comprobar si el usuario ya está logueado

//Mostrar formulario que pida email y contraseña

//Comprobar que los datos sean correctos

//Si son correctos, iniciar sesión y redirigir a index

//Si no son correctos mostrar mensaje de error

?>
 <!DOCTYPE html>
 <html lang="es">
 <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="css/login.css">
    
 </head>
 <body>
  <div class="container">  
    <form method="post" action="../controllers/usuarioController.php" usuario>
    <input type="email" name="email" required
    placeholder="Correo electrónico">
    <input type="password" name="password" required
    placeholder="Contraseña">
    <input type="submit" name="login" 
    value="Iniciar sesión">
</form>
<?php
if (isset($_SESSION['mensaje'])) {
    echo "<div class='error'>" . $_SESSION['mensaje'] . "</div>";
    unset($_SESSION['mensaje']);
}
?>
</div>
 </body>
 </html>




