document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('products-container');

    try {
        const response = await fetch('http://127.0.0.1:5000/get_objects');
        const data = await response.json();
        const products = data['objects'];
       // const user = data['user'];

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