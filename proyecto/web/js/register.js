async function RegisterUser(event) {
    event.preventDefault();

    const DNI = document.getElementById('DNI').value;
    const DireccionCorreo = document.getElementById('DireccionCorreo').value;
    const FechaNacimiento = document.getElementById('FechaNacimiento').value;
    const Nombre = document.getElementById('Nombre').value;
    const Apellido = document.getElementById('Apellido').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://127.0.0.1:5000/create_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ DNI, DireccionCorreo, FechaNacimiento, Nombre, Apellido, password })
        });

        const result = await response.json();

        if (response.ok) {
            alert('¡Cuenta creada exitosamente!');
            window.location.href = 'login.html'; // Asegúrate de que este archivo exista
        } else {
            alert(result.message || 'Error creando la cuenta');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
    }
}
