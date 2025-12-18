"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, User
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_cors import CORS
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from sqlalchemy.exc import IntegrityError

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

app.config["JWT_SECRET_KEY"] = os.getenv('JWT_KEY')

bcrypt = Bcrypt(app) 

CORS(app)
jwt = JWTManager(app)

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  
    return response




@app.route('/api/login', methods=['POST'])
def login():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': ' Debes enviar informacion en el body'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'El campo email es obligatorio'}), 400
    if 'password' not in body:
        return jsonify({'msg': ' El campo password es obligatorio'}), 400
    
    user = User.query.filter_by(email=body['email']).first() 

    print(user)
    if user is None:
        return jsonify({'msg': 'Usuario o contraseña incorrecta'}), 400
    is_correct = bcrypt.check_password_hash(user.password, body['password'])
    if is_correct == False:
        return jsonify({'msg': 'Usuario o contraseña incorrecta'}), 400
    
    acces_token = create_access_token(identity=user.email)
 
    return jsonify({'msg': 'Usuario logeado correctamente!', \
                    'token': acces_token}), 200
                  

@app.route('/api/register', methods=['POST'])
def register_user():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Debes enviar informacion en el body'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'El campo email es obligatorio'}), 400
    if 'name' not in body:
        return  jsonify({'msg': 'Debes proporcionar un nombre'}), 400
    if 'password' not in body:
        return jsonify({'msg': 'Debes proporcionar una contraseña'}), 400
    
    new_register = User() 
    new_register.name = body['name']
    new_register.email = body['email']
    hash_password = bcrypt.generate_password_hash(body['password']).decode('utf-8')
    new_register.password = hash_password

    new_register.is_active = True
    
    try:
        db.session.add(new_register)
        db.session.commit()

    except IntegrityError:
        db.session.rollback()
        return jsonify({'msg': 'Ya existe un usuario con ese email'}), 400


    return jsonify({'msg': 'Usuario registrado!', 'register': new_register.serialize()}), 200


#-----ENDPOINTS PROTEGIDOS \/ 
@app.route('/api/private', methods=['GET'])
@jwt_required()
def privado():
    current_user_email = get_jwt_identity()
  
    current_user = User.query.filter_by(email=current_user_email).first() 
   
    if current_user is None:
        return jsonify({'msg': 'Usuario no encontrado'}), 404
    
    return jsonify({
        'msg': 'Gracias por probar que estas logeado', 
        'name': current_user.name}), 200

# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
