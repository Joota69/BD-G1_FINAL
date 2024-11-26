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
    uri=os.getenv("NEO4J_URI", "bolt://3.93.149.233:7687"),
    user=os.getenv("NEO4J_USER", "neo4j"),
    password=os.getenv("NEO4J_PASSWORD", "rushes-skills-subsystems")
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
    required_fields = ['DNI', 'DireccionCorreo', 'FechaNacimiento', 'Nombre', 'password']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"message": f"{field} is required"}), 400

    # Variables
    DNI = data['DNI']
    DireccionCorreo = data['DireccionCorreo']
    FechaNacimiento = data['FechaNacimiento']
    Nombre = data['Nombre']
    password = data['password']

    Departamento = data.get('Departamento')
    Provincia = data.get('Provincia')
    Distrito = data.get('Distrito')
    Direccion = data.get('Direccion')

    # Inserción en ambas bases
    try:
        # 1. Inserta en MySQL
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute('''
            INSERT INTO informacion_Persona (DNI, DireccionCorreo, FechaNacimiento, Nombre, password)
            VALUES (%s, %s, %s, %s, %s)
        ''', (DNI, DireccionCorreo, FechaNacimiento, Nombre, password))
        user_id = cursor.lastrowid

        # Insertar en direccion_Persona si hay datos
        if Departamento or Provincia or Distrito or Direccion:
            cursor.execute('''
                INSERT INTO direccion_Persona (informacion_Persona_idinformacion_Persona, direccion, departamento, provincia, distrito)
                VALUES (%s, %s, %s, %s, %s)
            ''', (user_id, Direccion, Departamento, Provincia, Distrito))
            
            # 2. Inserta en Neo4j DOMICILIO DE LA PERSONA REGISTRADA
            query = '''
            MERGE (p:PERSONA { id: $user_id, dni: $dni, correo: $correo, name: $name})
            MERGE (d:DIRECCION { direccion: $direccion, departamento: $departamento, provincia: $provincia, distrito: $distrito})
            MERGE (p)-[:VIVE_EN]->(d)
            RETURN p, d
            '''
            neo4j_conn.execute_query(query, {
                "user_id": user_id,  # Usar el id de MySQL
                "dni": DNI,
                "correo": DireccionCorreo,
                "name": Nombre,
                "direccion": Direccion,
                "departamento": Departamento,
                "provincia": Provincia,
                "distrito": Distrito
            })
        else:
            # En caso de no tener dirección (Poco probable), pero en caso pueda ocurrir.
            query = '''
            MERGE (p:PERSONA { id: $user_id, dni: $dni, correo: $correo, name: $name})
            RETURN p
            '''
            neo4j_conn.execute_query(query, {
                "user_id": user_id,  # Usar el id de MySQL
                "dni": DNI,
                "correo": DireccionCorreo,
                "name": Nombre,
            })

        connection.commit()
    
        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        print(f"Error al crear usuario: {e}")  # Depuración
        return jsonify({"message": f"Error creating user: {str(e)}"}), 500

    

    finally:
        cursor.close()
        connection.close()
        
        
        
        
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
        banco_id_banca = cursor.lastrowid
        #crear ticket 
        #generar 20 caracteres entre numeros y letras aleatorios en una variables

        numero_de_ticket= str(uuid.uuid4())
        
        cursor.execute('''
            INSERT INTO ticket (banco_id_banca, informacion_Persona_idinformacion_Persona,numero_de_ticket) 
            VALUES (%s, %s, %s)
        ''', (banco_id_banca, informacion_Persona_idinformacion_Persona,numero_de_ticket))
        tickeid = cursor.lastrowid
       # insertar en detalles_ticket
        cursor.execute('''
            INSERT INTO detalles_ticket (ticket_idticket) 
            VALUES (%s)
        ''', (tickeid,)) 

        connection.commit()
    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({"message": f"Error: {err}"}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify({"message": "Object and review added successfully"}), 201

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
    
    # Consulta optimizada con LEFT JOIN
    cursor.execute('''
        SELECT 
            iP.DNI,
            iP.DireccionCorreo,
            iP.FechaNacimiento,
            iP.Nombre,
            iP.password,
            dP.direccion,
            dP.departamento,
            dP.provincia,
            dP.distrito
        FROM 
            informacion_Persona iP
        LEFT JOIN 
            direccion_Persona dP 
        ON 
            iP.idinformacion_Persona = dP.informacion_Persona_idinformacion_Persona
        WHERE 
            iP.DireccionCorreo = %s
    ''', (email,))

    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify({'user': rows}), 200

#Eliminar usuario
@app.route('/delete_user', methods=['DELETE'])
def delete_user():
    email = session.get('email')  # Obtener el correo del usuario autenticado
    if not email:
        return jsonify({"message": "User not logged in"}), 401

    # Obtener el ID del usuario desde la base de datos relacional (MySQL)
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT idinformacion_Persona FROM informacion_Persona WHERE DireccionCorreo = %s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"message": "User not found"}), 404

    user_id = user['idinformacion_Persona']

    try:
        # 1. Eliminar las relaciones y el nodo en Neo4j
        neo4j_conn.execute_query('''
            MATCH (n:PERSONA {id: $user_id})-[r]-(nodo_relacionado)
            DETACH DELETE n, nodo_relacionado
        ''', {"user_id": user_id})

        # 2. Eliminar los datos del usuario en MySQL
        cursor.execute("DELETE FROM reseñas_objetos WHERE objeto_idobjeto IN (SELECT idobjeto FROM objeto WHERE informacion_Persona_idinformacion_Persona = %s)", (user_id,))
        cursor.execute("DELETE FROM objeto WHERE informacion_Persona_idinformacion_Persona = %s", (user_id,))
        cursor.execute("DELETE FROM banco WHERE dejado_por = %s", (user_id,))
        cursor.execute("DELETE FROM direccion_Persona WHERE informacion_Persona_idinformacion_Persona = %s", (user_id,))
        cursor.execute("DELETE FROM informacion_Persona WHERE idinformacion_Persona = %s", (user_id,))

        connection.commit()

        return jsonify({"message": "User and associated data deleted successfully"}), 200

    except Exception as e:
        connection.rollback()
        print(f"Error deleting user: {e}")
        return jsonify({"message": f"Error deleting user: {str(e)}"}), 500

    finally:
        cursor.close()
        connection.close()


# Modificar usuario
@app.route('/modify_user', methods=['PATCH'])
def modify_user():
    email = session.get('email')  # Obtener el correo del usuario autenticado
    if not email:
        return jsonify({"message": "User not logged in"}), 401

    data = request.get_json()
    fields_to_update_persona = []
    values_persona = []
    fields_to_update_direccion = []
    values_direccion = []

    # Conexión a la base de datos
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Verificar que el usuario existe en la tabla `informacion_persona`
        cursor.execute("SELECT idinformacion_persona FROM informacion_Persona WHERE DireccionCorreo = %s", (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"message": "User not found"}), 404
        user_id = user[0]  # Obtener el ID del usuario (clave foránea en `direccion_persona`)

        # Actualización de `informacion_persona`
        if 'Nombre' in data:
            fields_to_update_persona.append('Nombre = %s')
            values_persona.append(data['Nombre'])
        if 'DNI' in data:
            fields_to_update_persona.append('DNI = %s')
            values_persona.append(data['DNI'])
        if 'DireccionCorreo' in data:
            fields_to_update_persona.append('DireccionCorreo = %s')
            values_persona.append(data['DireccionCorreo'])
        if 'FechaNacimiento' in data:
            fields_to_update_persona.append('FechaNacimiento = %s')
            values_persona.append(data['FechaNacimiento'])
        if 'password' in data and data['password']:
            fields_to_update_persona.append('password = %s')
            values_persona.append(data['password'])

        # Si hay campos para actualizar en `informacion_persona`
        if fields_to_update_persona:
            query_persona = f"UPDATE informacion_Persona SET {', '.join(fields_to_update_persona)} WHERE DireccionCorreo = %s"
            values_persona.append(email)
            cursor.execute(query_persona, values_persona)

            if 'DireccionCorreo' in data:
                session['email'] = data['DireccionCorreo']

        # Actualización de `direccion_persona`
        if 'direccion' in data:
            fields_to_update_direccion.append('direccion = %s')
            values_direccion.append(data['direccion'])
        if 'departamento' in data:
            fields_to_update_direccion.append('departamento = %s')
            values_direccion.append(data['departamento'])
        if 'provincia' in data:
            fields_to_update_direccion.append('provincia = %s')
            values_direccion.append(data['provincia'])
        if 'distrito' in data:
            fields_to_update_direccion.append('distrito = %s')
            values_direccion.append(data['distrito'])

        # Si hay campos para actualizar en `direccion_persona`
        if fields_to_update_direccion:
            query_direccion = f"UPDATE direccion_Persona SET {', '.join(fields_to_update_direccion)} WHERE informacion_persona_idinformacion_persona = %s"
            values_direccion.append(user_id)
            cursor.execute(query_direccion, values_direccion)

        # Confirmar cambios
        connection.commit()

    except Exception as e:
        print(f"Error al modificar usuario: {e}")
        return jsonify({"message": "Internal server error"}), 500

    finally:
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




if __name__ == '__main__':
    app.run(debug=True)
