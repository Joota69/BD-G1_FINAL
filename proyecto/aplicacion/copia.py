from flask import Flask, request, session, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)
app.secret_key = 'your_secret_key'  # Configura una clave secreta para las sesiones

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
        session['email'] = email  # Guarda el email en la sesión
        return jsonify(rows), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401

@app.route('/create_user', methods=['POST'])
def create_user():
    # Datos predeterminados para probar la creación de un usuario
    DNI = "22334456"
    DireccionCorreo = "florian@example.com"
    FechaNacimiento = "1988-11-30"
    Intercambio_idIntercambio = 1
    Nombre = "Florian"
    has_ticket = 0
    idinformacion_Persona = 1
    password = "password"

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute('''
        INSERT INTO informacion_Persona (DNI, DireccionCorreo, FechaNacimiento, Intercambio_idIntercambio, Nombre, has_ticket, idinformacion_Persona, password)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ''', (DNI, DireccionCorreo, FechaNacimiento, Intercambio_idIntercambio, Nombre, has_ticket, idinformacion_Persona, password))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({"message": "User created successfully"}), 201

@app.route('/get_objects', methods=['GET'])
def get_objects():
    email = session.get('email')  # Accede al email desde la sesión
    if not email:
        return {'message': 'No email found in session'}, 401

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Obtener datos de la tabla objeto
    cursor.execute('SELECT Nombre, Descripcion FROM objeto')
    objects = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify( objects), 200

@app.route('/getuser', methods=['GET'])
def get_user():
    coneccion = get_db_connection()
    cursor=coneccion.cursor(dictionary=True)
    cursor.execute('SELECT * FROM informacion_Persona')
    rows = cursor.fetchall()
    cursor.close()
    coneccion.close()
    return jsonify(rows), 200

if __name__ == '__main__':
    app.run(debug=True)