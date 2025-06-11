<?php

require_once './data/usuario.php';

$Usuario_1 = new Usuario(1, 'Fran', '1234', 'fran1@gmail.com', false);
$Usuario_2 = new Usuario(2, 'Javi', '1234', 'javi1@gmail.com', true);
$Usuario_3 = new Usuario(3, 'Lucía', '1234', 'lucia1@gmail.com', true);
$Usuario_4 = new Usuario(4, 'Reich', '1234', 'reich1@gmail.com', true);

echo '<br>';
echo $Usuario_1->toString();
echo '<br>';
echo '<br>';
echo $Usuario_2->toString();
echo '<br>';
echo '<br>';
echo $Usuario_3->toString();
echo '<br>';
echo '<br>';
echo $Usuario_4->toString();
echo '<br>';
echo '<br>';