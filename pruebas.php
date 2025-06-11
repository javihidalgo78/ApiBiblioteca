<?php

require_once './data/libros.php';

$ElPrincipito = new Libro(1,'El Principito','Antoine de Saint-Exupery', 'Fantasía','1943', false);
$IslaTesoro = new Libro (2,'La Isla del Tesoro','Robert Louis Stevenson', 'Aventuras', '1883', true) ;
$_1984 = new Libro (3,'1984','George Orwell', 'Ficcion', '1949', true) ;
$_100Anios = new Libro (4,'100 años de Soledad','Gabriel García Márquez', 'Magía',  '1967', true) ;
$harry_potter = new Libro (5,'Harry Potter y la Piedra Filosofal','JK Rowling','Fantasía', '1997', true) ;

$noEstaEscrito = new Libro (titulo: "No está escrito");

echo $ElPrincipito->getTitulo();
echo '<br>';
echo '<br>';
echo $ElPrincipito->getAutor();
echo '<br>';
echo '<br>';
echo $ElPrincipito->setGenero();
echo'<br>';
echo '<br>';
echo $ElPrincipito->toString();
echo '<br>';
echo '<br>';
echo "Hace " . $ElPrincipito->getAntiguedad() . " años que se publicó";
echo "<br>";
echo "<br>";

echo $harry_potter->toString();
echo "<br>";
echo "<br>";
echo "Hace " . $harry_potter->getAntiguedad() . " años que se publicó";