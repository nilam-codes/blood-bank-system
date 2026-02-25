from flask import Flask, request, jsonify
import mysql.connector
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from datetime import datetime

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
    database="blood_bank"
)
cursor = db.cursor(dictionary=True)

# ============================================
# HELPER FUNCTIONS
# ============================================

# Home route
@app.route("/")
def home():
    return "API Running!"


def is_eligible_donor(email):
    """Check if donor donated in last 3 months"""
    cursor.execute("""
        SELECT donated_at FROM donations 
        WHERE donor_email = %s 
        ORDER BY donated_at DESC 
        LIMIT 1
    """, (email,))
    last_donation = cursor.fetchone()
    if last_donation is None:
        return True
    months_since = (datetime.now() - last_donation["donated_at"]).days / 30
    return months_since >= 3

def check_role(required_role, actual_role):
    """Check if user has required role"""
    return actual_role == required_role

# ============================================
# AUTH APIS
# ============================================

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data["name"]
    email = data["email"]
    password = data["password"]
    role = data.get("role", "donor")
    blood_group = data.get("blood_group", "")
    phone = data.get("phone", "")
    city = data.get("city", "")

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    try:
        query = """
        INSERT INTO users 
        (name, email, password, role, blood_group, phone, city) 
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (name, email, hashed_password, role, blood_group, phone, city))
        db.commit()
        return jsonify({"message": "Registered successfully!"})
    except mysql.connector.IntegrityError:
        return jsonify({"error": "Email already exists!"}), 400


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data["email"]
    password = data["password"]

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if user is None:
        return jsonify({"error": "User not found!"}), 404

    if bcrypt.check_password_hash(user["password"], password):
        return jsonify({
            "message": "Login successful!",
            "role": user["role"],
            "name": user["name"],
            "email": user["email"],
            "blood_group": user["blood_group"],
            "city": user["city"]
        })
    else:
        return jsonify({"error": "Invalid password!"}), 401

# ============================================
# INVENTORY APIS
# ============================================

@app.route("/inventory", methods=["GET"])
def get_inventory():
    """Get all blood group inventory"""
    db.reconnect()
    cursor.execute("SELECT * FROM inventory ORDER BY blood_group")
    inventory = cursor.fetchall()
    return jsonify(inventory)


@app.route("/inventory/<blood_group>", methods=["GET"])
def get_blood_group_inventory(blood_group):
    """Check specific blood group availability"""
    db.reconnect()
    cursor.execute("SELECT * FROM inventory WHERE blood_group = %s", (blood_group,))
    result = cursor.fetchone()
    if result:
        available = result["units_available"] > 0
        return jsonify({
            "blood_group": blood_group,
            "units_available": result["units_available"],
            "is_available": available,
            "status": "Available ✅" if available else "Not Available ❌"
        })
    return jsonify({"error": "Blood group not found"}), 404

# ============================================
# DONOR APIS
# ============================================

@app.route("/donate", methods=["POST"])
def donate():
    """Record a blood donation"""
    data = request.json
    donor_email = data["donor_email"]
    blood_group = data["blood_group"]
    units = data["units"]
    request_id = data.get("request_id", None)

    # Check eligibility
    if not is_eligible_donor(donor_email):
        return jsonify({
            "error": "You donated less than 3 months ago. Not eligible yet!"
        }), 400

    # Record donation
    query = "INSERT INTO donations (donor_email, blood_group, units, request_id) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (donor_email, blood_group, units, request_id))

    # Update inventory
    cursor.execute("""
        UPDATE inventory 
        SET units_available = units_available + %s,
        last_updated = NOW()
        WHERE blood_group = %s
    """, (units, blood_group))

    db.commit()
    return jsonify({"message": f"Thank you! {units} units of {blood_group} donated successfully!"})


@app.route("/mydonations", methods=["GET"])
def my_donations():
    """Donor sees their donation history"""
    db.reconnect()
    email = request.args.get("email")
    cursor.execute("""
        SELECT * FROM donations 
        WHERE donor_email = %s 
        ORDER BY donated_at DESC
    """, (email,))
    donations = cursor.fetchall()
    return jsonify(donations)


@app.route("/check-eligibility", methods=["GET"])
def check_eligibility():
    """Check if donor is eligible to donate"""
    email = request.args.get("email")
    eligible = is_eligible_donor(email)
    return jsonify({
        "eligible": eligible,
        "message": "You are eligible to donate!" if eligible else "Please wait 3 months since last donation!"
    })

# ============================================
# DONOR MATCHING
# ============================================

@app.route("/match-donors", methods=["GET"])
def match_donors():
    """Find matching donors by blood group and city"""
    db.reconnect()
    blood_group = request.args.get("blood_group")
    city = request.args.get("city", "")

    if city:
        cursor.execute("""
            SELECT id, name, email, phone, city, blood_group
            FROM users 
            WHERE blood_group = %s 
            AND role = 'donor'
            AND is_available = TRUE
            AND city = %s
        """, (blood_group, city))
    else:
        cursor.execute("""
            SELECT id, name, email, phone, city, blood_group
            FROM users 
            WHERE blood_group = %s 
            AND role = 'donor'
            AND is_available = TRUE
        """, (blood_group,))

    all_donors = cursor.fetchall()
    matched_donors = []

    for donor in all_donors:
        if not is_eligible_donor(donor["email"]):
            continue
        matched_donors.append(donor)

    return jsonify({
        "blood_group": blood_group,
        "total_matches": len(matched_donors),
        "donors": matched_donors
    })

# ============================================
# BLOOD REQUEST APIS
# ============================================

@app.route("/request", methods=["POST"])
def blood_request():
    """Patient submits blood request"""
    data = request.json
    patient_email = data["patient_email"]
    blood_group = data["blood_group"]
    units_needed = data["units_needed"]
    hospital_name = data["hospital_name"]
    city = data.get("city", "")
    urgency = data.get("urgency", "normal")

    # Check inventory
    cursor.execute("SELECT units_available FROM inventory WHERE blood_group = %s", (blood_group,))
    inventory = cursor.fetchone()

    inventory_status = "sufficient"
    if inventory and inventory["units_available"] < units_needed:
        inventory_status = "insufficient"

    query = """
    INSERT INTO blood_requests 
    (patient_email, blood_group, units_needed, hospital_name, city, urgency) 
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(query, (patient_email, blood_group, units_needed, hospital_name, city, urgency))
    db.commit()

    return jsonify({
        "message": "Blood request submitted successfully!",
        "inventory_status": inventory_status,
        "note": "Sufficient blood available!" if inventory_status == "sufficient" else "Low inventory! Donors needed urgently!"
    })


@app.route("/myrequests", methods=["GET"])
def my_requests():
    """Patient sees their own requests"""
    db.reconnect()
    email = request.args.get("email")
    cursor.execute("""
        SELECT * FROM blood_requests 
        WHERE patient_email = %s 
        ORDER BY created_at DESC
    """, (email,))
    requests = cursor.fetchall()
    return jsonify(requests)


@app.route("/openrequests", methods=["GET"])
def open_requests():
    """Donors see all pending requests"""
    db.reconnect()
    blood_group = request.args.get("blood_group", "")
    if blood_group:
        cursor.execute("""
            SELECT * FROM blood_requests 
            WHERE status = 'pending' 
            AND blood_group = %s
            ORDER BY urgency DESC, created_at ASC
        """, (blood_group,))
    else:
        cursor.execute("""
            SELECT * FROM blood_requests 
            WHERE status = 'pending'
            ORDER BY urgency DESC, created_at ASC
        """)
    requests = cursor.fetchall()
    return jsonify(requests)

# ============================================
# ADMIN APIS
# ============================================

@app.route("/allrequests", methods=["GET"])
def all_requests():
    """Admin sees all requests"""
    db.reconnect()
    role = request.args.get("role")
    if not check_role("admin", role):
        return jsonify({"error": "Unauthorized! Admin only!"}), 403
    cursor.execute("""
        SELECT * FROM blood_requests 
        ORDER BY urgency DESC, created_at DESC
    """)
    requests = cursor.fetchall()
    return jsonify(requests)


@app.route("/request/update/<int:id>", methods=["PUT"])
def update_request(id):
    """Admin updates request status"""
    data = request.json
    status = data["status"]
    role = data.get("role")
    if not check_role("admin", role):
        return jsonify({"error": "Unauthorized! Admin only!"}), 403

    if status == "fulfilled":
        cursor.execute("SELECT blood_group, units_needed FROM blood_requests WHERE id = %s", (id,))
        req = cursor.fetchone()
        if req:
            cursor.execute("""
                UPDATE inventory 
                SET units_available = GREATEST(units_available - %s, 0),
                last_updated = NOW()
                WHERE blood_group = %s
            """, (req["units_needed"], req["blood_group"]))

    cursor.execute("UPDATE blood_requests SET status = %s WHERE id = %s", (status, id))
    db.commit()
    return jsonify({"message": "Request updated successfully!"})


@app.route("/allusers", methods=["GET"])
def all_users():
    """Admin sees all users"""
    db.reconnect()
    role = request.args.get("role")
    if not check_role("admin", role):
        return jsonify({"error": "Unauthorized! Admin only!"}), 403
    cursor.execute("SELECT id, name, email, role, blood_group, city, phone FROM users")
    users = cursor.fetchall()
    return jsonify(users)

# ============================================
# DATA SCIENCE APIS
# ============================================

@app.route("/dashboard", methods=["GET"])
def dashboard():
    """Complete dashboard statistics"""
    db.reconnect()

    cursor.execute("SELECT COUNT(*) as total FROM users WHERE role = 'donor'")
    total_donors = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) as total FROM users WHERE role = 'patient'")
    total_patients = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) as total FROM blood_requests")
    total_requests = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) as total FROM blood_requests WHERE status = 'pending'")
    pending = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) as total FROM blood_requests WHERE status = 'fulfilled'")
    fulfilled = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) as total FROM blood_requests WHERE urgency = 'urgent'")
    urgent = cursor.fetchone()

    cursor.execute("SELECT SUM(units_available) as total FROM inventory")
    total_units = cursor.fetchone()

    return jsonify({
        "total_donors": total_donors["total"],
        "total_patients": total_patients["total"],
        "total_requests": total_requests["total"],
        "pending_requests": pending["total"],
        "fulfilled_requests": fulfilled["total"],
        "urgent_requests": urgent["total"],
        "total_blood_units": total_units["total"]
    })


@app.route("/bloodgroupwise", methods=["GET"])
def blood_group_wise():
    """Which blood group needed most"""
    db.reconnect()
    cursor.execute("""
        SELECT blood_group, COUNT(*) as total_requests
        FROM blood_requests
        GROUP BY blood_group
        ORDER BY total_requests DESC
    """)
    results = cursor.fetchall()
    return jsonify(results)


@app.route("/citywise", methods=["GET"])
def city_wise():
    """Which city has most donors"""
    db.reconnect()
    cursor.execute("""
        SELECT city, COUNT(*) as total_donors
        FROM users
        WHERE role = 'donor'
        GROUP BY city
        ORDER BY total_donors DESC
    """)
    results = cursor.fetchall()
    return jsonify(results)


@app.route("/timeline", methods=["GET"])
def timeline():
    """Requests over time"""
    db.reconnect()
    cursor.execute("""
        SELECT DATE(created_at) as date,
        COUNT(*) as total
        FROM blood_requests
        GROUP BY DATE(created_at)
        ORDER BY date
    """)
    results = cursor.fetchall()
    return jsonify(results)


@app.route("/urgencywise", methods=["GET"])
def urgency_wise():
    """Urgent vs normal requests"""
    db.reconnect()
    cursor.execute("""
        SELECT urgency, COUNT(*) as total
        FROM blood_requests
        GROUP BY urgency
    """)
    results = cursor.fetchall()
    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True)