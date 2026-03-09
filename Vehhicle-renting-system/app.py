from flask import Flask, send_from_directory
from flask_cors import CORS
from backend.database import seed_vehicles
from backend.routes.auth_routes import auth_bp
from backend.routes.vehicle_routes import vehicle_bp
from backend.routes.booking_routes import booking_bp

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(vehicle_bp)
app.register_blueprint(booking_bp)

@app.route("/")
def index():
    return send_from_directory("frontend", "index.html")

@app.route("/register.html")
def register():
    return send_from_directory("frontend", "register.html")

@app.route("/login.html")
def login_page():
    return send_from_directory("frontend", "login.html")

@app.route("/vehicles.html")
def vehicles_page():
    return send_from_directory("frontend", "vehicles.html")

@app.route("/booking.html")
def booking_page():
    return send_from_directory("frontend", "booking.html")

@app.route("/css/<path:filename>")
def serve_css(filename):
    return send_from_directory("css", filename)

@app.route("/js/<path:filename>")
def serve_js(filename):
    return send_from_directory("js", filename)

if __name__ == "__main__":
    print("🚗 Starting Vehicle Renting System...")
    try:
        seed_vehicles()
    except Exception as e:
        print(f"⚠️  Could not seed vehicles: {e}")
    print("✅ Server running at http://127.0.0.1:5000")
    app.run(debug=True, port=5000)