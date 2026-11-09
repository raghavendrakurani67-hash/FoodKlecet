document.addEventListener("DOMContentLoaded", function () {
    const storage = window.FoodklectStorage;
    const popularGrid = document.getElementById("popularFoodGrid");
    if (!storage || !popularGrid) return;

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        })[character]);
    }

    const items = storage.getMenu().slice(0, 4);
    popularGrid.replaceChildren();

    items.forEach(item => {
        const available = item.available !== false;
        const column = document.createElement("div");
        column.className = "col-md-6 col-lg-3";
        const card = document.createElement("div");
        card.className = "food-card";
        card.dataset.id = item.id;
        card.innerHTML = `
            <div class="food-image-wrapper">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
                <span class="food-tag">${available ? "Popular" : "Out of Stock"}</span>
                <button class="favourite-btn" aria-label="Add ${escapeHtml(item.name)} to favourites">
                    <i class="bi bi-heart"></i>
                </button>
            </div>
            <div class="food-card-body">
                <div class="food-category">${escapeHtml(item.category).toUpperCase()}</div>
                <h5 class="food-name"><a href="food-details.html?id=${encodeURIComponent(item.id)}">${escapeHtml(item.name)}</a></h5>
                <p class="food-description">${escapeHtml(item.description)}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="food-price">₹${Number(item.price)}</h5>
                    <button class="add-cart-btn" aria-label="Add ${escapeHtml(item.name)} to cart" ${available ? "" : "disabled"}>
                        <i class="bi ${available ? "bi-plus-lg" : "bi-x-lg"}"></i>
                    </button>
                </div>
            </div>
        `;
        column.appendChild(card);
        popularGrid.appendChild(column);
    });

    if (typeof window.updateFavouriteButtons === "function") {
        window.updateFavouriteButtons();
    }
});
