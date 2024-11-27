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
                    <td colspan="5" class="no-data">No hay solicitudes en tu bandeja de entrada.</td>
                </tr>
            `;
            return;
        }

        data.forEach(request => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${request.id_solicitud}</td>
                <td>${request.objeto_pedido}</td>
                <td>${request.objeto_ofrecido}</td>
                <td>
                    <select class="status-dropdown" data-id="${request.id_solicitud}">
                        <option value="pendiente" ${request.estado_solicitud === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="aceptada" ${request.estado_solicitud === 'aceptada' ? 'selected' : ''}>Aceptada</option>
                        <option value="rechazada" ${request.estado_solicitud === 'rechazada' ? 'selected' : ''}>Rechazada</option>
                    </select>
                </td>
                <td>${new Date(request.fecha_solicitud).toLocaleString()}</td>
            `;

            tableBody.appendChild(row);
        });

        document.querySelectorAll('.status-dropdown').forEach(dropdown => {
            dropdown.addEventListener('change', async (event) => {
                const idSolicitud = event.target.getAttribute('data-id');
                const nuevoEstado = event.target.value;

                try {
                    const response = await fetch('http://127.0.0.1:5000/update_inbox_status', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id_solicitud: idSolicitud,
                            nuevo_estado: nuevoEstado,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Error al actualizar el estado');
                    }

                    alert('Estado actualizado correctamente');
                } catch (error) {
                    alert('Error al actualizar el estado');
                }
            });
        });
    }

    // Función para manejar errores al cargar datos
    function showErrorMessage() {
        const tableBody = document.getElementById('inboxTableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-data">Error al cargar los datos del servidor.</td>
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