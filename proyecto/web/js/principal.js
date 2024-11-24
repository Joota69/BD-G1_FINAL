document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('products-container');
    const userContainer = document.getElementById('user-container'); // Asegúrate de tener este contenedor en tu HTML

    try {
        const response = await fetch('http://127.0.0.1:5000/get_objects');
        const data = await response.json();
        const products = data['objects'];
        const userInfo = data['info'];

        // Mostrar información del usuario (DNI)
        if (userInfo.length > 0) {
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
    } catch (error) {
        console.error('Error fetching products:', error);
    }
});