document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = 'http://127.0.0.1:5000/api/inbox';

    // Función para cargar datos del inbox
    async function loadInboxData() {
        try {
            // Realizar solicitud GET al endpoint de Flask
            const response = await fetch(API_BASE_URL, {
                method: 'GET',
                credentials: 'include', // Incluye cookies para autenticación
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error al cargar datos: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            populateInboxTable(data);
        } catch (error) {
            console.error('Error al cargar la bandeja de entrada:', error);
            showErrorMessage();
        }
    }

    // Función para llenar la tabla con los datos del inbox
    function populateInboxTable(data) {
        const tableBody = document.getElementById('inboxTableBody');
        tableBody.innerHTML = ''; // Limpia la tabla antes de llenarla

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="no-data">No hay solicitudes en tu bandeja de entrada.</td>
                </tr>
            `;
            return;
        }

        data.forEach(request => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${request.id_solicitud}</td>
                <td>${request.solicitud_intercambio}</td>
                <td>
                    <span class="status ${getStatusClass(request.estado_solicitud)}">
                        ${request.estado_solicitud}
                    </span>
                </td>
                <td>${new Date(request.fecha_solicitud).toLocaleString()}</td>
            `;

            tableBody.appendChild(row);
        });
    }

    // Función para manejar errores al cargar datos
    function showErrorMessage() {
        const tableBody = document.getElementById('inboxTableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="no-data">Error al cargar los datos del servidor.</td>
            </tr>
        `;
    }

    // Función para asignar estilos al estado
    function getStatusClass(status) {
        switch (status.toLowerCase()) {
            case 'aceptada': return 'status-accepted';
            case 'rechazada': return 'status-rejected';
            case 'pendiente': return 'status-pending';
            default: return '';
        }
    }

    // Cargar datos del inbox al cargar la página
    loadInboxData();
});
