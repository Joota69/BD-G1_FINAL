from flask import Flask, jsonify, request, session, make_response
from flask_cors import CORS
import mysql.connector
import uuid  # Para generar un identificador único

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = 'e7ef771e4cf86b5663e2e973510f3cb63c769f2b3e7fe429'


def get_db_connection():
    connection = mysql.connector.connect(
        host='autorack.proxy.rlwy.net',
        user='Nilson',
        password='nilson',
        database='mydb',
        port=29880
    )
    return connection


@app.route('/data', methods=['POST'])
def get_data():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT DireccionCorreo, password FROM informacion_Persona WHERE DireccionCorreo = %s AND password = %s', (email, password))
    rows = cursor.fetchall()
    cursor.close()
    connection.close()

    if rows:
        # Guardar el email en la sesión
        session['email'] = email
        
        # Generar un identificador único para la cookie
        session_id = str(uuid.uuid4())

        # Crear una respuesta con la cookie
        response = make_response(jsonify(rows))
        response.set_cookie('session_id', session_id, httponly=True, samesite='Strict')
        
        return response, 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401


@app.route('/get_objects', methods=['GET'])
def get_objects():
    # Recuperar el email desde la sesión
    email = session.get('email')
    if not email:
        return jsonify({"message": "User not logged in"}), 401

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Obtener los objetos
    cursor.execute('SELECT Nombre, Descripcion FROM objeto')
    rows = cursor.fetchall()

    # Obtener información del usuario
    cursor.execute('SELECT Nombre, DNI, DireccionCorreo, has_ticket FROM informacion_Persona WHERE DireccionCorreo = %s', (email,))
    info = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify({'objects': rows, 'info': info}), 200

@app.route('/usuarios', methods=['GET'])
def get_usuarios():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM informacion_Persona')
    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify({'usuarios': rows}), 200


if __name__ == '__main__':
    app.run(debug=True)
