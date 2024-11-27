document.addEventListener("DOMContentLoaded", () => {
    // Función para cargar datos desde el endpoint
    async function loadInboxData() {
        try {
            // Realizar la solicitud GET al endpoint
            const response = await fetch('http://127.0.0.1:5000/api/inbox', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Incluye cookies/sesiones si es necesario
            });

            // Verificar si la respuesta es correcta
            if (!response.ok) {
                throw new Error(`Error al cargar datos: ${response.status} ${response.statusText}`);
            }

            // Obtener los datos en formato JSON
            const data = await response.json();

            // Verificar si los datos están vacíos
            if (data.length === 0) {
                populateInboxTable([]);
                return;
            }

            // Llenar la tabla con los datos obtenidos
            populateInboxTable(data);
        } catch (error) {
            console.error("Error al cargar la bandeja de entrada:", error);

            // Mostrar un mensaje en la tabla si ocurre un error
            const inboxTableBody = document.getElementById("inboxTableBody");
            inboxTableBody.innerHTML = `
                <tr>
                    <td colspan="4">Error al cargar los datos. Por favor, inténtalo más tarde.</td>
                </tr>
            `;
        }
    }

    // Función para crear la etiqueta de estado con el estilo correspondiente
    function createStatusBadge(status) {
        const statusElement = document.createElement("span");
        statusElement.classList.add("status");

        // Añadir la clase correspondiente según el estado
        switch (status.toLowerCase()) {
            case "resuelta":
                statusElement.classList.add("status-accepted");
                statusElement.textContent = "Resuelta";
                break;
            case "en proceso":
                statusElement.classList.add("status-pending");
                statusElement.textContent = "En Proceso";
                break;
            case "pendiente":
                statusElement.classList.add("status-pending");
                statusElement.textContent = "Pendiente";
                break;
            case "rechazada":
                statusElement.classList.add("status-rejected");
                statusElement.textContent = "Rechazada";
                break;
            default:
                statusElement.classList.add("status-unknown");
                statusElement.textContent = "Desconocido";
                break;
        }

        return statusElement;
    }

    // Función para poblar la tabla con los datos obtenidos del servidor
    function populateInboxTable(data) {
        const inboxTableBody = document.getElementById("inboxTableBody");

        // Limpiar la tabla antes de llenarla
        inboxTableBody.innerHTML = "";

        if (data.length === 0) {
            inboxTableBody.innerHTML = `
                <tr>
                    <td colspan="4">No hay solicitudes en tu bandeja de entrada.</td>
                </tr>
            `;
            return;
        }

        // Recorrer los datos y añadir filas
        data.forEach(item => {
            const row = document.createElement("tr");
            
            // Crear las celdas para cada columna
            const cellId = document.createElement("td");
            cellId.textContent = item.id_solicitud;
            
            const cellSolicitud = document.createElement("td");
            cellSolicitud.textContent = item.solicitud_intercambio;
            
            const cellEstado = document.createElement("td");
            // Llamar a la función que crea la etiqueta de estado
            const statusBadge = createStatusBadge(item.estado_solicitud);
            cellEstado.appendChild(statusBadge);
            
            const cellFechaEnviada = document.createElement("td");
            try {
                const fecha = new Date(item.fecha_solicitud).toLocaleDateString();
                cellFechaEnviada.textContent = fecha;
            } catch (error) {
                cellFechaEnviada.textContent = "Fecha inválida";
            }

            // Añadir las celdas a la fila
            row.appendChild(cellId);
            row.appendChild(cellSolicitud);
            row.appendChild(cellEstado);
            row.appendChild(cellFechaEnviada);

            // Añadir la fila a la tabla
            inboxTableBody.appendChild(row);
        });
    }

    // Llamar a la función para cargar los datos al cargar la página
    loadInboxData();
});
