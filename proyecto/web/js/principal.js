document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('products-container');
    const welcomeMessage = document.getElementById('welcome-message');
    const exchangeQuestion = document.getElementById('exchange-question');
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
            categoria: formData.get('categoria'),
            estado_estetico: formData.get('estado_estetico'),
            estado_funcional: formData.get('estado_funcional'),
            estado_garantia: formData.get('estado_garantia'),
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/addObject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
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
            credentials: 'include',
        });

        if (response.status === 401) {
            console.error('No email found in session');
            return;
        }

        const data = await response.json();
        const products = data['objects'];
        const userInfo = data['info'];

        // Mostrar el mensaje de bienvenida y la pregunta
        if (userInfo && userInfo.length > 0) {
            const user = userInfo[0];
            welcomeMessage.textContent = `Bienvenido ${user.Nombre}`;
            exchangeQuestion.textContent = '¿Intercambiamos?';
        }

        // Mostrar objetos
        if (products && products.length > 0) {
            products.forEach((product) => {
                const card = document.createElement('div');
                card.className = 'card';

                const img = document.createElement('img');
                img.src = product.URL_Imagen;
                img.alt = product.Nombre;
                img.className = 'card-img';

                const name = document.createElement('h2');
                name.textContent = product.Nombre;

                const description = document.createElement('p');
                description.textContent = product.Descripcion;

                // Añadir evento para abrir el pop-up cuando se hace clic en la card
                card.addEventListener('click', () => {
                    openObjectPopup(product.Nombre, products);
                });

                card.appendChild(img);
                card.appendChild(name);
                card.appendChild(description);
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }

    // Función para abrir el pop-up con el nombre del objeto
    function openObjectPopup(objectName, products) {
        const objectPopup = document.createElement('div');
        objectPopup.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.textContent = '×';

        const title = document.createElement('h2');
        title.textContent = objectName;

        // Crear el layout con dos dropdowns y el botón de intercambiar
        const popupBody = document.createElement('div');
        popupBody.className = 'popup-body';

        // Crear el contenedor izquierdo con el primer dropdown
        const leftContainer = document.createElement('div');
        leftContainer.className = 'popup-left';

        const dropdown1 = document.createElement('select');
        dropdown1.className = 'dropdown';

        // Llenar el dropdown1 con los objetos disponibles
        products.forEach((product) => {
            const option = document.createElement('option');
            option.value = product.idObjeto;
            option.textContent = product.Nombre;
            dropdown1.appendChild(option);
        });
        leftContainer.appendChild(dropdown1);

        // Crear el contenedor derecho con el segundo dropdown (estático con el objeto clickeado)
        const rightContainer = document.createElement('div');
        rightContainer.className = 'popup-right';

        const dropdown2 = document.createElement('select');
        dropdown2.className = 'dropdown';
        dropdown2.disabled = true;  // Deshabilitar el dropdown de la derecha

        // Establecer el nombre del objeto como el valor y texto del dropdown2
        const option2 = document.createElement('option');
        option2.value = objectName;
        option2.textContent = objectName;
        dropdown2.appendChild(option2);

        rightContainer.appendChild(dropdown2);

        // Crear el botón de intercambiar
        const exchangeButton = document.createElement('button');
        exchangeButton.className = 'exchange-button';
        exchangeButton.textContent = 'Intercambiar';

        // Agregar los elementos al cuerpo del pop-up
        popupBody.appendChild(leftContainer);
        popupBody.appendChild(rightContainer);
        popupBody.appendChild(exchangeButton);

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(popupBody);
        objectPopup.appendChild(modalContent);
        document.body.appendChild(objectPopup);

        // Mostrar el pop-up
        objectPopup.style.display = 'block';

        // Cerrar el pop-up cuando se hace clic en la "X"
        closeBtn.addEventListener('click', () => {
            objectPopup.style.display = 'none';
        });

        // Cerrar el modal cuando se hace clic fuera del contenido del modal
        objectPopup.addEventListener('click', (event) => {
            if (event.target === objectPopup) {
                objectPopup.style.display = 'none';
            }
        });

        // Enviar la solicitud de intercambio cuando se hace clic en el botón "Intercambiar"
        exchangeButton.addEventListener('click', async () => {
            const selectedObjectId = dropdown1.value;
            
            const currentDate = new Date().toISOString(); // Fecha actual en formato ISO

            // Validar que se haya seleccionado un objeto
            if (!selectedObjectId) {
                alert('Por favor, selecciona un objeto para intercambiar.');
                return;
            }

            try {
                // Enviar la solicitud al backend para procesar el intercambio
                const response = await fetch('http://127.0.0.1:5000/send_exchange_request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                         
                        objeto_solicitado_id: selectedObjectId,
                        objeto_ofrecido_id: objectName,  // El objeto clickeado
                        fecha_solicitud: currentDate,
                    }),
                });

                if (response.ok) {
                    alert('Solicitud de intercambio enviada correctamente');
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error enviando solicitud de intercambio:', error);
                alert('Hubo un problema al enviar la solicitud de intercambio.');
            }
        });
    }
});
