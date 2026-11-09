
document.addEventListener("DOMContentLoaded", function () {
    const storage = window.FoodklectStorage;
    if (!storage) return;

    function requireUser() {
        const user = storage.getCurrentUser();
        if (!user) {
            window.location.href = "login.html";
            return null;
        }
        return user;
    }

    const checkoutForm = document.getElementById("checkoutForm");
    const checkoutItems = document.getElementById("checkoutItems");
    const checkoutTotal = document.getElementById("checkoutTotal");
    const paymentQr = document.getElementById("paymentQr");

    if (checkoutItems) {
        const cart = storage.getCart();
        const subtotal = cart.reduce(
            (sum, item) => sum + Number(item.price) * Number(item.quantity),
            0
        );

        checkoutItems.textContent = cart.length
            ? cart.map(item =>
                `${item.name} × ${item.quantity} — ${storage.formatPrice(item.price * item.quantity)}`
            ).join("\n")
            : "Your cart is empty.";

        if (checkoutTotal) {
            checkoutTotal.textContent = storage.formatPrice(subtotal);
        }

        if (paymentQr) {
            paymentQr.hidden = cart.length === 0 || subtotal <= 0;
        }
    }

    // PLACE ORDER IN MYSQL
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const user = requireUser();
            if (!user) return;

            const cart = storage.getCart();

            if (!cart.length) {
                window.location.href = "cart.html";
                return;
            }

            const submitButton = checkoutForm.querySelector('[type="submit"]');
            const message = document.getElementById("checkoutMessage");

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Placing order...";
            }

            if (message) {
                message.style.display = "none";
            }

            try {
                const response = await fetch("api/place_order.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        items: cart
                    })
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Unable to place order.");
                }

                const order = {
                    id: `FK${result.orderId}`,
                    userId: user.id,
                    studentId: user.studentId,
                    customerName: user.name,
                    fulfillment: "Campus canteen pickup",
                    items: cart,
                    total: cart.reduce(
                        (sum, item) =>
                            sum + Number(item.price) * Number(item.quantity),
                        0
                    ),
                    status: "Confirmed",
                    createdAt: new Date().toISOString()
                };

                // Keep a local copy for existing order pages.
                const orders = storage.getOrders();
                orders.unshift(order);
                storage.saveOrders(orders);

                storage.saveCart([]);

                window.location.href =
                    `order-details.html?id=${encodeURIComponent(order.id)}`;

            } catch (error) {
                if (message) {
                    message.style.display = "block";
                    message.textContent = error.message;
                } else {
                    alert(error.message);
                }

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Place Order";
                }
            }
        });
    }

    // STUDENT ORDER HISTORY
    const ordersList = document.getElementById("ordersList");

    if (ordersList) {
        const user = requireUser();
        if (!user) return;

        const orders = storage.getCurrentUserOrders();

        if (!orders.length) {
            ordersList.innerHTML =
                '<div class="empty-state"><h2>No orders yet</h2><p>Your completed and current orders will appear here.</p><a class="btn btn-orange rounded-pill px-4" href="menu.html">Explore menu</a></div>';
            return;
        }

        orders.forEach(order => {
            const card = document.createElement("article");
            card.className = "order-card";

            const heading = document.createElement("h3");
            heading.textContent = `Order ${order.id}`;

            const summary = document.createElement("p");
            summary.textContent =
                `${order.items.length} item(s) · ${new Date(order.createdAt).toLocaleString()} · ${storage.formatPrice(order.total)}`;

            const status = document.createElement("span");
            status.className = "order-status";
            status.textContent = order.status;

            const link = document.createElement("a");
            link.className = "btn btn-sm btn-outline-dark";
            link.href =
                `order-details.html?id=${encodeURIComponent(order.id)}`;
            link.textContent = "View details";

            card.append(heading, summary, status, link);
            ordersList.appendChild(card);
        });
    }

    // ORDER DETAILS
    const orderDetails = document.getElementById("orderDetails");

    if (orderDetails) {
        const user = requireUser();
        if (!user) return;

        const orderId =
            new URLSearchParams(window.location.search).get("id");

        const order = storage.getCurrentUserOrders().find(
            entry => entry.id === orderId
        );

        if (!order) {
            orderDetails.innerHTML =
                '<div class="empty-state"><h2>Order not found</h2><p>This order may not belong to your account.</p><a href="orders.html" class="btn btn-orange rounded-pill px-4">Back to orders</a></div>';
            return;
        }

        const heading = document.createElement("h2");
        heading.textContent = `Order ${order.id}`;

        const status = document.createElement("p");
        status.className = "order-status";
        status.textContent = order.status;

        const pickup = document.createElement("p");
        pickup.textContent =
            `Pickup: ${order.fulfillment || "Campus canteen counter"}`;

        const date = document.createElement("p");
        date.textContent = new Date(order.createdAt).toLocaleString();

        const list = document.createElement("ul");

        order.items.forEach(item => {
            const line = document.createElement("li");
            line.textContent =
                `${item.name} × ${item.quantity} — ${storage.formatPrice(item.price * item.quantity)}`;
            list.appendChild(line);
        });

        const total = document.createElement("h3");
        total.textContent =
            `Total: ${storage.formatPrice(order.total)}`;

        orderDetails.append(heading, status, date, pickup, list, total);
    }
});
