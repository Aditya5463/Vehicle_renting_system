from flask import Blueprint, request, jsonify
from backend.database import vehicles_col
from bson import ObjectId

vehicle_bp = Blueprint("vehicles", __name__)

def serialize_vehicle(v):
    return {
        "_id": str(v["_id"]),
        "vehicle_name": v.get("vehicle_name"),
        "type": v.get("type"),
        "price_per_day": v.get("price_per_day"),
        "availability": v.get("availability"),
        "location": v.get("location"),
        "image": v.get("image", "car1")
    }

@vehicle_bp.route("/vehicles", methods=["GET"])
def get_vehicles():
    vtype = request.args.get("type")
    location = request.args.get("location")
    query = {}
    if vtype:
        query["type"] = vtype
    if location:
        query["location"] = location
    vehicles = [serialize_vehicle(v) for v in vehicles_col.find(query)]
    return jsonify(vehicles), 200


@vehicle_bp.route("/add_vehicle", methods=["POST"])
def add_vehicle():
    data = request.get_json()
    required = ["vehicle_name", "type", "price_per_day", "location"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    vehicle = {
        "vehicle_name": data["vehicle_name"],
        "type": data["type"],
        "price_per_day": float(data["price_per_day"]),
        "availability": data.get("availability", True),
        "location": data["location"],
        "image": data.get("image", "car1")
    }
    result = vehicles_col.insert_one(vehicle)
    return jsonify({"message": "Vehicle added", "vehicle_id": str(result.inserted_id)}), 201
