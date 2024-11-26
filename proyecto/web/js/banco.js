document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('products-container');
    const userContainer = document.getElementById('user-container'); // Asegúrate de tener este contenedor en tu HTML
    const addObjectButton = document.getElementById('add-object-button');
    const viewDetailsButton = document.getElementById('view-details-button');
    const modal = document.getElementById('addObjectModal');
    const closeModal = document.getElementsByClassName('close')[0];
    const addObjectForm = document.getElementById('add-object-form');
    const detailsModal = document.getElementById('detailsModal');
    const closeDetailsModal = document.getElementsByClassName('close')[1];
    const detailsForm = document.getElementById('details-form');
    const detailsContainer = document.getElementById('details-container');
    const redeemTicketButton = document.getElementById('redeem-ticket-button');

    // Mostrar el modal cuando se hace clic en el botón "Agregar Objeto"
    addObjectButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Mostrar el modal de detalles cuando se hace clic en el botón "Ver Detalles"
    viewDetailsButton.addEventListener('click', () => {
        detailsModal.style.display = 'block';
    });

    // Cerrar el modal cuando se hace clic en el botón de cerrar
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cerrar el modal de detalles cuando se hace clic en el botón de cerrar
    closeDetailsModal.addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });

    // Cerrar el modal cuando se hace clic fuera del contenido del modal
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
        if (event.target == detailsModal) {
            detailsModal.style.display = 'none';
        }
    });

    // Manejar el envío del formulario
    addObjectForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(addObjectForm);
        const data = {
            Nombre: formData.get('nombre'),
            Descripcion: formData.get('descripcion'),
            URL_Imagen: formData.get('url_imagen'),
            URL_Video: formData.get('url_video'),
            categoria: formData.get('categoria'),
            estado_estetico: formData.get('estado_estetico'),
            estado_funcional: formData.get('estado_funcional'),
            estado_garantia: formData.get('estado_garantia')
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/addObjectbank', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Objeto agregado exitosamente');
                modal.style.display = 'none';
                addObjectForm.reset();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error agregando objeto:', error);
            alert('Error agregando objeto');
        }
    });

    // Manejar el envío del formulario de detalles
    detailsForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const objetoId = document.getElementById('objeto_id').value;

        try {
            const response = await fetch(`http://127.0.0.1:5000/objetoPorId/${objetoId}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Detalles del objeto:', data);
                // Mostrar los detalles del objeto en el modal
                detailsContainer.innerHTML = `
                    <p>Nombre: ${data.objeto.Nombre}</p>
                    <p>Descripción: ${data.objeto.Descripcion}</p>
                    <p>Categoría: ${data.objeto.categoria}</p>
                    <p>Estado Estético: ${data.objeto.estado_estético}</p>
                    <p>Estado Funcional: ${data.objeto.estado_funcional}</p>
                    <p>Estado de Garantía: ${data.objeto.estado_garantia}</p>
                    <img src="${data.objeto.URL_Imagen}" alt="Imagen del objeto">
                `;
                redeemTicketButton.style.display = 'block';
                redeemTicketButton.dataset.objetoId = objetoId;
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error fetching object details:', error);
            alert('Error fetching object details');
        }
    });

    // Manejar el clic en el botón "Canjear Ticket por Objeto"
    redeemTicketButton.addEventListener('click', async () => {
        const objetoId = redeemTicketButton.dataset.objetoId;

        try {
            const response = await fetch('http://127.0.0.1:5000/bancoRetiro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ objeto_idobjeto: objetoId })
            });

            if (response.ok) {
                alert('Ticket canjeado exitosamente por el objeto');
                detailsModal.style.display = 'none';
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error canjeando ticket por objeto:', error);
            alert('Error canjeando ticket por objeto');
        }
    });

    try {
        const response = await fetch('http://127.0.0.1:5000/bancoObjetos', {
            credentials: 'include'
        });
        if (response.status === 401) {
            console.error('No email found in session');
            return;
        }
        const data = await response.json();
        const products = data['banco_objetos'];
        const userInfo = data['info'];

        // Agrega un console.log para ver los datos que llegan a data['info']
        console.log('Datos de data:', data);
        console.log('Datos de userInfo:', userInfo);
        console.log('Datos de products:', products);

        // Mostrar información del usuario (DNI)
        if (userInfo && userInfo.length > 0) {
            const user = userInfo[0];

            const userCard = document.createElement('div');
            userCard.className = 'card';

            const has_ticket = document.createElement('p');
            has_ticket.textContent = `Ticket Disponibles: ${user.has_ticket}`;

            userCard.appendChild(has_ticket);
            userContainer.appendChild(userCard);
        }

        // Mostrar objetos
        if (products && products.length > 0) {
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'card';

                const name = document.createElement('h2');
                name.textContent = product.Nombre;

                const description = document.createElement('p');
                description.textContent = product.Descripcion;

                const idobjeto = document.createElement('p');
                idobjeto.textContent = `ID Objeto: ${product.idobjeto}`;

                card.appendChild(name);
                card.appendChild(idobjeto);
                card.appendChild(description);
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
});