
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from backend.database import engine, Base, SessionLocal
from backend import models


# Structure for submitting student reviews
class ReviewCreate(BaseModel):
    student_name: str = Field(min_length=2, max_length=100)
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=2, max_length=1000)

# Create database tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CampusBites API",
    description="UPES Food Discovery Platform",
    version="1.0.0"
)

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Welcome to CampusBites!",
        "status": "API is running successfully"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Retrieve shops from SQLite
@app.get("/shops")
def get_shops():
    db = SessionLocal()

    try:
        shops = db.query(models.FoodShop).all()

        return [
            {
                "id": shop.id,
                "name": shop.name,
                "total_items": len(shop.food_items)
            }
            for shop in shops
        ]

    finally:
        db.close()



# Retrieve all food items with ratings
@app.get("/items")
def get_items():
    db = SessionLocal()

    try:
        items = db.query(models.FoodItem).all()

        result = []

        for item in items:
            ratings = [review.rating for review in item.reviews]

            average_rating = (
                round(sum(ratings) / len(ratings), 2)
                if ratings else None
            )

            result.append({
                "id": item.id,
                "name": item.name,
                "category": item.category,
                "price": item.price,
                "shop_name": item.shop.name,
                "average_rating": average_rating,
                "total_reviews": len(ratings)
            })

        return result

    finally:
        db.close()


# Search and filter food items
@app.get("/items/search")
def search_items(
    name: str = None,
    category: str = None,
    shop: str = None,
    max_price: float = None
):
    db = SessionLocal()

    try:
        query = db.query(models.FoodItem)

        # Normalize user input
        if name:
            name = " ".join(name.strip().split())
            query = query.filter(
                models.FoodItem.name.ilike(f"%{name}%")
            )

        if category:
            category = " ".join(category.strip().split())
            query = query.filter(
                models.FoodItem.category.ilike(category)
            )

        if shop:
            shop = " ".join(shop.strip().split())
            query = query.join(models.FoodShop).filter(
                models.FoodShop.name.ilike(shop)
            )

        if max_price is not None:
            query = query.filter(
                models.FoodItem.price <= max_price
            )

        items = query.all()

        return [
            {
                "id": item.id,
                "name": item.name,
                "category": item.category,
                "price": item.price,
                "shop_name": item.shop.name
            }
            for item in items
        ]

    finally:
        db.close()


# Recommend food items based on budget and preferences
@app.get("/recommendations")
def get_recommendations(
    budget: float,
    category: str = None,
    shop: str = None
):
    db = SessionLocal()

    try:
        query = db.query(models.FoodItem).filter(
            models.FoodItem.price <= budget,
            models.FoodItem.is_available == True
        )

        if category:
            category = " ".join(category.strip().split())
            query = query.filter(
                models.FoodItem.category.ilike(category)
            )

        if shop:
            shop = " ".join(shop.strip().split())
            query = query.join(models.FoodShop).filter(
                models.FoodShop.name.ilike(shop)
            )

        items = query.order_by(
            models.FoodItem.price.asc()
        ).all()

        return {
            "budget": budget,
            "total_recommendations": len(items),
            "recommendations": [
                {
                    "name": item.name,
                    "category": item.category,
                    "price": item.price,
                    "shop": item.shop.name
                }
                for item in items
            ]
        }

    finally:
        db.close()


# Submit a review for a food item
@app.post("/items/{item_id}/reviews")
def add_review(item_id: int, review: ReviewCreate):
    db = SessionLocal()

    try:
        # Check whether the food item exists
        item = db.query(models.FoodItem).filter(
            models.FoodItem.id == item_id
        ).first()

        if item is None:
            return {"error": "Food item not found"}

        # Create a new review
        new_review = models.Review(
            student_name=review.student_name,
            rating=review.rating,
            comment=review.comment,
            food_item_id=item_id
        )

        db.add(new_review)
        db.commit()
        db.refresh(new_review)

        return {
            "message": "Review submitted successfully!",
            "review_id": new_review.id,
            "food_item": item.name,
            "student_name": new_review.student_name,
            "rating": new_review.rating,
            "comment": new_review.comment
        }

    finally:
        db.close()


# Retrieve reviews for a food item
@app.get("/items/{item_id}/reviews")
def get_reviews(item_id: int):
    db = SessionLocal()

    try:
        item = db.query(models.FoodItem).filter(
            models.FoodItem.id == item_id
        ).first()

        if item is None:
            return {"error": "Food item not found"}

        reviews = db.query(models.Review).filter(
            models.Review.food_item_id == item_id
        ).all()

        return {
            "food_item": item.name,
            "total_reviews": len(reviews),
            "average_rating": (
                round(sum(r.rating for r in reviews) / len(reviews), 2)
                if reviews else None
            ),
            "reviews": [
                {
                    "student_name": r.student_name,
                    "rating": r.rating,
                    "comment": r.comment
                }
                for r in reviews
            ]
        }

    finally:
        db.close()
