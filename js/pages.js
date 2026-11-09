document.addEventListener("DOMContentLoaded", function () {
    const storage = window.FoodklectStorage;
    if (!storage) return;

    function currentUserOrRedirect() {
        const user = storage.getCurrentUser();
        if (!user) {
            window.location.href = "login.html";
            return null;
        }
        return user;
    }

    const detailRoot = document.getElementById("foodDetails");
    if (detailRoot) {
        const id = new URLSearchParams(window.location.search).get("id");
        const item = storage.getMenu().find(entry => entry.id === id);
        if (!item) {
            detailRoot.textContent = "We couldn't find that menu item.";
        } else {
            const image = document.createElement("img");
            image.className = "food-detail-image";
            image.src = item.image;
            image.alt = item.name;
            const content = document.createElement("div");
            content.className = "content-card";
            const category = document.createElement("span");
            category.className = "section-label";
            category.textContent = item.category;
            const title = document.createElement("h1");
            title.textContent = item.name;
            const description = document.createElement("p");
            description.textContent = item.description;
            const price = document.createElement("h3");
            price.textContent = storage.formatPrice(item.price);
            const button = document.createElement("button");
            button.className = "btn btn-orange rounded-pill px-4";
            button.type = "button";
            button.textContent = item.available === false ? "Out of stock" : "Add to cart";
            button.disabled = item.available === false;
            button.addEventListener("click", function () {
                const cart = storage.getCart();
                const existing = cart.find(entry => entry.id === item.id);
                if (existing) existing.quantity = Number(existing.quantity || 0) + 1;
                else cart.push({ ...item, quantity: 1 });
                storage.saveCart(cart);
                window.location.href = "cart.html";
            });
            content.append(category, title, description, price, button);
            detailRoot.append(image, content);
        }
    }

    const favoritesRoot = document.getElementById("favoritesList");
    if (favoritesRoot) {
        const favorites = storage.getFavourites();
        if (!favorites.length) {
            favoritesRoot.innerHTML = '<div class="empty-state"><h2>No favourites saved</h2><p>Save a dish from the menu and it will appear here.</p><a href="menu.html" class="btn btn-orange rounded-pill px-4">Explore menu</a></div>';
        } else {
            favorites.forEach(item => {
                const card = document.createElement("article");
                card.className = "favorite-card";
                const image = document.createElement("img");
                image.src = item.image || "";
                image.alt = item.name;
                const details = document.createElement("div");
                const title = document.createElement("h3");
                title.textContent = item.name;
                const price = document.createElement("p");
                price.textContent = storage.formatPrice(item.price);
                details.append(title, price);
                const actions = document.createElement("div");
                actions.className = "favorite-actions";
                const view = document.createElement("a");
                view.className = "btn btn-sm btn-outline-dark";
                view.href = `food-details.html?id=${encodeURIComponent(item.id)}`;
                view.textContent = "View";
                const remove = document.createElement("button");
                remove.className = "btn btn-sm btn-outline-danger";
                remove.type = "button";
                remove.textContent = "Remove";
                remove.addEventListener("click", function () {
                    storage.saveFavourites(storage.getFavourites().filter(entry => entry.id !== item.id));
                    window.location.reload();
                });
                actions.append(view, remove);
                card.append(image, details, actions);
                favoritesRoot.appendChild(card);
            });
        }
    }

    const profileForm = document.getElementById("profileForm");
    if (profileForm) {
        const user = currentUserOrRedirect();
        if (!user) return;
        document.getElementById("profileName").value = user.name || "";
        document.getElementById("profileStudentId").value = user.studentId || "";
        document.getElementById("profilePhone").value = user.phone || "";
        profileForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const updatedUser = {
                ...user,
                name: document.getElementById("profileName").value.trim(),
                phone: document.getElementById("profilePhone").value.trim()
            };
            const users = storage.getUsers();
            const index = users.findIndex(entry => String(entry.id) === String(user.id));
            let saved = true;
            if (index >= 0) {
                users[index] = { ...users[index], name: updatedUser.name, phone: updatedUser.phone };
                saved = storage.saveUsers(users);
            }
            const message = document.getElementById("profileMessage");
            message.style.display = "block";
            if (saved && storage.saveCurrentUser(updatedUser)) {
                message.textContent = "Profile updated.";
            } else {
                message.textContent = "Could not save your profile. Please try again.";
            }
        });
    }

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            storage.clearCurrentUser();
            window.location.href = "login.html";
        });
    }

    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const message = document.getElementById("contactMessage");
            message.style.display = "block";
            message.textContent = "Thanks for your message. This demo form is not connected to a mail service yet.";
            contactForm.reset();
        });
    }
});
