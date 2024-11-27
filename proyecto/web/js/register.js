document.addEventListener('DOMContentLoaded', () => {
    const departamentoSelect = document.getElementById('Departamento');
    const provinciaSelect = document.getElementById('Provincia');
    const distritoSelect = document.getElementById('Distrito');

    const provincias = {
        Lima: ['Lima', 'Huarochirí', 'Cañete'],
        Callao: ['Callao'],
        Arequipa: ['Arequipa', 'Camaná', 'Islay'],
        Cusco: ['Cusco', 'La Convención', 'Urubamba'],
        'La Libertad': ['Trujillo', 'Pacasmayo', 'Chepén']
    };

    const distritos = {
        Lima: {
            Lima: ['Miraflores', 'San Isidro', 'Barranco','San Martin de Porres','Pueblo libre','La victoria','La Molina','San Borja','San Miguel','San Juan de Lurigancho','Independencia','Carabayllo','Comas'],
            Huarochirí: ['Chaclacayo', 'Chosica'],
            Cañete: ['Asia', 'San Vicente']
        },
        Callao: {
            Callao: ['Ventanilla', 'La Punta']
        },
        Arequipa: {
            Arequipa: ['Yanahuara', 'Cayma'],
            Camaná: ['Camaná', 'Quilca'],
            Islay: ['Mollendo', 'Mejía']
        },
        Cusco: {
            Cusco: ['San Blas', 'Wanchaq'],
            'La Convención': ['Quillabamba', 'Santa Ana'],
            Urubamba: ['Ollantaytambo', 'Machu Picchu']
        },
        'La Libertad': {
            Trujillo: ['El Porvenir', 'Florencia de Mora'],
            Pacasmayo: ['San Pedro', 'Guadalupe'],
            Chepén: ['Chepén', 'Pacanga']
        }
    };

    departamentoSelect.addEventListener('change', () => {
        const selectedDepartamento = departamentoSelect.value;

        // Limpiar y habilitar provincias
        provinciaSelect.innerHTML = '<option value="" selected>Seleccione una provincia</option>';
        distritoSelect.innerHTML = '<option value="" selected>Seleccione un distrito</option>';
        distritoSelect.disabled = true;

        if (selectedDepartamento) {
            provinciaSelect.disabled = false;
            provincias[selectedDepartamento].forEach(provincia => {
                const option = document.createElement('option');
                option.value = provincia;
                option.textContent = provincia;
                provinciaSelect.appendChild(option);
            });
        } else {
            provinciaSelect.disabled = true;
        }
    });

    provinciaSelect.addEventListener('change', () => {
        const selectedDepartamento = departamentoSelect.value;
        const selectedProvincia = provinciaSelect.value;

        // Limpiar y habilitar distritos
        distritoSelect.innerHTML = '<option value="" selected>Seleccione un distrito</option>';

        if (selectedProvincia) {
            distritoSelect.disabled = false;
            distritos[selectedDepartamento][selectedProvincia].forEach(distrito => {
                const option = document.createElement('option');
                option.value = distrito;
                option.textContent = distrito;
                distritoSelect.appendChild(option);
            });
        } else {
            distritoSelect.disabled = true;
        }
    });
});

async function RegisterUser(event) {
    event.preventDefault();

    const DNI = document.getElementById('DNI').value;
    const DireccionCorreo = document.getElementById('DireccionCorreo').value;
    const FechaNacimiento = document.getElementById('FechaNacimiento').value;
    const Nombre = document.getElementById('Nombre').value;
    const password = document.getElementById('password').value;
    const Departamento = document.getElementById('Departamento').value;
    const Provincia = document.getElementById('Provincia').value;
    const Distrito = document.getElementById('Distrito').value;
    const Direccion = document.getElementById('Direccion').value || null;

    try {
        const response = await fetch('http://127.0.0.1:5000/create_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ DNI, DireccionCorreo, FechaNacimiento, Nombre, password,Departamento,Provincia, Distrito,Direccion })
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