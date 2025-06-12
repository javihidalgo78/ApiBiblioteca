<?php
if (session_status  () == PHP_SESSION_NONE){
    session_start();
}
//Recibe los datos de login y devuelve si son correctos o no


//comprobar que los datos lleguen
if(isset($_POST['email']) && isset( $_POST['password'])){
    $respuesta = comprobarDatos();
    if($respuesta['error']){
        //reenviamos a login.php
        enviarAlogin();
    }else{
        $resultado = consultarBase();
        if($resultado) {
            header("Location: ../admin/index.php");
            // Aquí puedes manejar el caso cuando $resultado es verdadero
        } else {
            enviarAlogin();
        }
    }
}else{
    enviarAlogin();
}

function enviarAlogin(){
    header("Location: ../admin/login.php");
}

function comprobarDatos() {
    //Limpiar datos
    $email = $_POST['email'];
    $password = $_POST['password'];

    $email = trim($email);
    $email = strtolower($email);
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    if(strlen($password) < 4 || strlen($password) > 15) {
        
        $respuesta['password'] = "La contraseña debe tener entre 4 y 15 caracteres";
        $respuesta['error'] = true;
    }

    // Aquí puedes agregar más validaciones y comprobaciones de usuario

    return $respuesta;
}

function consultarBase(){
    return true;
}