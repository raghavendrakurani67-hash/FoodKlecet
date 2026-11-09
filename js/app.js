

/* =========================================
   FOODKLECT - MAIN JAVASCRIPT
========================================= */


/* ---------- LOCAL STORAGE ---------- */

const CART_KEY = "foodklect_cart";
const FAVOURITES_KEY = "foodklect_favourites";

function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getFavourites() {
    return JSON.parse(localStorage.getItem(FAVOURITES_KEY)) || [];
}

function saveFavourites(favourites) {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favourites));
}


/* ---------- TOAST NOTIFICATIONS ---------- */

function showToast(message, type = "success") {

    let container = document.getElementById("toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";

        container.style.cssText = `
            position: fixed;
            top: 85px;
            right: 20px;
            z-index: 2000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;

        document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    const background = type === "error" ? "#dc3545" : "#222";

    toast.style.cssText = `
        background: ${background};
        color: white;
        padding: 14px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        font-size: 13px;
        font-weight: 600;
        animation: toastSlide 0.3s ease;
        max-width: 300px;
    `;

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(30px)";

        setTimeout(() => toast.remove(), 300);
    }, 2500);
}


/* ---------- ADD TO CART ---------- */

function addToCart(product) {

    const cart = getCart();

    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart(cart);

    updateCartCount();

    showToast(`${product.name} added to cart!`);
}


/* ---------- CART COUNT ---------- */

function updateCartCount() {

    const cart = getCart();

    const totalItems = cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);

    const cartCount = document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}


/* ---------- FAVOURITES ---------- */

function toggleFavourite(product) {

    let favourites = getFavourites();

    const existingIndex = favourites.findIndex(
        item => item.id === product.id
    );

    if (existingIndex !== -1) {

        favourites.splice(existingIndex, 1);

        showToast(`${product.name} removed from favourites`);

    } else {

        favourites.push(product);

        showToast(`${product.name} added to favourites!`);
    }

    saveFavourites(favourites);

    updateFavouriteButtons();
}


function updateFavouriteButtons() {

    const favourites = getFavourites();

    document.querySelectorAll(".food-card").forEach(card => {

        const name = card.querySelector(".food-card-body h5")?.textContent.trim();

        const button = card.querySelector(".favourite-btn");

        if (!name || !button) return;

        const isFavourite = favourites.some(item => item.name === name);

        button.innerHTML = isFavourite
            ? '<i class="bi bi-heart-fill"></i>'
            : '<i class="bi bi-heart"></i>';

        button.style.color = isFavourite ? "#ff6b35" : "";
    });
}


/* ---------- GET FOOD DETAILS ---------- */

function getProductDetails(card) {

    const name = card.querySelector(".food-card-body h5")?.textContent.trim();

    const priceText = card.querySelector(".food-price")?.textContent || "₹0";

    const price = Number(priceText.replace(/[^\d.]/g, ""));

    const image = card.querySelector(".food-image-wrapper img")?.src || "";

    const category = card.querySelector(".food-category")?.textContent.trim() || "";

    return {
        id: card.closest(".food-item")?.dataset.id || card.dataset.id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        name,
        price,
        image,
        category
    };
}


/* ---------- FOOD CARD EVENTS ---------- */

document.addEventListener("click", function (event) {

    const addButton = event.target.closest(".add-cart-btn");

    if (addButton) {
        const card = addButton.closest(".food-card");
        const product = getProductDetails(card);

        if (!product.name || !product.price) {
            showToast("Unable to add this item.", "error");
            return;
        }

        addToCart(product);
    }

    const favouriteButton = event.target.closest(".favourite-btn");

    if (favouriteButton) {
        const card = favouriteButton.closest(".food-card");
        const product = getProductDetails(card);

        toggleFavourite(product);
    }
});


/* ---------- INITIALIZE HOMEPAGE ---------- */

document.addEventListener("DOMContentLoaded", () => {

    updateCartCount();

    updateFavouriteButtons();

});


/* ---------- TOAST ANIMATION ---------- */

const toastStyle = document.createElement("style");

toastStyle.textContent = `
    @keyframes toastSlide {
        from {
            opacity: 0;
            transform: translateX(30px);
        }

        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;

document.head.appendChild(toastStyle);
// FOODKLECT DARK MODE
document.addEventListener("DOMContentLoaded", function () {

    const themeToggle = document.getElementById("themeToggle");

    if (!themeToggle) {
        console.log("Dark mode button not found!");
        return;
    }

    function updateTheme(isDark) {
        document.body.classList.toggle("dark-mode", isDark);

        themeToggle.innerHTML = isDark
            ? '<i class="bi bi-sun-fill"></i> <span>Light Mode</span>'
            : '<i class="bi bi-moon-stars-fill"></i> <span>Dark Mode</span>';

        localStorage.setItem("foodklect-theme", isDark ? "dark" : "light");
    }

    // Load saved theme
    updateTheme(localStorage.getItem("foodklect-theme") === "dark");

    // Toggle theme on click
    themeToggle.addEventListener("click", function () {
        const isDark = !document.body.classList.contains("dark-mode");
        updateTheme(isDark);
    });

});