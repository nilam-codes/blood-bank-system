from flask import Flask, request, jsonify
import mysql.connector
from flask_bcrypt import Bcrypt
from flask_cors import CORS

app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app)

# Database connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Root@123",
    database="user_api"
)

cursor = db.cursor(dictionary=True)

# Home route
@app.route("/")
def home():
    return "API Running!"

# Register
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data["name"]
    email = data["email"]
    password = data["password"]
    role = data.get("role", "student")
    
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    
    query = "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)"
    try:
        cursor.execute(query, (name, email, hashed_password, role))
        db.commit()
        return jsonify({"message": "User registered successfully"})
    except mysql.connector.IntegrityError:
        return jsonify({"error": "Email already exists"}), 400

# Login
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data["email"]
    password = data["password"]
    
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    
    if user is None:
        return jsonify({"error": "User not found"}), 404
    
    if bcrypt.check_password_hash(user["password"], password):
        return jsonify({"message": "Login successful", "role": user["role"], "name": user["name"]})
    else:
        return jsonify({"error": "Invalid password"}), 401

# Submit complaint
@app.route("/complaint", methods=["POST"])
def submit_complaint():
    data = request.json
    user_email = data["user_email"]
    title = data["title"]
    description = data["description"]
    
    # Check if user exists
    cursor.execute("SELECT * FROM users WHERE email = %s", (user_email,))
    user = cursor.fetchone()
    
    if user is None:
        return jsonify({"error": "User not found, please register first"}), 404
    
    query = "INSERT INTO complaints (user_email, title, description) VALUES (%s, %s, %s)"
    cursor.execute(query, (user_email, title, description))
    db.commit()
    
    return jsonify({"message": "Complaint submitted successfully"})

# Admin sees all complaints
@app.route("/allcomplaints", methods=["GET"])
def all_complaints():
    db.reconnect()  # refresh connection
    cursor.execute("SELECT * FROM complaints")
    complaints = cursor.fetchall()
    return jsonify(complaints)

# Student sees their own complaints
@app.route("/mycomplaints", methods=["GET"])
def my_complaints():
    db.reconnect()  # refresh connection
    email = request.args.get("email")
    cursor.execute("SELECT * FROM complaints WHERE user_email = %s", (email,))
    complaints = cursor.fetchall()
    return jsonify(complaints)

# Admin updates complaint status
@app.route("/complaint/update/<int:id>", methods=["PUT"])
def update_complaint(id):
    data = request.json
    status = data["status"]
    
    query = "UPDATE complaints SET status = %s WHERE id = %s"
    cursor.execute(query, (status, id))
    db.commit()
    
    return jsonify({"message": "Complaint status updated successfully"})

if __name__ == "__main__":
    app.run(debug=True)