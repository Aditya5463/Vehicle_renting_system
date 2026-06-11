import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

# Register blueprints with error handling
try:
    from backend.routes.auth_routes import auth_bp
    from backend.routes.vehicle_routes import vehicle_bp
    from backend.routes.booking_routes import booking_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(vehicle_bp)
    app.register_blueprint(booking_bp)
except Exception as e:
    print(f"⚠️  Could not register blueprints: {e}")

# Determine base directory for serving files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route("/")
def index():
    return send_from_directory(os.path.join(BASE_DIR, "frontend"), "index.html")

@app.route("/register.html")
def register():
    return send_from_directory(os.path.join(BASE_DIR, "frontend"), "register.html")

@app.route("/login.html")
def login_page():
    return send_from_directory(os.path.join(BASE_DIR, "frontend"), "login.html")

@app.route("/vehicles.html")
def vehicles_page():
    return send_from_directory(os.path.join(BASE_DIR, "frontend"), "vehicles.html")

@app.route("/booking.html")
def booking_page():
    return send_from_directory(os.path.join(BASE_DIR, "frontend"), "booking.html")

@app.route("/css/<path:filename>")
def serve_css(filename):
    return send_from_directory(os.path.join(BASE_DIR, "css"), filename)

@app.route("/js/<path:filename>")
def serve_js(filename):
    return send_from_directory(os.path.join(BASE_DIR, "js"), filename)

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

# Only seed and run dev server locally
if __name__ == "__main__":
    print("🚗 Starting Vehicle Renting System...")
    try:
        from backend.database import seed_vehicles
        seed_vehicles()
    except Exception as e:
        print(f"⚠️  Could not seed vehicles: {e}")
    print("✅ Server running at http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
