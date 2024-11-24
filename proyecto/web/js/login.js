async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://127.0.0.1:5000/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // IMPORTANTE
        body: JSON.stringify({ email, password })
    });
    

    const result = await response.json();

    if (response.ok) {
        alert('Login successful!');
        // Redirigir a la página principal
        window.location.href = 'principal.html';
    } else {
        alert(result.message || 'Error logging in');
    }
}