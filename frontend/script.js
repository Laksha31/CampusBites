
// ==========================================
// CAMPUSBITES - JAVASCRIPT
// ==========================================

// FastAPI backend URL
const API_URL = "http://127.0.0.1:8000";


// ==========================================
// 1. LOAD FOOD SHOPS
// ==========================================

async function loadShops() {

    const shopContainer = document.getElementById("shopContainer");
    const shopFilter = document.getElementById("shopFilter");

    try {

        const response = await fetch(`${API_URL}/shops`);

        if (!response.ok) {
            throw new Error("Unable to load food shops");
        }

        const shops = await response.json();

        shopContainer.innerHTML = "";
        shopFilter.innerHTML = '<option value="">All Shops</option>';

        document.getElementById("shopCount").textContent = shops.length;

        shops.forEach(shop => {

            // Create clickable shop card
            const card = document.createElement("div");
            card.className = "shop-card";

            card.innerHTML = `
                <div class="shop-icon">🍽️</div>
                <h3>${escapeHTML(shop.name)}</h3>
                <p>${shop.total_items} menu items available</p>
                <span class="shop-explore">Explore Menu →</span>
            `;

            card.addEventListener("click", () => {

                document.getElementById("shopFilter").value = shop.name;

                document.getElementById("searchInput").value = "";
                document.getElementById("categoryFilter").value = "";
                document.getElementById("priceFilter").value = "";

                searchItems();

                document.getElementById("menu").scrollIntoView({
                    behavior: "smooth"
                });

            });

            shopContainer.appendChild(card);

            // Add shop to filter dropdown
            const option = document.createElement("option");

            option.value = shop.name;
            option.textContent = shop.name;

            shopFilter.appendChild(option);

        });

    } catch (error) {

        console.error("Shop loading error:", error);

        shopContainer.innerHTML =
            '<p class="empty-message">Unable to load food shops. Please check the backend server.</p>';

    }

}


// ==========================================
// 2. LOAD ALL FOOD ITEMS
// ==========================================

async function loadItems() {

    try {

        const response = await fetch(`${API_URL}/items`);

        if (!response.ok) {
            throw new Error("Unable to load menu items");
        }

        const items = await response.json();

        document.getElementById("itemCount").textContent = items.length;

        displayItems(items);

    } catch (error) {

        console.error("Menu loading error:", error);

        document.getElementById("foodContainer").innerHTML =
            '<p class="empty-message">Unable to load menu. Please check your connection.</p>';

    }

}


// ==========================================
// 3. DISPLAY FOOD ITEMS
// ==========================================


const ITEMS_PER_PAGE = 6;

// Track how many items are currently displayed
const displayedCounts = {};

function displayItems(items, containerId = "foodContainer") {

    const container = document.getElementById(containerId);

    container.innerHTML = "";

    // Start with 6 items whenever new results are loaded
    displayedCounts[containerId] = ITEMS_PER_PAGE;

    if (!items || items.length === 0) {

        container.innerHTML =
            '<p class="empty-message">No food items found. Try different filters.</p>';

        return;

    }

    // Function to render the visible items
    function renderItems() {

        container.innerHTML = "";

        const visibleCount = displayedCounts[containerId];

        const visibleItems = items.slice(0, visibleCount);

        visibleItems.forEach(item => {

            const card = document.createElement("div");
            card.className = "food-card";

            const ratingText = item.average_rating != null
                ? `⭐ ${item.average_rating} / 5 (${item.total_reviews ?? 0} reviews)`
                : "☆ No ratings yet";

            card.innerHTML = `
                <span class="category">
                    ${escapeHTML(item.category || "Other")}
                </span>

                <h3>${escapeHTML(item.name)}</h3>

                <p class="shop-name">
                    📍 ${escapeHTML(item.shop_name)}
                </p>

                <p class="food-price">
                    ₹${Number(item.price).toFixed(2)}
                </p>

                <p class="rating">
                    ${ratingText}
                </p>

                <p class="item-id">
                    Item ID: ${item.id}
                </p>
            `;

            // View reviews button
            const reviewButton = document.createElement("button");

            reviewButton.className = "view-reviews-button";
            reviewButton.textContent = "View Reviews →";
            reviewButton.type = "button";

            reviewButton.addEventListener("click", () => {
                showReviews(item.id, item.name);
            });

            card.appendChild(reviewButton);

            container.appendChild(card);

        });

        // Show More button
        if (visibleCount < items.length) {

            const buttonContainer = document.createElement("div");

            buttonContainer.className = "show-more-container";

            const showMoreButton = document.createElement("button");

            showMoreButton.className = "show-more-button";
            showMoreButton.type = "button";
            showMoreButton.textContent = "Show More Items ↓";

            showMoreButton.addEventListener("click", () => {

                displayedCounts[containerId] += ITEMS_PER_PAGE;

                renderItems();

            });

            buttonContainer.appendChild(showMoreButton);

            container.appendChild(buttonContainer);

        }

    }

    // Initial display
    renderItems();

}



// ==========================================
// 4. SEARCH AND FILTER FOOD ITEMS
// ==========================================

async function searchItems() {

    const name = document.getElementById("searchInput").value.trim();

    const category = document.getElementById("categoryFilter").value;

    const shop = document.getElementById("shopFilter").value;

    const maxPrice = document.getElementById("priceFilter").value;

    const params = new URLSearchParams();

    if (name) {
        params.append("name", name);
    }

    if (category) {
        params.append("category", category);
    }

    if (shop) {
        params.append("shop", shop);
    }

    if (maxPrice !== "") {

        if (Number(maxPrice) < 0) {
            alert("Please enter a valid maximum price.");
            return;
        }

        params.append("max_price", maxPrice);

    }

    const container = document.getElementById("foodContainer");

    container.innerHTML =
        '<p class="loading-message">Searching food items...</p>';

    try {

        const response = await fetch(
            `${API_URL}/items/search?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error("Search request failed");
        }

        const items = await response.json();

        displayItems(items);

    } catch (error) {

        console.error("Search error:", error);

        container.innerHTML =
            '<p class="empty-message">Unable to search right now. Please try again.</p>';

    }

}


// ==========================================
// 5. RESET SEARCH FILTERS
// ==========================================

function resetFilters() {

    document.getElementById("searchInput").value = "";

    document.getElementById("categoryFilter").value = "";

    document.getElementById("shopFilter").value = "";

    document.getElementById("priceFilter").value = "";

    loadItems();

}


// ==========================================
// 6. BUDGET-BASED RECOMMENDATIONS
// ==========================================

async function getRecommendations() {

    const budget = document.getElementById("budgetInput").value;

    const category = document.getElementById("recommendCategory").value;

    const container =
        document.getElementById("recommendationContainer");

    if (!budget || Number(budget) <= 0) {

        alert("Please enter a valid budget.");

        return;

    }

    const params = new URLSearchParams();

    params.append("budget", budget);

    if (category) {
        params.append("category", category);
    }

    container.innerHTML =
        '<p class="loading-message">Finding food recommendations...</p>';

    try {

        const response = await fetch(
            `${API_URL}/recommendations?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error("Recommendation request failed");
        }

        const data = await response.json();

        if (!data.recommendations || data.recommendations.length === 0) {

            container.innerHTML =
                '<p class="empty-message">No dishes found within this budget. Try increasing your budget.</p>';

            return;

        }

        // Display recommendations first
        displayItems(
            data.recommendations.map(item => ({
                ...item,
                average_rating: null,
                total_reviews: 0
            })),
            "recommendationContainer"
        );

        // Add heading without clearing the food cards
        const heading = document.createElement("div");

        heading.className = "recommendation-result-heading";

        heading.innerHTML = `
            <h3>${data.total_recommendations} recommendations found</h3>
            <p>Food items within your budget of ₹${Number(data.budget).toFixed(2)}</p>
        `;

        container.prepend(heading);

    } catch (error) {

        console.error("Recommendation error:", error);

        container.innerHTML =
            '<p class="empty-message">Unable to fetch recommendations. Please try again.</p>';

    }

}


// ==========================================
// 7. SUBMIT STUDENT REVIEWS
// ==========================================

async function submitReview(event) {

    // Prevent normal HTML form submission and page navigation
    event.preventDefault();
    event.stopPropagation();

    const itemId = document.getElementById("reviewItemId").value;

    const studentName =
        document.getElementById("studentName").value.trim();

    const rating =
        Number(document.getElementById("reviewRating").value);

    const comment =
        document.getElementById("reviewComment").value.trim();

    const message = document.getElementById("reviewMessage");

    const form = document.getElementById("reviewForm");

    const submitButton = form.querySelector('button[type="submit"]');

    // Basic validation
    if (!itemId || !studentName || !rating || !comment) {

        message.textContent = "Please fill in all review fields.";
        message.style.color = "red";

        message.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return;

    }

    const reviewData = {
        student_name: studentName,
        rating: rating,
        comment: comment
    };

    message.textContent = "Submitting your review...";
    message.style.color = "#81766e";

    // Prevent repeated clicks during submission
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {

        const response = await fetch(
            `${API_URL}/items/${itemId}/reviews`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(reviewData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || data.error || "Review submission failed"
            );
        }

        if (data.error) {
            throw new Error(data.error);
        }

        // Show success message
        message.textContent =
            "Your review was submitted successfully! Thank you.";

        message.style.color = "green";

        // Clear the form
        form.reset();

        // Bring the confirmation message into view
        message.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        // Refresh menu ratings
        await loadItems();

    } catch (error) {

        console.error("Review submission error:", error);

        message.textContent = error.message;

        message.style.color = "red";

        message.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } finally {

        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = "Submit Review";

    }

}


// ==========================================
// 8. HTML TEXT SAFETY
// ==========================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];

    });

}


// ==========================================
// 9. VIEW FOOD ITEM REVIEWS
// ==========================================

async function showReviews(itemId, itemName) {

    const modal = document.getElementById("reviewsModal");

    const reviewsList = document.getElementById("reviewsList");

    const modalFoodName = document.getElementById("modalFoodName");

    const modalRating = document.getElementById("modalRating");

    modal.style.display = "flex";

    modalFoodName.textContent = itemName;

    modalRating.textContent = "Loading ratings...";

    reviewsList.innerHTML = '<p>Loading reviews...</p>';

    try {

        const response = await fetch(
            `${API_URL}/items/${itemId}/reviews`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch reviews");
        }

        const data = await response.json();

        modalRating.textContent =
            `⭐ ${data.average_rating ?? "No ratings yet"} / 5 · ${data.total_reviews} reviews`;

        reviewsList.innerHTML = "";

        if (!data.reviews || data.reviews.length === 0) {

            reviewsList.innerHTML =
                '<p class="empty-message">No reviews yet. Be the first to review this dish!</p>';

            return;

        }

        data.reviews.forEach(review => {

            const reviewCard = document.createElement("div");

            reviewCard.className = "review-card";

            reviewCard.innerHTML = `
                <h4>${escapeHTML(review.student_name)}</h4>
                <p class="review-stars">${"⭐".repeat(review.rating)}</p>
                <p>${escapeHTML(review.comment || "No comment provided.")}</p>
            `;

            reviewsList.appendChild(reviewCard);

        });

    } catch (error) {

        console.error("Review loading error:", error);

        reviewsList.innerHTML =
            '<p class="empty-message">Unable to load reviews. Please try again.</p>';

        modalRating.textContent = "";

    }

}


// ==========================================
// 10. CLOSE REVIEWS MODAL
// ==========================================

function closeReviewsModal() {

    document.getElementById("reviewsModal").style.display = "none";

}


// ==========================================
// 11. EVENT LISTENERS AND STARTUP
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("CampusBites frontend started!");

    // Search button
    document.getElementById("searchButton")
        .addEventListener("click", searchItems);

    // Reset button
    document.getElementById("resetButton")
        .addEventListener("click", resetFilters);

    // Recommendation button
    document.getElementById("recommendButton")
        .addEventListener("click", getRecommendations);

    // Review form submission
    document.getElementById("reviewForm")
        .addEventListener("submit", submitReview);

    // Search when Enter is pressed
    document.getElementById("searchInput")
        .addEventListener("keydown", event => {

            if (event.key === "Enter") {
                searchItems();
            }

        });

    // Close review popup
    document.getElementById("closeReviews")
        .addEventListener("click", closeReviewsModal);

    // Close popup when clicking outside it
    document.getElementById("reviewsModal")
        .addEventListener("click", event => {

            if (event.target.id === "reviewsModal") {
                closeReviewsModal();
            }

        });

    // Load website data
    loadShops();

    loadItems();

});
