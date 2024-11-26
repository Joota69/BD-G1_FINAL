document.addEventListener('DOMContentLoaded', async () => {
    const userContainer = document.getElementById('user-container');
    const formContainer = document.getElementById('form-container');
    const modifyForm = document.getElementById('modify-form');
    const deleteButton = document.getElementById('delete-button');  // Nuevo botón para eliminar

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

        // Guardar los datos del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Datos de user:', user);

        // Mostrar información del usuario con botones "Cambiar"
        userContainer.innerHTML = `
            <p>Nombre: ${user.Nombre || ''} <a class="change-link" data-field="nombre">Cambiar</a></p>
            <p>Email: ${user.DireccionCorreo || ''} <a class="change-link" data-field="email">Cambiar</a></p>
            <p>DNI: ${user.DNI || ''} <a class="change-link" data-field="dni">Cambiar</a></p>
            <p>Fecha de Nacimiento: ${user.FechaNacimiento ? new Date(user.FechaNacimiento).toISOString().split('T')[0] : ''} <a class="change-link" data-field="fechaNacimiento">Cambiar</a></p>
            <p>Dirección: ${user.direccion || ''} <a class="change-link" data-field="direccion">Cambiar</a></p>
            <p>Departamento: ${user.departamento || ''} <a class="change-link" data-field="departamento">Cambiar</a></p>
            <p>Provincia: ${user.provincia || ''} <a class="change-link" data-field="provincia">Cambiar</a></p>
            <p>Distrito: ${user.distrito || ''} <a class="change-link" data-field="distrito">Cambiar</a></p>
        `;

        // Manejar la apertura del formulario
        document.querySelectorAll('.change-link').forEach(link => {
            link.addEventListener('click', (event) => {
                const field = event.target.getAttribute('data-field');
                formContainer.classList.remove('hidden');
                modifyForm.reset();

                // Prellenar el formulario con la información actual
                const user = JSON.parse(localStorage.getItem('user'));
                document.getElementById('nombre').value = user.Nombre || '';
                document.getElementById('email').value = user.DireccionCorreo || '';
                document.getElementById('dni').value = user.DNI || '';
                document.getElementById('fechaNacimiento').value = user.FechaNacimiento ? new Date(user.FechaNacimiento).toISOString().split('T')[0] : '';
                document.getElementById('direccion').value = user.direccion || '';
                document.getElementById('departamento').value = user.departamento || '';
                document.getElementById('provincia').value = user.provincia || '';
                document.getElementById('distrito').value = user.distrito || '';

                // Enfocar el campo específico
                document.getElementById(field).focus();
            });
        });

        // Manejar el envío del formulario
        modifyForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(modifyForm);
            const data = {
                Nombre: formData.get('nombre') || '',
                DireccionCorreo: formData.get('email') || '',
                DNI: formData.get('dni') || '',
                FechaNacimiento: formData.get('fechaNacimiento') || '',
                password: formData.get('password') || '',
                direccion: formData.get('direccion') || '',
                departamento: formData.get('departamento') || '',
                provincia: formData.get('provincia') || '',
                distrito: formData.get('distrito') || ''
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

                    // Actualizar localStorage con los datos modificados
                    const updatedUser = { ...JSON.parse(localStorage.getItem('user')), ...data };
                    localStorage.setItem('user', JSON.stringify(updatedUser));

                    // Refrescar la vista
                    location.reload();
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error updating user:', error);
                alert('Error updating user');
            }
        });

        // Agregar la funcionalidad de eliminar cuenta
        deleteButton.addEventListener('click', async () => {
            const confirmation = confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no puede deshacerse.");
            if (!confirmation) return;

            try {
                const response = await fetch('http://127.0.0.1:5000/delete_user', {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    alert('Cuenta eliminada exitosamente');
                    // Redirigir al usuario a la página principal o de login
                    window.location.href = 'login.html'; // O la URL que prefieras
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user');
            }
        });
        
    } catch (error) {
        console.error('Error fetching user info:', error);
        userContainer.innerHTML = '<p>Error fetching user info</p>';
    }
});
