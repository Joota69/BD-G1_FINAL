--  consultar por los tickets que tardaron más de x tiempo en ser
-- redimidos y a quien pertenecían 

SELECT 
    t.numero_de_ticket AS NumeroDeTicket,
    p.Nombre AS Nombre,
    dt.reclamado_en AS FechaObtenido,
    dt.redimiendo_ticket AS FechaRedimido,
    TIMESTAMPDIFF(HOUR, dt.reclamado_en, dt.redimiendo_ticket) AS DiferenciaEnHoras
FROM 
    ticket t
JOIN 
    informacion_Persona p ON t.informacion_Persona_idinformacion_Persona = p.idinformacion_Persona
JOIN 
    detalles_ticket dt ON t.idticket = dt.ticket_idticket
WHERE 
    dt.redimiendo_ticket IS NOT NULL
    AND TIMESTAMPDIFF(HOUR, dt.reclamado_en, dt.redimiendo_ticket) > 1
ORDER BY 
    DiferenciaEnHoras DESC;


-- a persona con más objetos y más tickets mejor valorados
SELECT 
    p.Nombre AS Persona,
    COUNT(o.informacion_Persona_idinformacion_Persona) AS NumeroDeObjetos
FROM 
    objeto o
JOIN 
    informacion_Persona p ON o.informacion_Persona_idinformacion_Persona = p.idinformacion_Persona
GROUP BY 
    p.idinformacion_Persona
ORDER BY 
    NumeroDeObjetos DESC
LIMIT 1;
-- con más tickets

SELECT 
    p.Nombre AS Persona,
    COUNT(t.idticket) AS NumeroDeTickets
FROM 
    ticket t
JOIN 
    informacion_Persona p ON t.informacion_Persona_idinformacion_Persona = p.idinformacion_Persona
GROUP BY 
    p.idinformacion_Persona
ORDER BY 
    NumeroDeTickets DESC
LIMIT 1;

-- mejor valorada

SELECT 
    p.Nombre AS Persona,
    AVG(ru.reputacion) AS ReputacionPromedio,
    AVG(ru.entrega) AS EntregaPromedio,
    AVG(ru.trato) AS TratoPromedio
FROM 
    reseñas_usuarios ru
JOIN 
    informacion_Persona p ON ru.informacion_Persona_idinformacion_Persona = p.idinformacion_Persona
GROUP BY 
    p.idinformacion_Persona
ORDER BY 
    AVG(ru.reputacion) DESC, 
    AVG(ru.entrega) DESC, 
    AVG(ru.trato) DESC
LIMIT 1;

-- calificacion promedio de cada usuario

SELECT 
    p.Nombre AS Usuario,
    p.DireccionCorreo AS Correo,
    ROUND((AVG(ru.trato) + AVG(ru.entrega) + AVG(ru.reputacion)) / 3, 2) AS CalificacionPromedio
FROM 
    reseñas_usuarios ru
JOIN 
    informacion_Persona p ON ru.informacion_Persona_idinformacion_Persona = p.idinformacion_Persona
GROUP BY 
    p.idinformacion_Persona
ORDER BY 
    CalificacionPromedio DESC;


-- calificación promedio de cada objeto

SELECT 
    o.Nombre AS Objeto,
    o.Descripcion AS Descripcion,
    ro.`estado_estético` AS EstadoEstetico,
    ro.estado_funcional AS EstadoFuncional,
    ro.estado_garantia AS Garantia,
    ROUND(
        (ro.`estado_estético` * 0.4) + 
        (ro.estado_funcional * 0.4) + 
        (ro.estado_garantia * 5 * 0.2), 2
    ) AS NotaFinal
FROM 
    objeto o
JOIN 
    reseñas_objetos ro ON ro.objeto_idobjeto = o.idobjeto
ORDER BY 
    NotaFinal DESC; 
