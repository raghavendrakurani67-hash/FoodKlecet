document.addEventListener("DOMContentLoaded", function () {
    const storage = window.FoodklectStorage;
    const cardsContainer = document.getElementById("adminMenuCards");
    const form = document.getElementById("adminMenuForm");
    if (!storage || !cardsContainer || !form) return;

    const statusMessage = document.getElementById("adminStatusMessage");
    const itemIdInput = document.getElementById("menuItemId");
    const formTitle = document.getElementById("adminFormTitle");
    const saveButton = document.getElementById("adminSaveButton");

    function showMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
    }

    function resetForm() {
        form.reset();
        itemIdInput.value = "";
        document.getElementById("menuCategory").value = "snacks";
        document.getElementById("menuAvailability").value = "true";
        formTitle.textContent = "Add a food item";
        saveButton.textContent = "Add Item";
    }

    function renderMenu() {
        const items = storage.getMenu();
        cardsContainer.replaceChildren();

        if (!items.length) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "text-muted";
            emptyMessage.textContent = "No menu items yet. Add your first item using the form above.";
            cardsContainer.appendChild(emptyMessage);
            return;
        }

        items.forEach(item => {
            const card = document.createElement("article");
            card.className = "admin-item-card";

            const image = document.createElement("img");
            image.src = item.image;
            image.alt = item.name;

            const body = document.createElement("div");
            body.className = "admin-item-card-body";
            const name = document.createElement("h3");
            name.textContent = item.name;
            const category = document.createElement("div");
            category.className = "admin-item-category";
            category.textContent = item.category;
            const price = document.createElement("p");
            price.className = "admin-item-price";
            price.textContent = storage.formatPrice(item.price);
            const badge = document.createElement("span");
            badge.className = `admin-badge ${item.available === false ? "badge-unavailable" : "badge-available"}`;
            badge.textContent = item.available === false ? "Out of stock" : "Available";

            const actions = document.createElement("div");
            actions.className = "admin-actions";
            ["edit", "delete"].forEach(action => {
                const button = document.createElement("button");
                button.className = `admin-action ${action}`;
                button.type = "button";
                button.dataset.action = action;
                button.dataset.id = item.id;
                button.textContent = action === "edit" ? "Edit" : "Delete";
                actions.appendChild(button);
            });

            body.append(name, category, price, badge, actions);
            card.append(image, body);
            cardsContainer.appendChild(card);
        });
    }

    cardsContainer.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;
        const items = storage.getMenu();
        const item = items.find(entry => entry.id === button.dataset.id);
        if (!item) return;

        if (button.dataset.action === "delete") {
            if (!window.confirm(`Delete "${item.name}" from the menu?`)) return;
            if (!storage.saveMenu(items.filter(entry => entry.id !== item.id))) {
                showMessage("Could not delete the item. Check browser storage availability.", "error");
                return;
            }
            if (itemIdInput.value === item.id) resetForm();
            showMessage("Item deleted.", "success");
            renderMenu();
            return;
        }

        itemIdInput.value = item.id;
        document.getElementById("menuItemName").value = item.name;
        document.getElementById("menuCategory").value = item.category;
        document.getElementById("menuPrice").value = item.price;
        document.getElementById("menuDescription").value = item.description;
        document.getElementById("menuAvailability").value = String(item.available !== false);
        formTitle.textContent = "Edit menu item";
        saveButton.textContent = "Save Changes";
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const id = itemIdInput.value;
        const items = storage.getMenu();
        const existingItem = items.find(entry => entry.id === id);
        const category = document.getElementById("menuCategory").value;
        const item = {
            id: id || `food-${Date.now()}`,
            name: document.getElementById("menuItemName").value.trim(),
            category,
            price: Number(document.getElementById("menuPrice").value),
            image: existingItem ? existingItem.image : storage.getCategoryImage(category),
            description: document.getElementById("menuDescription").value.trim(),
            available: document.getElementById("menuAvailability").value === "true"
        };

        if (!item.name || !item.description || !item.image || !Number.isFinite(item.price) || item.price < 10) {
            showMessage("Enter a name, description and a price of at least ₹10.", "error");
            return;
        }

        const index = items.findIndex(entry => entry.id === id);
        if (index >= 0) items[index] = item;
        else items.push(item);

        if (!storage.saveMenu(items)) {
            showMessage("Could not save menu changes. Check browser storage availability.", "error");
            return;
        }

        renderMenu();
        resetForm();
        showMessage(id ? "Menu item updated." : "Menu item added.", "success");
    });

    document.getElementById("adminResetForm").addEventListener("click", resetForm);
    renderMenu();
});
