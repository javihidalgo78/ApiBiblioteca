<?php
/**
 * Se encarga de interactuar con la base de datos
 */
class LibroDB {

    private $db;
    private $table = 'libros';
    //recibe una conexión ($database) a una base de datos y la mete en $db
    public function __construct($database){
        $this->db = $database->getConexion();
    }

    // Crear tabla si no existe
    public function createTable() {
        $sql = "CREATE TABLE IF NOT EXISTS {$this->table} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(100) NOT NULL,
            autor VARCHAR(100) NOT NULL,
            genero VARCHAR(100) NOT NULL,
            fecha_publicacion INT(4) NOT NULL,
            disponible BOOLEAN DEFAULT TRUE,
            imagen VARCHAR(100),
            favorito BOOLEAN DEFAULT FALSE,
            resumen TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
                
        return $this->db->query($sql);
    }

    //extrae todos los datos de la tabla $table
    public  function getAll(){
        //construye la consulta
        $sql = "SELECT * FROM {$this->table}";
        //$sql = "SELECT * FROM {$this->table} ORDER BY DESC";

        //realiza la consulta con la función query()
        $resultado = $this->db->query($sql);

        //comprueba si hay respuesta ($resultado) y si la respuesta viene con datos
        if($resultado && $resultado->num_rows > 0){
            //crea un array para guardar los datos
            $libros = [];
            //en cada vuelta obtengo un array asociativo con los datos de una fila y lo guardo en la variable $row
            //cuando ya no quedan filas que recorrer termina el bucle
            while($row = $resultado->fetch_assoc()){
                //al array libros le añado $row 
                $libros[] = $row;
            }
            //devolvemos el resultado
            return $libros;
        }else{
            //no hay datos, devolvemos un array vacío
            return [];
        }
        
    }

    //obtener libro por id
    public function getById($id){
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        if($stmt){
            //añado un parámetro a la consulta
            //este va en el lugar de la ? en la variable $sql
            //"i" es para asegurarnos de que el parámetro es un número entero
            $stmt->bind_param("i", $id);
            //ejecuta la consulta
            $stmt->execute();
            //lee el resultado de la consulta
            $result = $stmt->get_result();

            //comprueba si en el resultado hay datos o está vacío
            if($result->num_rows > 0){
                //devuelve un array asociativo con los datos
                return $result->fetch_assoc();
            }
            //cierra 
            $stmt->close();
        }
        //algo falló
        return null;
    }

//crear un nuevo libro
public function create($data){
    $sql = "INSERT INTO {$this->table} 
        (titulo, autor, genero, fecha_publicacion, disponible, imagen, favorito, resumen)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $this->db->prepare($sql);

    if($stmt){
        //compruebo los datos opcionales
        $genero = isset($data['genero']) ? $data['genero'] : null;
        $fecha_publicacion = isset($data['fecha_publicacion']) ? $data['fecha_publicacion'] : null;
        $disponible = isset($data['disponible']) ? (int)(bool)$data['disponible'] : 1;
        $imagen = isset($data['imagen']) ? $data['imagen'] : '';
        $favorito = isset($data['favorito']) ? (int)(bool)$data['favorito'] : 0;
        $resumen = isset($data['resumen']) ? $data['resumen'] : null;

        $stmt->bind_param(
            "sssiisis",
            $data['titulo'],
            $data['autor'],
            $genero,
            $fecha_publicacion,
            $disponible,
            $imagen,
            $favorito,
            $resumen
        );

        if($stmt->execute()){
            //obtengo el id del libro que se acaba de crear
            $id = $this->db->insert_id;
            $stmt->close();
            //devuelve todos los datos del libro
            return $this->getById($id);
        }
        $stmt->close();
    }
    return false;
}

//Actualizar libro
public function update($id, $data){
            $sql = "UPDATE {$this->table} SET 
                titulo = ?, 
                autor = ?, 
                genero = ?, 
                fecha_publicacion = ?, 
                disponible = ?,
                imagen = ?,
                favorito = ?,
                resumen = ? 
                WHERE id = ?";

        //Leer los datos actuales
        $libro = $this->getById($id);
        if($libro){
            return false;
        }

        $titulo = isset($data["titulo"]) ? $data["titulo"] : $libro['titulo'];
        $autor = isset($data["autor"]) ? $data["auto"] : $libro['autor'];
        $genero = isset($data['genero']) ? $data['genero'] : $libro['genero'];
        $fecha_publicacion = isset($data['fecha_publicacion']) ? $data['fecha_publicacion']   : $libro['fecha_publicacion'];
        $disponible = isset($data['disponible']) ? (bool)$data['disponible'] : true;
        $imagen = isset($data['imagen']) ? $data['imagen'] : '';
        $favorito = isset($data['favorito']) ? (int)(bool)$data['favorito'] : 0;
        $resumen = isset($data['resumen']) ? $data['resumen'] : '';
     
        $stmt = $this->db->prepare($sql);
        
        if ($stmt) {
            

            $stmt->bind_param(
                "sssiisisi",
                $titulo,
                $autor,
                $genero,
                $fecha_publicacion,
                $disponible,
                $imagen,
                $favorito,
                $resumen,
                $id
            );
            
            if ($stmt->execute()) {
                $stmt->close();
                //devuelve todos los datos del libro que actualizar
                return $this->getById($id);
            }
            
            $stmt->close();
        }
        
        return false;
}

    // Eliminar un libro
    public function delete($id) {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        
        if ($stmt) {
            $stmt->bind_param("i", $id);
            $result = $stmt->execute();
            $stmt->close();
            return $result;
        }
        
        return false;
    }

    // Buscar libros por título o autor
    public function search($query) {
        $sql = "SELECT * FROM {$this->table} WHERE titulo LIKE ? OR autor LIKE ?";
        $stmt = $this->db->prepare($sql);
        
        if ($stmt) {
            $searchTerm = "%{$query}%";
            $stmt->bind_param("ss", $searchTerm, $searchTerm);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $libros = [];
            while ($row = $result->fetch_assoc()) {
                $libros[] = $row;
            }
            
            $stmt->close();
            return $libros;
        }
        
        return [];
    }    

    // Obtener libros disponibles
    public function getAvailable() {
        $sql = "SELECT * FROM {$this->table} WHERE disponible = 1 ORDER BY titulo";
        $result = $this->db->query($sql);
        
        if ($result && $result->num_rows > 0) {
            $libros = [];
            while ($row = $result->fetch_assoc()) {
                $libros[] = $row;
            }
            return $libros;
        }
        
        return [];
    }    

}