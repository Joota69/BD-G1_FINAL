document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('products-container');
    const userContainer = document.getElementById('user-container'); // Asegúrate de tener este contenedor en tu HTML

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

                card.appendChild(name);
                card.appendChild(description);
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
});