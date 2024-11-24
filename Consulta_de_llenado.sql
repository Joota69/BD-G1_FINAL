USE mydb;


SELECT * FROM informacion_Persona;



INSERT INTO informacion_Persona (idinformacion_Persona, Intercambio_idIntercambio, DNI, Nombre, FechaNacimiento, DireccionCorreo, has_ticket, password) 
VALUES
(1, NULL, '12345678', 'Juan Pérez', '1990-01-01', 'juan.perez@example.com', 1, 'password123'),
(2, NULL, '87654321', 'María López', '1985-05-15', 'maria.lopez@example.com', 0, 'maria2024'),
(3, NULL, '11223344', 'Carlos Sánchez', '1992-07-23', 'carlos.sanchez@example.com', 1, 'carlosSecure'),
(4, NULL, '55667788', 'Ana Torres', '1995-03-12', 'ana.torres@example.com', 1, 'anaPass456'),
(5, NULL, '22334455', 'Luis Martínez', '1988-11-30', 'luis.martinez@example.com', 0, 'martinez@2024'),
(6, NULL, '33445566', 'Sofía Ramírez', '1993-08-25', 'sofia.ramirez@example.com', 1, 'sofiaRamirez!'),
(7, NULL, '44556677', 'Miguel Fernández', '1987-12-05', 'miguel.fernandez@example.com', 0, 'miguel_2023'),
(8, NULL, '55667789', 'Laura Gómez', '1991-09-17', 'laura.gomez@example.com', 1, 'lauraSecure45'),
(9, NULL, '66778899', 'Diego Cruz', '1994-06-20', 'diego.cruz@example.com', 1, 'diegoCruz2023'),
(10, NULL, '77889900', 'Elena Navarro', '1996-02-14', 'elena.navarro@example.com', 0, 'navarro@Pass');


INSERT INTO gustos_Persona (informacion_Persona_idinformacion_Persona, pasatiempos, gustos_musicales, peliculas_favoritas)
VALUES
(1, 'Leer, viajar, cocinar', 'Rock, Jazz', 'El Señor de los Anillos, Inception'),
(2, 'Correr, videojuegos', 'Pop, Electrónica', 'Matrix, Jurassic Park'),
(3, 'Fotografía, senderismo', 'Clásica, Indie', 'Interstellar, La La Land'),
(4, 'Bailar, nadar', 'Reguetón, Salsa', 'Avatar, Titanic'),
(5, 'Escribir, tocar guitarra', 'Blues, Country', 'Forrest Gump, The Green Mile'),
(6, 'Pintar, coleccionar arte', 'Jazz, Alternativa', 'Amélie, El Gran Hotel Budapest'),
(7, 'Pescar, camping', 'Rock, Blues', 'Gladiator, Braveheart'),
(8, 'Programar, leer manga', 'K-Pop, Lo-Fi', 'Your Name, Spirited Away'),
(9, 'Cocinar, jardinería', 'Reggae, Funk', 'Coco, Soul'),
(10, 'Aprender idiomas, meditar', 'Instrumental, Clásica', 'El Pianista, La Vida es Bella');

INSERT INTO direccion_Persona (informacion_Persona_idinformacion_Persona, direccion, departamento, provincia, distrito)
VALUES
(1, 'Av. Arequipa 1234', 'Lima', 'Lima', 'Miraflores'),
(2, 'Jr. Carabaya 567', 'Lima', 'Lima', 'San Isidro'),
(3, 'Calle Los Laureles 890', 'Lima', 'Lima', 'Surco'),
(4, 'Av. Universitaria 321', 'Lima', 'Lima', 'Los Olivos'),
(5, 'Av. Javier Prado 765', 'Lima', 'Lima', 'La Molina'),
(6, 'Calle Las Palmeras 432', 'Lima', 'Lima', 'San Borja'),
(7, 'Jr. Junín 654', 'Lima', 'Lima', 'San Martín de Porres'),
(8, 'Av. La Marina 987', 'Lima', 'Lima', 'Pueblo Libre'),
(9, 'Calle Comercio 345', 'Lima', 'Lima', 'Magdalena del Mar'),
(10, 'Av. Principal 567', 'Callao', 'Callao', 'Ventanilla');


INSERT INTO objeto (informacion_Persona_idinformacion_Persona, Nombre, Descripcion, URL_Imagen, URL_Video)
VALUES
(1, 'Bicicleta', 'Bicicleta de montaña con 21 velocidades', 'https://example.com/img/bicicleta.jpg', 'https://example.com/video/bicicleta.mp4'),
(2, 'Teléfono', 'Teléfono inteligente de última generación', 'https://example.com/img/telefono.jpg', 'https://example.com/video/telefono.mp4'),
(3, 'Cámara', 'Cámara réflex para fotografía profesional', 'https://example.com/img/camara.jpg', 'https://example.com/video/camara.mp4'),
(4, 'Guitarra', 'Guitarra acústica en excelente estado', 'https://example.com/img/guitarra.jpg', 'https://example.com/video/guitarra.mp4'),
(5, 'Laptop', 'Laptop gaming con tarjeta gráfica dedicada', 'https://example.com/img/laptop.jpg', 'https://example.com/video/laptop.mp4'),
(6, 'Escritorio', 'Escritorio de madera con 3 cajones', 'https://example.com/img/escritorio.jpg', 'https://example.com/video/escritorio.mp4'),
(7, 'Libro', 'Libro de fantasía "El Hobbit"', 'https://example.com/img/libro.jpg', 'https://example.com/video/libro.mp4'),
(8, 'Silla', 'Silla ergonómica para oficina', 'https://example.com/img/silla.jpg', 'https://example.com/video/silla.mp4'),
(9, 'Teclado', 'Teclado mecánico retroiluminado', 'https://example.com/img/teclado.jpg', 'https://example.com/video/teclado.mp4'),
(10, 'Monitor', 'Monitor 4K de 27 pulgadas', 'https://example.com/img/monitor.jpg', 'https://example.com/video/monitor.mp4');



INSERT INTO reseñas_objetos (objeto_idobjeto, estado_estético, estado_funcional, estado_garantia)
VALUES
(21, 5, 4, 1), -- Bicicleta: excelente estado estético, funcional, con garantía
(22, 4, 4, 0), -- Teléfono: buen estado estético y funcional, sin garantía
(23, 3, 5, 0), -- Cámara: estado estético moderado, funcional perfecto, sin garantía
(24, 4, 4, 0), -- Guitarra: buen estado general, sin garantía
(25, 5, 5, 1), -- Laptop: excelente estético y funcional, con garantía
(26, 4, 3, 0), -- Escritorio: buen estado estético, funcional con detalles, sin garantía
(27, 3, 5, 1), -- Libro: estado estético moderado, funcional perfecto, con garantía
(28, 5, 5, 1), -- Silla: excelente en todos los aspectos, con garantía
(29, 4, 4, 0), -- Teclado: buen estado general, sin garantía
(30, 5, 5, 1); -- Monitor: excelente en todos los aspectos, con garantía


INSERT INTO reseñas_usuarios (informacion_Persona_idinformacion_Persona, entrega, trato, reputacion)
VALUES
(1, 5, 4, 5), -- Usuario 1: Excelente entrega y trato, reputación alta
(2, 4, 5, 5), -- Usuario 2: Buena entrega, excelente trato, reputación alta
(3, 3, 4, 4), -- Usuario 3: Entrega moderada, buen trato, reputación buena
(4, 4, 4, 4), -- Usuario 4: Consistente en entrega y trato, buena reputación
(5, 5, 5, 5), -- Usuario 5: Excelente en todo
(6, 2, 3, 3), -- Usuario 6: Entrega deficiente, trato aceptable, reputación moderada
(7, 4, 4, 5), -- Usuario 7: Buena entrega y trato, reputación alta
(8, 3, 5, 4), -- Usuario 8: Entrega moderada, excelente trato, buena reputación
(9, 5, 5, 5), -- Usuario 9: Perfecto en todo
(10, 4, 3, 4); -- Usuario 10: Buena entrega, trato moderado, buena reputación



INSERT INTO banco (fecha_de_ingreso, dejado_por, objeto_idobjeto)
VALUES
('2024-01-01 10:00:00', 1, 21), -- Usuario 1 deja el objeto 21
('2024-01-02 14:30:00', 2, 22), -- Usuario 2 deja el objeto 22
('2024-01-03 09:15:00', 3, 23), -- Usuario 3 deja el objeto 23
('2024-01-04 11:45:00', 4, 24), -- Usuario 4 deja el objeto 24
('2024-01-05 16:20:00', 5, 25), -- Usuario 5 deja el objeto 25
('2024-01-06 13:10:00', 6, 26), -- Usuario 6 deja el objeto 26
('2024-01-07 12:50:00', 7, 27), -- Usuario 7 deja el objeto 27
('2024-01-08 15:30:00', 8, 28), -- Usuario 8 deja el objeto 28
('2024-01-09 17:40:00', 9, 29), -- Usuario 9 deja el objeto 29
('2024-01-10 08:00:00', 10, 30); -- Usuario 10 deja el objeto 30


INSERT INTO ticket (idticket,informacion_Persona_idinformacion_Persona, numero_de_ticket, banco_id_banca)
VALUES
(1,1, 'TICKET-001', 1), -- Usuario 1 recibe el ticket relacionado al objeto en el banco 1
(2,2, 'TICKET-002', 2), -- Usuario 2 recibe el ticket relacionado al objeto en el banco 2
(3,3, 'TICKET-003', 3), -- Usuario 3 recibe el ticket relacionado al objeto en el banco 3
(4,4, 'TICKET-004', 4), -- Usuario 4 recibe el ticket relacionado al objeto en el banco 4
(5,5, 'TICKET-005', 5), -- Usuario 5 recibe el ticket relacionado al objeto en el banco 5
(6,6, 'TICKET-006', 6), -- Usuario 6 recibe el ticket relacionado al objeto en el banco 6
(7,7, 'TICKET-007', 7), -- Usuario 7 recibe el ticket relacionado al objeto en el banco 7
(8,8, 'TICKET-008', 8), -- Usuario 8 recibe el ticket relacionado al objeto en el banco 8
(9,9, 'TICKET-009', 9), -- Usuario 9 recibe el ticket relacionado al objeto en el banco 9
(10,10, 'TICKET-010', 10); -- Usuario 10 recibe el ticket relacionado al objeto en el banco 10


INSERT INTO detalles_ticket (ticket_idticket, reclamado_en, redimiendo_ticket)
VALUES
(1, '2024-01-01 10:30:00', NULL), -- Ticket 1 reclamado, no redimido aún
(2, '2024-01-02 14:45:00', NULL), -- Ticket 2 reclamado, no redimido aún
(3, '2024-01-03 09:25:00', NULL), -- Ticket 3 reclamado, no redimido aún
(4, '2024-01-04 12:00:00', NULL), -- Ticket 4 reclamado, no redimido aún
(5, '2024-01-05 17:00:00', NULL), -- Ticket 5 reclamado, no redimido aún
(6, '2024-01-06 13:30:00', NULL), -- Ticket 6 reclamado, no redimido aún
(7, '2024-01-07 12:50:00', NULL), -- Ticket 7 reclamado, no redimido aún
(8, '2024-01-08 16:00:00', NULL), -- Ticket 8 reclamado, no redimido aún
(9, '2024-01-09 18:00:00', NULL), -- Ticket 9 reclamado, no redimido aún
(10, '2024-01-10 08:15:00', NULL); -- Ticket 10 reclamado, no redimido aún
