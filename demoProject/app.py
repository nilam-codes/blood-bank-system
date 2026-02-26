from flask import Flask, request, jsonify
import mysql.connector
from flask_bcrypt import Bcrypt
from flask_cors import CORS

app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app)

# ============================================
# DATABASE CONNECTION
# ============================================

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Root@123",
    database="attendance_system"
)

def get_cursor():
    if not db.is_connected():
        db.reconnect()
    return db.cursor(dictionary=True)

# ============================================
# BASIC ROUTE
# ============================================

@app.route("/")
def home():
    return "Attendance Analytics API Running 🚀"

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_risk_category(percentage):
    if percentage >= 75:
        return "Safe"
    elif percentage >= 60:
        return "Warning"
    else:
        return "Critical"

# ============================================
# AUTH APIS
# ============================================

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        if not data or not all(k in data for k in ("name","email","password")):
            return jsonify({"error":"Missing required fields"}),400
        cursor = get_cursor()

        hashed_password = bcrypt.generate_password_hash(
            data["password"]
        ).decode("utf-8")

        cursor.execute("""
            INSERT INTO users (name, email, password, role, department_id, year)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data["name"],
            data["email"],
            hashed_password,
            data.get("role", "student"),
            data.get("department_id", 1),
            data.get("year", None)
        ))

        db.commit()
        return jsonify({"message": "Registered successfully!"})

    except mysql.connector.IntegrityError:
        return jsonify({"error": "Email already exists!"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    cursor = get_cursor()
    data = request.json
    if not data or not all(k in data for k in ("email","password")):
        return jsonify({"error":"Missing required fields"}),400

    cursor.execute("SELECT * FROM users WHERE email=%s", (data["email"],))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found!"}), 404

    if bcrypt.check_password_hash(user["password"], data["password"]):
        return jsonify({
            "message": "Login successful!",
            "id": user["id"],
            "name": user["name"],
            "role": user["role"],
            "department_id": user["department_id"],
            "year": user["year"]
        })
    else:
        return jsonify({"error": "Invalid password!"}), 401

# ============================================
# ATTENDANCE MARKING
# ============================================

@app.route("/attendance/mark", methods=["POST"])
def mark_attendance():
    try:
        cursor = get_cursor()
        data = request.json

        # ✅ Validate required fields
        if not data or not all(k in data for k in ("student_id","subject_id","date","user_id")):
            return jsonify({"error":"Missing required fields"}),400

        # ✅ Check if user is staff or admin
        cursor.execute("SELECT role FROM users WHERE id=%s", (data["user_id"],))
        user = cursor.fetchone()

        if not user or user["role"] not in ("staff","admin"):
            return jsonify({"error":"Unauthorized. Staff/Admin only."}),403

        # ✅ Insert attendance
        cursor.execute("""
            INSERT INTO attendance (student_id, subject_id, date, status)
            VALUES (%s, %s, %s, %s)
        """, (
            data["student_id"],
            data["subject_id"],
            data["date"],
            data.get("status", "present")
        ))

        db.commit()
        return jsonify({"message": "Attendance marked successfully!"})

    except mysql.connector.IntegrityError:
        return jsonify({"error":"Attendance already marked!"}),400

# ============================================
# STUDENT ATTENDANCE VIEW
# ============================================

@app.route("/attendance/student", methods=["GET"])
def student_attendance():
    cursor = get_cursor()
    student_id = request.args.get("student_id")

    cursor.execute("""
        SELECT
            s.subject_name,
            COUNT(*) as total_classes,
            SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as present_count,
            ROUND(
                (SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END)
                / NULLIF(COUNT(*),0)) * 100,
                2
            ) as percentage
        FROM attendance a
        JOIN subjects s ON a.subject_id = s.id
        WHERE a.student_id = %s
        GROUP BY s.id
    """, (student_id,))

    subjects = cursor.fetchall()

    result = []
    for sub in subjects:
        sub["risk_category"] = get_risk_category(sub["percentage"])
        sub["absent"] = sub["total_classes"] - sub["present_count"]
        result.append(sub)

    # Overall
    cursor.execute("""
        SELECT ROUND(
            (SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)
            / NULLIF(COUNT(*),0)) * 100,
            2
        ) as overall_percentage
        FROM attendance
        WHERE student_id=%s
    """, (student_id,))

    row = cursor.fetchone()
    overall = row["overall_percentage"] if row and row["overall_percentage"] else 0

    return jsonify({
        "student_id": student_id,
        "overall_percentage": overall,
        "overall_risk": get_risk_category(overall),
        "subjects": result
    })

# ============================================
# DASHBOARD ANALYTICS
# ============================================

@app.route("/analytics/dashboard", methods=["GET"])
def dashboard():
    cursor = get_cursor()

    cursor.execute("SELECT COUNT(*) as total FROM users WHERE role='student'")
    total_students = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as total FROM subjects")
    total_subjects = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as total FROM attendance")
    total_records = cursor.fetchone()["total"]

    cursor.execute("""
        SELECT ROUND(
            (SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)
            / NULLIF(COUNT(*),0)) * 100,
            2
        ) as overall_percentage
        FROM attendance
    """)
    row = cursor.fetchone()
    overall = row["overall_percentage"] if row and row["overall_percentage"] else 0

    return jsonify({
        "total_students": total_students,
        "total_subjects": total_subjects,
        "total_records": total_records,
        "overall_attendance_percentage": overall
    })

# ============================================
# DEPARTMENT ANALYTICS
# ============================================

@app.route("/analytics/department", methods=["GET"])
def department_analytics():
    cursor = get_cursor()

    cursor.execute("""
        SELECT
            d.name as department,
            COUNT(DISTINCT u.id) as total_students,
            ROUND(
                (SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END)
                / NULLIF(COUNT(a.id),0)) * 100,
                2
            ) as avg_attendance
        FROM attendance a
        JOIN users u ON a.student_id=u.id
        JOIN departments d ON u.department_id=d.id
        WHERE u.role='student'
        GROUP BY d.id
    """)

    return jsonify(cursor.fetchall())

# ============================================
# AT RISK API
# ============================================
@app.route("/analytics/at-risk", methods=["GET"])
def at_risk_students():
    cursor = get_cursor()

    cursor.execute("""
        SELECT
            u.id,
            u.name,
            u.email,
            d.name as department,
            ROUND(
                (SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END)
                / NULLIF(COUNT(*),0)) * 100,
                2
            ) as percentage
        FROM attendance a
        JOIN users u ON a.student_id = u.id
        JOIN departments d ON u.department_id = d.id
        WHERE u.role = 'student'
        GROUP BY u.id, u.name, u.email, d.name
        ORDER BY percentage ASC
    """)

    students = cursor.fetchall()
    safe = []
    warning = []
    critical = []

    for student in students:
        risk = get_risk_category(student["percentage"])
        student["risk_category"] = risk
        if risk == "Critical":
            critical.append(student)
        elif risk == "Warning":
            warning.append(student)
        else:
            safe.append(student)

    return jsonify({
        "summary": {
            "critical_count": len(critical),
            "warning_count": len(warning),
            "safe_count": len(safe)
        },
        "critical": critical,
        "warning": warning,
        "safe": safe
    })

# ============================================
# Bulk Attendance API
# ============================================
@app.route("/attendance/bulk", methods=["POST"])
def mark_bulk_attendance():
    cursor = get_cursor()
    data = request.json
    if not data or not all(k in data for k in ("subject_id", "date", "attendance_list")):
        return jsonify({"error": "Missing required fields"}), 400
    subject_id = data["subject_id"]
    date = data["date"]
    attendance_list = data["attendance_list"]
    # Format: [{"student_id": 1, "status": "present"}, ...]

    success_count = 0
    skip_count = 0

    for record in attendance_list:
        try:
            cursor.execute("""
                INSERT INTO attendance (student_id, subject_id, date, status)
                VALUES (%s, %s, %s, %s)
            """, (record["student_id"], subject_id, date, record["status"]))
            success_count += 1
        except mysql.connector.IntegrityError:
            skip_count += 1
            continue

    db.commit()
    return jsonify({
        "message": "Bulk attendance marked!",
        "success": success_count,
        "skipped": skip_count
    })

# ============================================
# Departments API
# ============================================
@app.route("/departments", methods=["GET"])
def get_departments():
    cursor = get_cursor()
    cursor.execute("SELECT * FROM departments")
    return jsonify(cursor.fetchall())

# ============================================
# Students API
# ============================================
@app.route("/students", methods=["GET"])
def get_students():
    cursor = get_cursor()
    department_id = request.args.get("department_id", "")

    if department_id:
        cursor.execute("""
            SELECT u.id, u.name, u.email, u.year,
            d.name as department_name
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE u.role = 'student'
            AND u.department_id = %s
        """, (department_id,))
    else:
        cursor.execute("""
            SELECT u.id, u.name, u.email, u.year,
            d.name as department_name
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE u.role = 'student'
        """)

    return jsonify(cursor.fetchall())

# ============================================
# Subjects API
# ============================================
@app.route("/subjects", methods=["GET"])
def get_subjects():
    cursor = get_cursor()
    department_id = request.args.get("department_id", "")

    if department_id:
        cursor.execute("""
            SELECT s.*, d.name as department_name,
            u.name as staff_name
            FROM subjects s
            JOIN departments d ON s.department_id = d.id
            LEFT JOIN users u ON s.staff_id = u.id
            WHERE s.department_id = %s
        """, (department_id,))
    else:
        cursor.execute("""
            SELECT s.*, d.name as department_name,
            u.name as staff_name
            FROM subjects s
            JOIN departments d ON s.department_id = d.id
            LEFT JOIN users u ON s.staff_id = u.id
        """)

    return jsonify(cursor.fetchall())
# ============================================
#  Subject wise attendance
# ============================================
@app.route("/attendance/subject", methods=["GET"])
def subject_attendance():
    cursor = get_cursor()
    subject_id = request.args.get("subject_id")

    cursor.execute("""
        SELECT
            u.id as student_id,
            u.name,
            u.email,
            COUNT(*) as total_classes,
            SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as present_count,
            ROUND(
                (SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END)
                / NULLIF(COUNT(*),0)) * 100,
                2
            ) as percentage
        FROM attendance a
        JOIN users u ON a.student_id = u.id
        WHERE a.subject_id = %s
        GROUP BY u.id, u.name, u.email
    """, (subject_id,))

    students = cursor.fetchall()
    result = []

    for student in students:
        student["risk_category"] = get_risk_category(student["percentage"])
        student["absent"] = student["total_classes"] - student["present_count"]
        result.append(student)

    return jsonify(result)

# ============================================
# MONTHLY TREND
# ============================================

@app.route("/analytics/trend", methods=["GET"])
def attendance_trend():
    cursor = get_cursor()

    cursor.execute("""
        SELECT
            DATE_FORMAT(date, '%Y-%m') as month,
            ROUND(
                (SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)
                / NULLIF(COUNT(*),0)) * 100,
                2
            ) as attendance_percentage
        FROM attendance
        GROUP BY DATE_FORMAT(date, '%Y-%m')
        ORDER BY month ASC
    """)

    return jsonify(cursor.fetchall())

# ============================================

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)