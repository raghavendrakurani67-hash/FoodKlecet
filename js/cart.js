document.addEventListener("DOMContentLoaded", function () {
    const storage = window.FoodklectStorage;
    if (!storage) return;

    const cartList = document.getElementById("cartItems");
    const cartSummary = document.getElementById("cartSummary");
    const emptyCart = document.getElementById("emptyCart");
    const cartCount = document.getElementById("cartCount");

    function renderCart() {
        const cart = storage.getCart();
        const count = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
        const subtotal = cart.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
        if (cartCount) cartCount.textContent = count;
        if (!cartList) return;

        cartList.replaceChildren();
        if (!cart.length) {
            if (emptyCart) emptyCart.hidden = false;
            if (cartSummary) cartSummary.hidden = true;
            return;
        }

        if (emptyCart) emptyCart.hidden = true;
        if (cartSummary) {
            cartSummary.hidden = false;
            document.getElementById("cartSubtotal").textContent = storage.formatPrice(subtotal);
            document.getElementById("cartTotal").textContent = storage.formatPrice(subtotal);
        }

        cart.forEach(item => {
            const row = document.createElement("article");
            row.className = "cart-row";

            const image = document.createElement("img");
            image.src = item.image || "";
            image.alt = item.name;

            const details = document.createElement("div");
            const title = document.createElement("h3");
            title.textContent = item.name;
            const price = document.createElement("p");
            price.textContent = `${storage.formatPrice(item.price)} each`;
            details.append(title, price);

            const quantity = document.createElement("input");
            quantity.type = "number";
            quantity.min = "1";
            quantity.max = "99";
            quantity.value = String(item.quantity || 1);
            quantity.setAttribute("aria-label", `Quantity for ${item.name}`);
            quantity.addEventListener("change", function () {
                const next = storage.getCart();
                const found = next.find(entry => entry.id === item.id);
                if (!found) return;
                found.quantity = Math.max(1, Math.min(99, Number(quantity.value) || 1));
                storage.saveCart(next);
                renderCart();
            });

            const lineTotal = document.createElement("strong");
            lineTotal.textContent = storage.formatPrice(Number(item.price) * Number(item.quantity || 1));
            const remove = document.createElement("button");
            remove.className = "btn btn-sm btn-outline-danger";
            remove.type = "button";
            remove.textContent = "Remove";
            remove.addEventListener("click", function () {
                storage.saveCart(storage.getCart().filter(entry => entry.id !== item.id));
                renderCart();
            });

            row.append(image, details, quantity, lineTotal, remove);
            cartList.appendChild(row);
        });
    }

    document.addEventListener("click", function (event) {
        const addButton = event.target.closest(".add-cart-btn");
        if (addButton) {
            const card = addButton.closest(".food-card");
            if (!card || addButton.disabled) return;
            const item = {
                id: card.closest(".food-item")?.dataset.id || card.dataset.id || card.querySelector("h5")?.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                name: card.querySelector(".food-name, .food-card-body h5")?.textContent.trim(),
                price: Number((card.querySelector(".food-price")?.textContent || "").replace(/[^\d.]/g, "")),
                image: card.querySelector("img")?.src || "",
                category: card.querySelector(".food-category")?.textContent.trim() || ""
            };
            const cart = storage.getCart();
            const existing = cart.find(entry => entry.id === item.id);
            if (existing) existing.quantity = Number(existing.quantity || 0) + 1;
            else cart.push({ ...item, quantity: 1 });
            storage.saveCart(cart);
            renderCart();
            if (typeof window.showToast === "function") window.showToast(`${item.name} added to cart!`);
        }
    });

    renderCart();
    window.addEventListener("storage", renderCart);
});
