# 🍽️ CampusBites – UPES Food Discovery Platform

**Discover. Compare. Eat.**

CampusBites is a campus-focused food discovery platform designed to help students explore food outlets at UPES, discover available menu items, compare prices and find meals that fit their budgets.

The platform brings food information from different campus outlets into one place, making it easier for students to decide what to eat.

---

## ✨ Features

- **Food Discovery:** Explore food outlets and browse their menus.
- **Smart Search:** Search for dishes by name.
- **Category Filtering:** Discover food by categories such as Beverages, Desserts, Fast Food, Main Course, Snacks and South Indian.
- **Price Comparison:** Compare dish prices across different food outlets.
- **Budget-Based Recommendations:** Find food items according to a specified budget and preferences.
- **Ratings and Reviews:** Submit ratings, write reviews and view feedback from other users.
- **Average Ratings:** View average dish ratings and the total number of reviews.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Backend development and data processing |
| Pandas | Data cleaning and analysis |
| NumPy | Numerical operations |
| Matplotlib / Seaborn | Data visualization |
| FastAPI | REST API development |
| SQLite | Database management |
| SQLAlchemy | Object-relational mapping |
| HTML | Frontend structure |
| CSS | Frontend styling |
| JavaScript | Frontend interactivity |

## 📊 Dataset

The platform uses a consolidated menu dataset containing information from six UPES food outlets.

- **Food outlets:** 6
- **Menu items:** 363
- **Attributes:** Shop Name, Item Name, Category and Price

The dataset is used for menu exploration, price analysis, category-based filtering and budget recommendations.

## 🏗️ Project Structure

```text
Campus-Bites/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── import_data.py
│   └── requirements.txt
│
├── data/
│   ├── raw/
│   └── processed/
│       └── campusbites_master.csv
│
├── notebooks/
│   ├── 01_data_inspection.ipynb
│   ├── 02_exploratory_data_analysis.ipynb
│   └── 03_advanced_data_analysis.ipynb
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── docs/
│
├── .gitignore
├── README.md
└── requirements.txt
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd "Campus Bites"
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r backend/requirements.txt
```

### 4. Initialize the database and import menu data

From the project root directory, run:

```bash
python -m backend.import_data
```

This creates the SQLite database tables and imports the menu data.

### 5. Start the FastAPI server

```bash
python -m uvicorn backend.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

### 6. Explore the API documentation

Open:

```text
http://127.0.0.1:8000/docs
```

FastAPI provides interactive API documentation through Swagger UI.

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Welcome message |
| GET | `/health` | API health check |
| GET | `/shops` | Retrieve food outlets |
| GET | `/items` | Retrieve menu items and ratings |
| GET | `/items/search` | Search and filter food items |
| GET | `/recommendations` | Get budget-based recommendations |
| POST | `/items/{item_id}/reviews` | Submit a food review |
| GET | `/items/{item_id}/reviews` | Retrieve food reviews |

## 💡 Recommendation Logic

CampusBites provides budget-based food recommendations by considering:

- Maximum price specified by the student.
- Preferred food category.
- Preferred food outlet.
- Availability of food items.

Matching food items are displayed in ascending order of price, helping students discover affordable options.

## 🔮 Future Enhancements

- Student authentication and profile management.
- Verified student reviews and ratings.
- Personalized food recommendations.
- Food popularity analytics using real user feedback.
- Advanced price comparison and interactive dashboards.
- Deployment for campus-wide accessibility.

## 🎯 Project Objective

CampusBites aims to simplify food discovery within the UPES campus by bringing menu information, pricing, reviews and budget-based recommendations together in a single platform.

---

**CampusBites – Discover. Compare. Eat.**