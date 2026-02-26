import mysql.connector
from flask_bcrypt import Bcrypt
from flask import Flask

app = Flask(__name__)
bcrypt = Bcrypt(app)

# Database Configuration (match app.py)
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "Root@123"
}

def init_database():
    try:
        # 1. Connect to MySQL
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # 2. Create Database
        cursor.execute("CREATE DATABASE IF NOT EXISTS attendance_system")
        cursor.execute("USE attendance_system")
        print("Database 'attendance_system' ready.")

        # 3. Create Tables
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS departments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                department_name VARCHAR(100) NOT NULL
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('student', 'staff', 'admin') NOT NULL,
                department_id INT,
                year VARCHAR(10),
                FOREIGN KEY (department_id) REFERENCES departments(id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS subjects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                subject_name VARCHAR(100) NOT NULL,
                subject_code VARCHAR(20) UNIQUE NOT NULL,
                department_id INT,
                staff_id INT,
                FOREIGN KEY (department_id) REFERENCES departments(id),
                FOREIGN KEY (staff_id) REFERENCES users(id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT,
                subject_id INT,
                date DATE NOT NULL,
                status ENUM('present', 'absent') NOT NULL,
                FOREIGN KEY (student_id) REFERENCES users(id),
                FOREIGN KEY (subject_id) REFERENCES subjects(id)
            )
        """)
        print("Tables created successfully.")

        # 4. Seed Departments
        cursor.execute("SELECT COUNT(*) FROM departments")
        if cursor.fetchone()[0] == 0:
            cursor.execute("INSERT INTO departments (id, department_name) VALUES (1, 'CSE'), (2, 'ECE'), (3, 'MECH'), (4, 'CIVIL')")
            print("Departments seeded.")

        # 5. Seed Users (with hashed passwords)
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            pw_student = bcrypt.generate_password_hash("student123").decode('utf-8')
            pw_staff = bcrypt.generate_password_hash("staff123").decode('utf-8')
            pw_admin = bcrypt.generate_password_hash("admin123").decode('utf-8')
            
            users = [
                ("Aarav Sharma", "student@college.edu", pw_student, 'student', 1, '3rd'),
                ("Dr. Priya Menon", "staff@college.edu", pw_staff, 'staff', 1, None),
                ("Dr. R. Venkat", "admin@college.edu", pw_admin, 'admin', None, None)
            ]
            cursor.executemany("INSERT INTO users (name, email, password, role, department_id, year) VALUES (%s, %s, %s, %s, %s, %s)", users)
            print("Demo users seeded (Pass: student123, staff123, admin123).")

        conn.commit()
        cursor.close()
        conn.close()
        print("\nSUCCESS: AttendIQ Database initialized!")
        
    except mysql.connector.Error as err:
        print(f"ERROR: {err}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    init_database()
