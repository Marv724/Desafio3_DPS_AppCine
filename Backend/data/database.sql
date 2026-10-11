
TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  clave VARCHAR(255) NOT NULL,
  rol ENUM('cliente','personal') NOT NULL DEFAULT 'cliente'
);

TABLE cines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  latitud DECIMAL(10,7) NOT NULL,
  longitud DECIMAL(10,7) NOT NULL
);

TABLE salas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cine_id INT NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  filas INT NOT NULL,
  columnas INT NOT NULL,
  FOREIGN KEY (cine_id) REFERENCES cines(id) ON DELETE CASCADE
);

TABLE peliculas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  genero VARCHAR(50),
  duracion INT,
  clasificacion VARCHAR(10),
  precio DECIMAL(8,2) NOT NULL,
  estado ENUM('disponible','no_disponible') NOT NULL DEFAULT 'disponible',
  CONSTRAINT chk_precio CHECK (precio >= 0)
);

TABLE funciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pelicula_id INT NOT NULL,
  sala_id INT NOT NULL,
  fecha_hora DATETIME NOT NULL,
  estado ENUM('programada','cancelada','finalizada') NOT NULL DEFAULT 'programada',
  UNIQUE (sala_id, fecha_hora),
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id),
  FOREIGN KEY (sala_id) REFERENCES salas(id)
);

TABLE reservas (
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

TABLE reserva_asientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id INT NOT NULL,
  funcion_id INT NOT NULL,
  asiento VARCHAR(5) NOT NULL,
  UNIQUE (funcion_id, asiento),
  FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
  FOREIGN KEY (funcion_id) REFERENCES funciones(id)
);

TABLE dispositivos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  expo_push_token VARCHAR(255) NOT NULL UNIQUE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

INSERT INTO usuarios (nombre, correo, clave, rol) VALUES
('Personal Demo', 'personal@cine.com', 'abcde', 'personal'),
('Cliente Demo',  'cliente@cine.com',  '12345',  'cliente');

INSERT INTO cines (nombre, direccion, latitud, longitud) VALUES
('Cine Metrocentro', 'Blvd. de los Héroes, San Salvador', 13.7060000, -89.2100000),
('Cine Multiplaza',  'Calle El Pedregal, Antiguo Cuscatlán', 13.6770000, -89.2540000);

INSERT INTO salas (cine_id, nombre, filas, columnas) VALUES
(1, 'Sala 1', 8, 10), (1, 'Sala 2', 8, 10),
(2, 'Sala 1', 8, 10), (2, 'Sala 2', 8, 10);

INSERT INTO peliculas (codigo, nombre, genero, duracion, clasificacion, precio) VALUES
('PEL001', 'Aventura Espacial', 'Ciencia ficción', 120, 'B', 5.50),
('PEL002', 'Risas en Familia',  'Comedia',         95, 'A', 4.50),
('PEL003', 'La Noche Oscura',   'Terror',         105, 'C', 5.50),
('PEL004', 'Corazones',         'Romance',        110, 'B', 5.00),
('PEL005', 'Misión Final',      'Acción',         130, 'B', 6.00),
('PEL006', 'Mundo Animado',     'Animación',       90, 'A', 4.00);

INSERT INTO funciones (pelicula_id, sala_id, fecha_hora)
SELECT 1 + MOD(s.id + d.n + h.k, 6), s.id,
       TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL d.n DAY), h.hora)
FROM salas s
CROSS JOIN (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
            UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) d
CROSS JOIN (SELECT 0 AS k, '15:00:00' AS hora UNION ALL SELECT 1, '19:00:00') h;