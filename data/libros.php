<?php

class Libro {
    //definimos los atributos
    private $id;
    private $titulo;
    private $autor;
    private $genero;
    private $fecha_publicacion;
    private $disponible;

    public function __construct(
        int $id = 0,
        string $titulo ='',
        string $autor = '',
        string $genero = '',
        int $fecha_publicacion = 1,
        bool $disponible = true
        ) 
    {
        $this->id = $id;
        $this->titulo = $titulo;
        $this->autor = $autor;
        $this->genero = $genero;
        $this->fecha_publicacion = $fecha_publicacion;
        $this->disponible = $disponible;
}
    public function getTitulo(){
        return $this->titulo;

    }
    public function getAutor(){
        return $this->autor;
}
    public function setGenero(){
    return $this->genero;
}
    public function getFecha_publicacion(){
    return $this->fecha_publicacion;
}
    public function estaDisponible(){
    return $this->disponible;

}
public function getantiguedad(){
    
    $anyo_actual = date('Y');
    return $anyo_actual - $this->fecha_publicacion;
   
}

public function toString(){
    return ' Titulo: '.$this->titulo . ' Autor: ' . $this->autor;

}
}