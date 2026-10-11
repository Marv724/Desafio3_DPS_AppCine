CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  clave VARCHAR(255) NOT NULL,
  rol ENUM('cliente','personal') NOT NULL DEFAULT 'cliente'
);

CREATE TABLE cines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  latitud DECIMAL(10,7) NOT NULL,
  longitud DECIMAL(10,7) NOT NULL
);

CREATE TABLE salas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cine_id INT NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  filas INT NOT NULL,
  columnas INT NOT NULL,
  FOREIGN KEY (cine_id) REFERENCES cines(id) ON DELETE CASCADE
);

CREATE TABLE peliculas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  genero VARCHAR(50),
  duracion INT,
  clasificacion VARCHAR(10),
  precio DECIMAL(8,2) NOT NULL,
  estado ENUM('activa','inactiva') NOT NULL DEFAULT 'activa',
  CONSTRAINT chk_precio CHECK (precio >= 0)
);

CREATE TABLE funciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pelicula_id INT NOT NULL,
  sala_id INT NOT NULL,
  fecha_hora DATETIME NOT NULL,
  estado ENUM('programada','cancelada','finalizada') NOT NULL DEFAULT 'programada',
  UNIQUE (sala_id, fecha_hora),
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id),
  FOREIGN KEY (sala_id) REFERENCES salas(id)
);

CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  usuario_id INT NOT NULL,
  funcion_id INT NOT NULL,
  total DECIMAL(8,2) NOT NULL,
  estado ENUM('activa','utilizada','cancelada') NOT NULL DEFAULT 'activa',
  creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (funcion_id) REFERENCES funciones(id)
);

CREATE TABLE reserva_asientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id INT NOT NULL,
  funcion_id INT NOT NULL,
  asiento VARCHAR(5) NOT NULL,
  UNIQUE (funcion_id, asiento),
  FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
  FOREIGN KEY (funcion_id) REFERENCES funciones(id)
);

CREATE TABLE dispositivos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  expo_push_token VARCHAR(255) NOT NULL UNIQUE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);