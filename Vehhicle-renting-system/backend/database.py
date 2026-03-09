from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["vehicle_renting_system"]

users_col = db["users"]
vehicles_col = db["vehicles"]
bookings_col = db["bookings"]

def seed_vehicles():
    if vehicles_col.count_documents({}) == 0:
        sample_vehicles = [
            {"vehicle_name": "Honda City", "type": "Car", "price_per_day": 2500, "availability": True, "location": "Ahmedabad", "image": "car1"},
            {"vehicle_name": "Royal Enfield", "type": "Bike", "price_per_day": 800, "availability": True, "location": "Ahmedabad", "image": "bike1"},
            {"vehicle_name": "Toyota Innova", "type": "SUV", "price_per_day": 3500, "availability": True, "location": "Surat", "image": "suv1"},
            {"vehicle_name": "Honda Activa", "type": "Scooter", "price_per_day": 400, "availability": True, "location": "Vadodara", "image": "scooter1"},
            {"vehicle_name": "Tata Nexon", "type": "SUV", "price_per_day": 3000, "availability": True, "location": "Ahmedabad", "image": "suv2"},
            {"vehicle_name": "Maruti Swift", "type": "Car", "price_per_day": 1800, "availability": True, "location": "Rajkot", "image": "car2"},
            {"vehicle_name": "KTM Duke 390", "type": "Bike", "price_per_day": 1200, "availability": True, "location": "Ahmedabad", "image": "bike2"},
            {"vehicle_name": "Hyundai Creta", "type": "SUV", "price_per_day": 3200, "availability": False, "location": "Surat", "image": "suv3"},
        ]
        vehicles_col.insert_many(sample_vehicles)
        print("✅ Sample vehicles seeded.")
