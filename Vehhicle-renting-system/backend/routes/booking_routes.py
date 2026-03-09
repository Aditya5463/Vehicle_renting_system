from flask import Blueprint, request, jsonify
from backend.database import bookings_col, vehicles_col, users_col
from bson import ObjectId
from datetime import datetime

booking_bp = Blueprint("bookings", __name__)

def serialize_booking(b):
    return {
        "_id": str(b["_id"]),
        "user_id": str(b.get("user_id")),
        "vehicle_id": str(b.get("vehicle_id")),
        "vehicle_name": b.get("vehicle_name", ""),
        "user_name": b.get("user_name", ""),
        "booking_date": b.get("booking_date"),
        "return_date": b.get("return_date"),
        "total_price": b.get("total_price", 0),
        "status": b.get("status")
    }

@booking_bp.route("/book_vehicle", methods=["POST"])
def book_vehicle():
    data = request.get_json()
    required = ["user_id", "vehicle_id", "booking_date", "return_date"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    try:
        vid = ObjectId(data["vehicle_id"])
        uid = ObjectId(data["user_id"])
    except Exception:
        return jsonify({"error": "Invalid ID format"}), 400

    vehicle = vehicles_col.find_one({"_id": vid})
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404
    if not vehicle.get("availability"):
        return jsonify({"error": "Vehicle not available"}), 409

    user = users_col.find_one({"_id": uid})
    user_name = user["name"] if user else "Unknown"

    # Calculate total price
    try:
        b_date = datetime.strptime(data["booking_date"], "%Y-%m-%d")
        r_date = datetime.strptime(data["return_date"], "%Y-%m-%d")
        days = max((r_date - b_date).days, 1)
    except Exception:
        days = 1

    total_price = days * vehicle.get("price_per_day", 0)

    booking = {
        "user_id": uid,
        "vehicle_id": vid,
        "vehicle_name": vehicle.get("vehicle_name"),
        "user_name": user_name,
        "booking_date": data["booking_date"],
        "return_date": data["return_date"],
        "total_price": total_price,
        "status": "Booked"
    }
    result = bookings_col.insert_one(booking)
    vehicles_col.update_one({"_id": vid}, {"$set": {"availability": False}})

    return jsonify({
        "message": "Booking confirmed!",
        "booking_id": str(result.inserted_id),
        "total_price": total_price,
        "days": days
    }), 201


@booking_bp.route("/return_vehicle", methods=["PUT"])
def return_vehicle():
    data = request.get_json()
    if not data.get("booking_id"):
        return jsonify({"error": "booking_id required"}), 400

    try:
        bid = ObjectId(data["booking_id"])
    except Exception:
        return jsonify({"error": "Invalid booking ID"}), 400

    booking = bookings_col.find_one({"_id": bid})
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if booking.get("status") == "Returned":
        return jsonify({"error": "Already returned"}), 409

    bookings_col.update_one({"_id": bid}, {"$set": {"status": "Returned"}})
    vehicles_col.update_one({"_id": booking["vehicle_id"]}, {"$set": {"availability": True}})

    return jsonify({"message": "Vehicle returned successfully"}), 200


@booking_bp.route("/my_bookings/<user_id>", methods=["GET"])
def my_bookings(user_id):
    try:
        uid = ObjectId(user_id)
    except Exception:
        return jsonify({"error": "Invalid user ID"}), 400
    bookings = [serialize_booking(b) for b in bookings_col.find({"user_id": uid})]
    return jsonify(bookings), 200
