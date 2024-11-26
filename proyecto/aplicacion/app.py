from flask import Flask, jsonify, request, session, make_response
from flask_cors import CORS
import mysql.connector
import uuid  
from neo4j import GraphDatabase
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = 'e7ef771e4cf86b5663e2e973510f3cb63c769f2b3e7fe429'

# ================================================================================================================
# Conexión para base de datos relacionales
def get_db_connection():
    connection = mysql.connector.connect(
        host='autorack.proxy.rlwy.net',
        user='Nilson',
        password='nilson',
        database='mydb',
        port=29880
    )
    return connection

# ======================================================================================================================
# Clase para manejar la conexión con Neo4j
class Neo4jConnection:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def execute_query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return [record for record in result]

# Configuración de la conexión a Neo4j
neo4j_conn = Neo4jConnection(
    uri=os.getenv("NEO4J_URI", "bolt://3.215.175.176:7687"),
    user=os.getenv("NEO4J_USER", "neo4j"),
    password=os.getenv("NEO4J_PASSWORD", "algebra-railway-slates")
)
# ======================================================================================================================
# Inicio de sesión
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

# Crear usuario
@app.route('/create_user', methods=['POST'])
def create_user():
    data = request.get_json()

    # Validación de datos obligatorios
    required_fields = ['DNI', 'DireccionCorreo', 'FechaNacimiento', 'Nombre', 'Apellido', 'password']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"message": f"{field} is required"}), 400

    # Variables
    DNI = data['DNI']
    DireccionCorreo = data['DireccionCorreo']
    FechaNacimiento = data['FechaNacimiento']
    Nombre = data['Nombre']
    Apellido = data['Apellido']
    password = data['password']

    # Inserción en ambas bases
    try:
        # 1. Inserta en MySQL
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute('''
            INSERT INTO informacion_Persona (DNI, DireccionCorreo, FechaNacimiento, Nombre, Apellido, password)
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (DNI, DireccionCorreo, FechaNacimiento, Nombre, Apellido, password))
        connection.commit()
        
        # 2. Inserta en Neo4j
        query = '''
        CREATE (p:PERSONA { dni: $dni, correo: $correo, name: $name, apellido: $apellido})
        RETURN p
        '''
        neo4j_conn.execute_query(query, {
            "dni": DNI,
            "correo": DireccionCorreo,
            "name": Nombre,
            "apellido": Apellido
        })

        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        print(f"Error al crear usuario: {e}")  # Añade esta línea
        return jsonify({"message": f"Error creating user: {str(e)}"}), 500

    

    finally:
        cursor.close()
        connection.close()

# Obtener objetos
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

#Obtener información de usuario
@app.route('/userinfo', methods=['GET'])
def get_user():
    email = session.get('email')
    if not email:
        return jsonify({"message": "User not logged in"}), 401
    
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT DNI,DireccionCorreo,FechaNacimiento,Nombre,password FROM informacion_Persona where DireccionCorreo = %s', (email,))
    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify({'user': rows}), 200


# Modificar usuario
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


# Objetos en banco
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


#Agregar objetos
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
    categoria = data.get('categoria')
    estado_estetico = data.get('estado_estetico')
    estado_funcional = data.get('estado_funcional')
    estado_garantia = data.get('estado_garantia')

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Insertar en la tabla objeto
        cursor.execute('''
            INSERT INTO objeto (Nombre, Descripcion, URL_Imagen, URL_Video, informacion_Persona_idinformacion_Persona, categoria) 
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (Nombre, Descripcion, URL_Imagen, URL_Video, informacion_Persona_idinformacion_Persona, categoria))
        
        # Obtener el id del objeto recién insertado
        idobjeto = cursor.lastrowid
        
        # Insertar en la tabla reseñas_objetos
        cursor.execute('''
            INSERT INTO reseñas_objetos (objeto_idobjeto, estado_estético, estado_funcional, estado_garantia) 
            VALUES (%s, %s, %s, %s)
        ''', (idobjeto, estado_estetico, estado_funcional, estado_garantia))
        
        connection.commit()
    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({"message": f"Error: {err}"}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify({"message": "Object and review added successfully"}), 201

#Agregar objetos al banco
#Agregar objetos al banco
@app.route('/addObjectbank', methods=['POST'])
def add_objectbank():
    informacion_Persona_idinformacion_Persona = session.get('idinformacion_Persona')
    if not informacion_Persona_idinformacion_Persona:
        return jsonify({"message": "User not logged in"}), 401

    data = request.get_json()
    Nombre = data.get('Nombre')
    Descripcion = data.get('Descripcion')
    URL_Imagen = data.get('URL_Imagen')
    URL_Video = data.get('URL_Video')
    categoria = data.get('categoria')
    estado_estetico = data.get('estado_estetico')
    estado_funcional = data.get('estado_funcional')
    estado_garantia = data.get('estado_garantia')

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Insertar en la tabla objeto
        cursor.execute('''
            INSERT INTO objeto (Nombre, Descripcion, URL_Imagen, URL_Video, informacion_Persona_idinformacion_Persona, categoria) 
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (Nombre, Descripcion, URL_Imagen, URL_Video, informacion_Persona_idinformacion_Persona, categoria))
        
        # Obtener el id del objeto recién insertado
        idobjeto = cursor.lastrowid
        
        # Insertar en la tabla reseñas_objetos
        cursor.execute('''
            INSERT INTO reseñas_objetos (objeto_idobjeto, estado_estético, estado_funcional, estado_garantia) 
            VALUES (%s, %s, %s, %s)
        ''', (idobjeto, estado_estetico, estado_funcional, estado_garantia))
        
        # Modificar has_ticket
        cursor.execute('''
            UPDATE informacion_Persona 
            SET has_ticket = has_ticket + 1 
            WHERE idinformacion_Persona = %s
        ''', (informacion_Persona_idinformacion_Persona,))
        
        # Insertar en la tabla banco
        cursor.execute('''
            INSERT INTO banco (dejado_por, objeto_idobjeto) 
            VALUES (%s, %s)
        ''', (informacion_Persona_idinformacion_Persona, idobjeto))

        connection.commit()
    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({"message": f"Error: {err}"}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify({"message": "Object and review added successfully"}), 201

if __name__ == '__main__':
    app.run(debug=True)
