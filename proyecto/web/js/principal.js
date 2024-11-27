document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('products-container'); // Contenedor de productos
    const popup = document.getElementById('popup'); // Popup general
    const closePopupBtn = document.querySelector('.close-popup-btn'); // Botón para cerrar el popup
    const leftDropdown = popup.querySelector('.window.left select'); // Dropdown de la izquierda
    const rightDisplay = popup.querySelector('.window.right input'); // Campo readonly de la derecha
    const imageDisplayCenter = popup.querySelector('#image-display'); // Imagen dinámica central
    const imageDisplayRight = popup.querySelector('#image-display-right'); // Imagen dinámica derecha

    let products = []; // Almacenar productos obtenidos de la API

    // Función para mostrar el popup con datos dinámicos
    const showPopup = (productName) => {
        // Establece el nombre del producto clicado en la ventana derecha (readonly)
        rightDisplay.value = productName;

        // Buscar la URL de imagen del producto clicado
        const selectedProduct = products.find((product) => product.Nombre === productName);
        if (selectedProduct && selectedProduct.URL_Imagen) {
            imageDisplayRight.src = selectedProduct.URL_Imagen; // Actualizar la imagen de la derecha
        } else {
            imageDisplayRight.src = ''; // Quitar la imagen si no hay URL
        }

        // También actualiza la imagen en el centro con el producto seleccionado del dropdown
        const dropdownSelectedProduct = products.find((product) => product.Nombre === leftDropdown.value);
        if (dropdownSelectedProduct && dropdownSelectedProduct.URL_Imagen) {
            imageDisplayCenter.src = dropdownSelectedProduct.URL_Imagen;
        } else {
            imageDisplayCenter.src = ''; // Quitar la imagen si no hay URL
        }

        // Mostrar el popup
        popup.style.display = 'flex';
    };

    // Actualizar la imagen central al cambiar la selección del dropdown
    leftDropdown.addEventListener('change', () => {
        const selectedProduct = products.find((product) => product.Nombre === leftDropdown.value);
        if (selectedProduct && selectedProduct.URL_Imagen) {
            imageDisplayCenter.src = selectedProduct.URL_Imagen; // Actualizar la imagen central
        } else {
            imageDisplayCenter.src = ''; // Quitar la imagen si no hay URL
        }
    });

    // Cerrar el popup
    closePopupBtn.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    try {
        // Fetch de objetos desde el servidor
        const response = await fetch('http://127.0.0.1:5000/get_objects', {
            credentials: 'include',
        });
        if (response.status === 401) {
            console.error('No email found in session');
            return;
        }
        const data = await response.json();
        products = data['objects']; // Guardar productos globalmente

        // Renderizar productos y construir el dropdown izquierdo
        if (products && products.length > 0) {
            // Llenar el dropdown izquierdo con los productos
            leftDropdown.innerHTML = ''; // Vaciar opciones previas
            products.forEach((product) => {
                const option = document.createElement('option');
                option.value = product.Nombre;
                option.textContent = product.Nombre;
                leftDropdown.appendChild(option);
            });

            // Crear tarjetas de productos
            products.forEach((product) => {
                const card = document.createElement('div');
                card.className = 'card';

                // Crear título del objeto
                const name = document.createElement('h2');
                name.textContent = product.Nombre;
                name.style.cursor = 'pointer'; // Hacer que parezca clicable

                // Agregar evento de clic al título del objeto
                name.addEventListener('click', () => {
                    showPopup(product.Nombre); // Muestra el popup con el nombre del producto
                });

                // Crear descripción del objeto
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
