document.addEventListener('DOMContentLoaded', async () => {
    const userContainer = document.getElementById('user-container');
    const formContainer = document.getElementById('form-container');
    const modifyForm = document.getElementById('modify-form');

    try {
        const response = await fetch('http://127.0.0.1:5000/userinfo', {
            credentials: 'include'
        });
        if (response.status === 401) {
            console.error('User not logged in');
            userContainer.innerHTML = '<p>User not logged in</p>';
            return;
        }
        const data = await response.json();
        const user = data['user'][0];

        // Agrega un console.log para ver los datos que llegan a data['user']
        console.log('Datos de user:', user);

        // Mostrar información del usuario con botones "Cambiar"
        const name = document.createElement('p');
        name.innerHTML = `Nombre: ${user.Nombre || ''} <a class="change-link" data-field="nombre">Cambiar</a>`;

        const apellido = document.createElement('p');
        apellido.innerHTML = `Apellido: ${user.Apellido || ''} <a class="change-link" data-field="apellido">Cambiar</a>`;

        const email = document.createElement('p');
        email.innerHTML = `Email: ${user.DireccionCorreo || ''} <a class="change-link" data-field="email">Cambiar</a>`;

        const dni = document.createElement('p');
        dni.innerHTML = `DNI: ${user.DNI || ''} <a class="change-link" data-field="dni">Cambiar</a>`;

        const fechaNacimiento = document.createElement('p');
        fechaNacimiento.innerHTML = `Fecha de Nacimiento: ${user.FechaNacimiento ? new Date(user.FechaNacimiento).toISOString().split('T')[0] : ''} <a class="change-link" data-field="fechaNacimiento">Cambiar</a>`;

        userContainer.appendChild(name);
        userContainer.appendChild(apellido);
        userContainer.appendChild(email);
        userContainer.appendChild(dni);
        userContainer.appendChild(fechaNacimiento);

        // Manejar la apertura del formulario
        document.querySelectorAll('.change-link').forEach(link => {
            link.addEventListener('click', (event) => {
                const field = event.target.getAttribute('data-field');
                formContainer.classList.remove('hidden');
                modifyForm.reset();
                document.getElementById(field).focus();
            });
        });

        // Manejar el envío del formulario
        modifyForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(modifyForm);
            const data = {
                Nombre: formData.get('nombre') || '',
                Apellido: formData.get('apellido') || '',
                DireccionCorreo: formData.get('email') || '',
                DNI: formData.get('dni') || '',
                FechaNacimiento: formData.get('fechaNacimiento') || '',
                password: formData.get('password') || ''
            };

            try {
                const response = await fetch('http://127.0.0.1:5000/modify_user', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert('User updated successfully');
                    formContainer.classList.add('hidden');
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error updating user:', error);
                alert('Error updating user');
            }
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        userContainer.innerHTML = '<p>Error fetching user info</p>';
    }
});