// Fetch inbox data dynamically from the API
async function fetchInboxData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/inbox/<int:request_id>');
        if (!response.ok) {
            throw new Error('Failed to fetch inbox data');
        }
        const inboxData = await response.json();
        populateInboxTable(inboxData);
    } catch (error) {
        console.error('Error fetching inbox data:', error);
    }
}

// Populate the inbox table
function populateInboxTable(inboxData) {
    const tableBody = document.getElementById('inboxTableBody');
    tableBody.innerHTML = ''; // Clear existing rows
    inboxData.forEach(request => {
        const row = document.createElement('tr');
        row.addEventListener('click', () => openRequestDetail(request.id_solicitud));
        row.innerHTML = `
            <td>${request.id_solicitud}</td>
            <td>${request.solicitud_intercambio}</td>
            <td>${getStatusHTML(request.estado_solicitud)}</td>
            <td>${request.fecha_solicitud}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Dynamic "Estado" styling
function getStatusHTML(status) {
    let colorClass = '';
    switch (status) {
        case 'Aceptada':
            colorClass = 'status-accepted';
            break;
        case 'Rechazada':
            colorClass = 'status-rejected';
            break;
        case 'Pendiente':
            colorClass = 'status-pending';
            break;
    }
    return `<span class="status ${colorClass}">${status}</span>`;
}

// Redirect to request detail page
function openRequestDetail(requestId) {
    window.location.href = `request-detail.html?id=${requestId}`;
}

// Load data on page load
window.onload = function () {
    fetchInboxData();
};
