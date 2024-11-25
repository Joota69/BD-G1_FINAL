from flask import Flask, jsonify, request, session, make_response
from flask_cors import CORS
import mysql.connector
import uuid  

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
    cursor.execute('SELECT DireccionCorreo, password,idinformacion_Persona FROM informacion_Persona WHERE DireccionCorreo = %s AND password = %s', (email, password))
    rows = cursor.fetchall()
    cursor.close()
    connection.close()

    if rows:
        # Guardar el email en la sesión
        session['email'] = email
        session['idinformacion_Persona'] = rows[0]['idinformacion_Persona']
        print(session['idinformacion_Persona'])
        
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


@app.route('/userinfo', methods=['GET'])
def get_user():
    email = session.get('email')
    if not email:
        return jsonify({"message": "User not logged in"}), 401
    
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT Apellido,DNI,DireccionCorreo,FechaNacimiento,Nombre,password FROM informacion_Persona where DireccionCorreo = %s', (email,))
    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify({'user': rows}), 200

@app.route('/modify_user', methods=['PATCH'])
def modify_user():
    email = session.get('email')
    if not email:
        return jsonify({"message": "User not logged in"}), 401

    data = request.get_json()
    fields_to_update = []
    values = []

    # Verificar y agregar los campos presentes en la solicitud
    if 'Nombre' in data:
        fields_to_update.append('Nombre = %s')
        values.append(data['Nombre'])
    if 'Apellido' in data:
        fields_to_update.append('Apellido = %s')
        values.append(data['Apellido'])
    if 'DNI' in data:
        fields_to_update.append('DNI = %s')
        values.append(data['DNI'])
    if 'DireccionCorreo' in data:
        fields_to_update.append('DireccionCorreo = %s')
        values.append(data['DireccionCorreo'])
    if 'FechaNacimiento' in data:
        fields_to_update.append('FechaNacimiento = %s')
        values.append(data['FechaNacimiento'])
    if 'password' in data:
        fields_to_update.append('password = %s')
        values.append(data['password'])

    if not fields_to_update:
        return jsonify({"message": "No fields to update"}), 400

    # Agregar el email al final de los valores
    values.append(email)

    # Construir la consulta SQL
    query = f"UPDATE informacion_Persona SET {', '.join(fields_to_update)} WHERE DireccionCorreo = %s"

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(query, values)
    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": "User updated successfully"}), 200 

@app.route('/bancoObjetos', methods=['GET'])
def get_banco_objetos():
    email = session.get('email')
    if not email:
        return jsonify({"message": "User not logged in"}), 401
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT Nombre, Descripcion FROM objeto o JOIN banco b ON o.idobjeto=b.objeto_idobjeto')
    rows = cursor.fetchall()

    cursor.execute('SELECT has_ticket FROM informacion_Persona WHERE DireccionCorreo = %s', (email,))
    info = cursor.fetchall()

    cursor.close()
    connection.close()
    return jsonify({'banco_objetos': rows,'info':info}), 200


@app.route('/usuarios', methods=['GET'])
def get_usuarios():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM informacion_Persona')
    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify({'usuarios': rows}), 200

@app.route('/objeto', methods=['GET'])
def get_objeto():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM objeto')
    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify({'objetos': rows}), 200

@app.route('/addObject', methods=['POST'])
def add_object():
    informacion_Persona_idinformacion_Persona = session.get('idinformacion_Persona')
    if not informacion_Persona_idinformacion_Persona:
        return jsonify({"message": "User not logged in"}), 401

    data = request.get_json()
    Nombre = data.get('Nombre')
    Descripcion = data.get('Descripcion')
    URL_Imagen = data.get('URL_Imagen')
    URL_Video = data.get('URL_Video')
    idobjeto = data.get('idobjeto')

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute('''
        INSERT INTO objeto (Nombre, Descripcion, URL_Imagen, URL_Video, idobjeto, informacion_Persona_idinformacion_Persona) 
        VALUES (%s, %s, %s, %s, %s, %s)
    ''', (Nombre, Descripcion, URL_Imagen, URL_Video, idobjeto, informacion_Persona_idinformacion_Persona))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({"message": "Object added successfully"}), 201


if __name__ == '__main__':
    app.run(debug=True)
