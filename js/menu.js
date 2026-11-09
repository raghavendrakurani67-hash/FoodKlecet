document.addEventListener("DOMContentLoaded", function () {
    const MENU_STORAGE_KEY = "foodklect_menu";
    const DEFAULT_MENU = [
        { id: "classic-cheese-burger", name: "Classic Cheese Burger", category: "snacks", price: 99, description: "Juicy burger with cheese and fresh vegetables.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "cheese-pizza", name: "Cheese Pizza", category: "snacks", price: 149, description: "Freshly baked pizza loaded with melted cheese.", image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "crispy-french-fries", name: "Crispy French Fries", category: "snacks", price: 79, description: "Golden crispy fries served with tasty dip.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "veg-momos", name: "Veg Momos", category: "snacks", price: 89, description: "Soft steamed momos served with spicy chutney.", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "veg-fried-rice", name: "Veg Fried Rice", category: "meals", price: 129, description: "Delicious rice tossed with fresh vegetables.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "veg-noodles", name: "Veg Noodles", category: "meals", price: 89, description: "Hot and tasty noodles with fresh vegetables.", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "special-veg-thali", name: "Special Veg Thali", category: "meals", price: 159, description: "Complete Indian meal with rice, roti and curry.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "paneer-masala", name: "Paneer Masala", category: "meals", price: 139, description: "Rich and creamy paneer curry with Indian spices.", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80", available: false },
        { id: "chocolate-shake", name: "Chocolate Shake", category: "beverages", price: 79, description: "Rich and creamy chocolate milkshake.", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "cold-coffee", name: "Cold Coffee", category: "beverages", price: 89, description: "Chilled coffee with a smooth creamy taste.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "chocolate-brownie", name: "Chocolate Brownie", category: "desserts", price: 99, description: "Soft chocolate brownie with a rich flavour.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "vanilla-ice-cream", name: "Vanilla Ice Cream", category: "desserts", price: 69, description: "Classic creamy vanilla ice cream.", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80", available: true }
    ];

    const foodGrid = document.getElementById("foodGrid");
    const searchInput = document.getElementById("foodSearch");
    const clearSearch = document.getElementById("clearSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const priceFilter = document.getElementById("priceFilter");
    const priceValue = document.getElementById("priceValue");
    const availabilityFilter = document.getElementById("availabilityFilter");
    const sortFilter = document.getElementById("sortFilter");
    const resetFilters = document.getElementById("resetFilters");
    const emptyReset = document.getElementById("emptyReset");
    const foodCount = document.getElementById("foodCount");
    const emptyMenu = document.getElementById("emptyMenu");
    const categoryButtons = document.querySelectorAll(".category-filter");

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function getMenuItems() {
        if (window.FoodklectStorage) {
            return window.FoodklectStorage.getMenu();
        }

        const savedItems = JSON.parse(localStorage.getItem(MENU_STORAGE_KEY));
        if (Array.isArray(savedItems)) return savedItems;
        localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(DEFAULT_MENU));
        return DEFAULT_MENU;
    }

    function createFoodCard(item) {
        const safeId = escapeHtml(item.id);
        const safeName = escapeHtml(item.name);
        const safeCategory = escapeHtml(item.category);
        const safeDescription = escapeHtml(item.description);
        const safeImage = escapeHtml(item.image);
        const isAvailable = item.available !== false;
        const buttonLabel = isAvailable ? '<i class="bi bi-plus-lg"></i>' : '<i class="bi bi-x-lg"></i>';
        const badge = !isAvailable ? '<span class="food-tag">Out of Stock</span>' : '<span class="food-tag">Popular</span>';

        return `
            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 food-item"
                data-id="${safeId}"
                data-category="${safeCategory.toLowerCase()}"
                data-price="${item.price}"
                data-available="${isAvailable}">

                <div class="food-card">
                    <div class="food-image-wrapper">
                        <img src="${safeImage}" alt="${safeName}">
                        ${badge}
                        <button class="favourite-btn" aria-label="Add ${safeName} to favourites">
                            <i class="bi bi-heart"></i>
                        </button>
                    </div>

                    <div class="food-card-body">
                        <div class="food-category">${safeCategory.toUpperCase()}</div>
                        <h5 class="food-name"><a href="food-details.html?id=${encodeURIComponent(item.id)}">${safeName}</a></h5>
                        <p class="food-description">${safeDescription}</p>

                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="food-price">₹${item.price}</h5>
                            <button class="add-cart-btn" aria-label="Add ${safeName} to cart" ${isAvailable ? "" : "disabled"}>
                                ${buttonLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderMenu() {
        if (!foodGrid) return;

        const menuItems = getMenuItems();
        foodGrid.innerHTML = menuItems.map(createFoodCard).join("");
        const highestPrice = menuItems.reduce((highest, item) => Math.max(highest, Number(item.price) || 0), 0);
        priceFilter.max = String(Math.max(300, highestPrice));
        priceFilter.value = priceFilter.max;
        priceValue.textContent = `₹${priceFilter.value}`;

        const urlParams = new URLSearchParams(window.location.search);
        const selectedCategory = urlParams.get("category");
        if (selectedCategory) {
            categoryFilter.value = selectedCategory;
        }

        filterFood();
    }

    function updateCategoryButtons() {
        categoryButtons.forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.category === categoryFilter.value
            );
        });
    }

    function filterFood() {
        if (!foodGrid || !searchInput || !categoryFilter || !priceFilter || !availabilityFilter || !sortFilter || !foodCount || !emptyMenu) {
            return;
        }

        const searchText = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;
        const maxPrice = Number(priceFilter.value);
        const availability = availabilityFilter.value;
        const foodItems = Array.from(document.querySelectorAll(".food-item"));
        let visibleItems = [];

        foodItems.forEach(item => {
            const name = item.querySelector(".food-name")?.textContent.toLowerCase() || "";
            const description = item.querySelector(".food-description")?.textContent.toLowerCase() || "";
            const category = item.dataset.category;
            const price = Number(item.dataset.price);
            const available = item.dataset.available;

            const matchesSearch =
                name.includes(searchText) ||
                description.includes(searchText) ||
                category.includes(searchText);

            const matchesCategory =
                selectedCategory === "all" ||
                category === selectedCategory;

            const matchesPrice = price <= maxPrice;

            const matchesAvailability =
                availability === "all" ||
                available === availability;

            const shouldShow = matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
            item.style.display = shouldShow ? "" : "none";

            if (shouldShow) {
                visibleItems.push(item);
            }
        });

        sortFood(visibleItems);
        foodCount.textContent = `Showing ${visibleItems.length} of ${foodItems.length} food items`;
        emptyMenu.style.display = visibleItems.length === 0 ? "block" : "none";
        clearSearch.style.display = searchText.length > 0 ? "block" : "none";
        updateCategoryButtons();
    }

    function sortFood(items) {
        if (!foodGrid) return;

        const sortValue = sortFilter.value;
        items.sort((a, b) => {
            const priceA = Number(a.dataset.price);
            const priceB = Number(b.dataset.price);
            const nameA = a.querySelector(".food-name")?.textContent.trim() || "";
            const nameB = b.querySelector(".food-name")?.textContent.trim() || "";

            if (sortValue === "low-high") return priceA - priceB;
            if (sortValue === "high-low") return priceB - priceA;
            if (sortValue === "name") return nameA.localeCompare(nameB);
            return 0;
        });

        items.forEach(item => foodGrid.appendChild(item));
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterFood);
    }

    if (clearSearch) {
        clearSearch.addEventListener("click", function () {
            searchInput.value = "";
            filterFood();
            searchInput.focus();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterFood);
    }

    categoryButtons.forEach(button => {
        button.addEventListener("click", function () {
            if (categoryFilter) {
                categoryFilter.value = this.dataset.category;
                filterFood();
            }
        });
    });

    if (priceFilter) {
        priceFilter.addEventListener("input", function () {
            priceValue.textContent = `₹${this.value}`;
            filterFood();
        });
    }

    if (availabilityFilter) {
        availabilityFilter.addEventListener("change", filterFood);
    }

    if (sortFilter) {
        sortFilter.addEventListener("change", filterFood);
    }

    function resetAllFilters() {
        if (searchInput) searchInput.value = "";
        if (categoryFilter) categoryFilter.value = "all";
        if (priceFilter) priceFilter.value = priceFilter.max;
        if (priceValue) priceValue.textContent = `₹${priceFilter.value}`;
        if (availabilityFilter) availabilityFilter.value = "all";
        if (sortFilter) sortFilter.value = "default";
        filterFood();
    }

    if (resetFilters) resetFilters.addEventListener("click", resetAllFilters);
    if (emptyReset) emptyReset.addEventListener("click", resetAllFilters);

    if (priceValue) priceValue.textContent = `₹${priceFilter.value}`;
    renderMenu();
});
