<?php

/**
 * Crear la clase usuario con los siguientes atributos:
 * id, nombre, password, email, activo(booleano)
 * Todos los atributos tienen que ser privados
 * 
 * Crear un constructor con todos los campos y activo con valor true por defecto
 * Crear los getters para todos los atributos
 * Crear setters para password y activo
 * Crear un toString que muestre los datos del Usuario
 */

 class Usuario {
    //definimos los atributos
    private $id;
    private $nombre;
    private $password;
    private $email;
    private $activo;

public function __construct($id, $nombre, $password, $email, $activo = true) {
    $this->id = $id;
    $this->nombre = $nombre;
    $this->password = $password;
    $this->email = $email;
    $this->activo = $activo;

 }
 
 public function getNombre() {
    return $this->nombre;
 }

 public function getEmail() {
    return $this->email;
 }
 public function setPassword($password) {
    $this->password = $password;
}


  public function isPassword($password) {
    return $this->password;
  }

 public function setActivo($activo) {
    $this->activo = $activo;
 }
 
 public function isActivo() {
    return $this->activo;
 }

 public function toString() {
      $activo = $this->activo ? "Si" : "No";
    return ' Nombre: ' .$this->nombre . ' Password: '.$this->password . ' E-mail : ' . $this->email  . ' Activo: ' . $activo ;
  
}
}
