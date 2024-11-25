document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('products-container');
    const userContainer = document.getElementById('user-container'); // Asegúrate de tener este contenedor en tu HTML
    const addObjectButton = document.getElementById('add-object-button');
    const modal = document.getElementById('addObjectModal');
    const closeModal = document.getElementsByClassName('close')[0];
    const addObjectForm = document.getElementById('add-object-form');

    // Mostrar el modal cuando se hace clic en el botón "Agregar Objeto"
    addObjectButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Cerrar el modal cuando se hace clic en el botón de cerrar
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cerrar el modal cuando se hace clic fuera del contenido del modal
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
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
            idobjeto: formData.get('idobjeto'),
            estado_estetico: formData.get('estado_estetico'),
            estado_funcional: formData.get('estado_funcional'),
            estado_garantia: formData.get('estado_garantia')
       
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/addObject', {
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

    try {
        const response = await fetch('http://127.0.0.1:5000/get_objects', {
            credentials: 'include'
        });
        if (response.status === 401) {
            console.error('No email found in session');
            return;
        }
        const data = await response.json();
        const products = data['objects'];
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

            const name = document.createElement('p');
            name.textContent = `Nombre: ${user.Nombre}`;

            const email = document.createElement('p');
            email.textContent = `Email: ${user.DireccionCorreo}`;

            const dni = document.createElement('p');
            dni.textContent = `DNI: ${user.DNI}`;

            const has_ticket = document.createElement('p');
            has_ticket.textContent = `Ticket Disponibles: ${user.has_ticket}`;

            userCard.appendChild(name);
            userCard.appendChild(email);
            userCard.appendChild(dni);
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

                card.appendChild(name);
                card.appendChild(description);
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
});