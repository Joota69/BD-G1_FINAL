from flask import Flask, jsonify, request,session
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key= 'e7ef771e4cf86b5663e2e973510f3cb63c769f2b3e7fe429'

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
        session['email'] = email
        return jsonify(rows), 200
        
    else:
        return jsonify({"message": "Invalid email or password"}), 401

@app.route('/create_user', methods=['POST'])
def create_user():
    # Datos predeterminados para probar la creación de un usuario
    DNI = "22334456"
    DireccionCorreo = "florian@example.com"
    FechaNacimiento = "1988-11-30"
    Intercambio_idIntercambio = None
    Nombre = "MMHV"
    has_ticket = 0
    idinformacion_Persona = 123
    password = "MMHV@2024"

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
    email = session.get('email')
    print("Email en sesión:", session.get('email'))
    print(request.cookies)
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT Nombre,Descripcion FROM objeto')
    rows = cursor.fetchall()
    
    cursor.execute('SELECT Nombre, DNI, DireccionCorreo, has_ticket FROM informacion_Persona WHERE DireccionCorreo = %s', (email,))
    info = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify({'objects': rows,'info':info}), 200

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