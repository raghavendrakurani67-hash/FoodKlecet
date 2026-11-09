
document.addEventListener("DOMContentLoaded", function () {
    const storage = window.FoodklectStorage;

    if (!storage) {
        console.error("FoodklectStorage is not available.");
        return;
    }

    let foodBarChart = null;
    let foodPieChart = null;

    const message = document.getElementById("analyticsMessage");
    const ranking = document.getElementById("foodRanking");

    function formatRupees(amount) {
        return "₹" + Number(amount || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
    }

    function loadAnalytics() {
        message.className = "alert alert-info";
        message.textContent = "Loading Foodklect sales data...";

        try {
            // Read the actual website menu and saved orders
            const menu = storage.getMenu();
            const orders = storage.getOrders();

            // Prepare every current menu item, including zero-sales items
            const analytics = new Map();

            menu.forEach(item => {
                const key = String(item.id || item.name);

                analytics.set(key, {
                    id: key,
                    name: item.name,
                    total_quantity: 0,
                    order_count: 0,
                    total_revenue: 0
                });
            });

            let totalOrders = 0;
            let totalUnits = 0;
            let totalRevenue = 0;

            orders.forEach(order => {
                // Exclude cancelled or rejected orders
                const status = String(order.status || "")
                    .trim()
                    .toLowerCase();

                if (["cancelled", "canceled", "rejected"].includes(status)) {
                    return;
                }

                totalOrders++;

                const countedItems = new Set();

                (Array.isArray(order.items) ? order.items : [])
                    .forEach(item => {
                        const quantity = Number(item.quantity) || 0;
                        const price = Number(item.price) || 0;

                        if (quantity <= 0) return;

                        const key = String(item.id || item.name);

                        // Include previously ordered items even if
                        // they have since been removed from the menu
                        if (!analytics.has(key)) {
                            analytics.set(key, {
                                id: key,
                                name: item.name || "Unknown item",
                                total_quantity: 0,
                                order_count: 0,
                                total_revenue: 0
                            });
                        }

                        const record = analytics.get(key);
                        const itemRevenue = price * quantity;

                        record.total_quantity += quantity;
                        record.total_revenue += itemRevenue;

                        totalUnits += quantity;
                        totalRevenue += itemRevenue;

                        // Count an item only once per order
                        if (!countedItems.has(key)) {
                            record.order_count++;
                            countedItems.add(key);
                        }
                    });
            });

            // Sort highest-selling items first
            const items = Array.from(analytics.values())
                .sort((a, b) =>
                    b.total_quantity - a.total_quantity ||
                    a.name.localeCompare(b.name)
                );

            const topItem = items.find(item => item.total_quantity > 0);

            // Update summary cards
            document.getElementById("totalUnits").textContent = totalUnits;
            document.getElementById("totalOrders").textContent = totalOrders;
            document.getElementById("totalRevenue").textContent =
                formatRupees(totalRevenue);

            document.getElementById("topItem").textContent =
                topItem ? topItem.name : "No sales yet";

            // Update ranking table
            ranking.replaceChildren();

            items.forEach((item, index) => {
                const row = document.createElement("tr");

                [
                    index + 1,
                    item.name,
                    item.total_quantity,
                    item.order_count,
                    formatRupees(item.total_revenue)
                ].forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                });

                ranking.appendChild(row);
            });

            // Chart labels and values use the same actual menu data
            const labels = items.map(item => item.name);
            const quantities = items.map(item => item.total_quantity);

            if (foodBarChart) foodBarChart.destroy();
            if (foodPieChart) foodPieChart.destroy();

            foodBarChart = new Chart(
                document.getElementById("foodBarChart"),
                {
                    type: "bar",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Units Sold",
                            data: quantities,
                            backgroundColor: "#ff8a50",
                            borderRadius: 7
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { precision: 0 }
                            }
                        }
                    }
                }
            );

            foodPieChart = new Chart(
                document.getElementById("foodPieChart"),
                {
                    type: "doughnut",
                    data: {
                        labels: labels,
                        datasets: [{
                            data: quantities,
                            backgroundColor: [
                                "#ff6b35",
                                "#ffb347",
                                "#5c9ead",
                                "#8c6bb1",
                                "#72a276",
                                "#e58baf",
                                "#d4a72c",
                                "#777777",
                                "#e76f51",
                                "#457b9d",
                                "#a8dadc",
                                "#6d597a"
                            ],
                            borderWidth: 2,
                            borderColor: "#ffffff"
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: "bottom"
                            }
                        }
                    }
                }
            );

            message.className = "alert alert-success";
            message.textContent =
                `Analytics updated successfully. ${items.length} food items found.`;

        } catch (error) {
            console.error("Foodklect analytics error:", error);

            message.className = "alert alert-danger";
            message.textContent =
                "Could not load analytics. Check the browser console.";
        }
    }

    document.getElementById("refreshAnalytics")
        .addEventListener("click", loadAnalytics);

    loadAnalytics();
});
