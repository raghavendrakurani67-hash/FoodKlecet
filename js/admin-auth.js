(function () {
    const ADMIN_EMAIL = "admin@foodklect.com";
    const ADMIN_PASSWORD = "admin123";
    const SESSION_KEY = "foodklect_admin_session";

    function getSession() {
        try {
            return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
        } catch (error) {
            console.error("Could not read admin session:", error);
            return null;
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        const loginForm = document.getElementById("adminLoginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const email = document.getElementById("adminEmail").value.trim().toLowerCase();
                const password = document.getElementById("adminPassword").value;
                const message = document.getElementById("adminLoginMessage");
                if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
                    message.className = "auth-message error";
                    message.textContent = "Invalid admin email or password.";
                    return;
                }

                localStorage.setItem(SESSION_KEY, JSON.stringify({
                    email,
                    loggedInAt: new Date().toISOString()
                }));
                message.className = "auth-message success";
                message.textContent = "Login successful. Redirecting...";
                setTimeout(function () {
                    window.location.href = "admin.html";
                }, 500);
            });
        }

        const logoutButton = document.getElementById("adminLogoutBtn");
        if (logoutButton) {
            logoutButton.addEventListener("click", function () {
                localStorage.removeItem(SESSION_KEY);
                window.location.href = "admin-login.html";
            });
        }

        if (document.body.dataset.adminPage === "true" && !getSession()) {
            window.location.replace("admin-login.html");
        }

        const session = getSession();
        const adminEmail = document.getElementById("adminUserEmail");
        if (adminEmail && session) {
            adminEmail.textContent = session.email;
        }
    });

    window.FoodklectAdminAuth = {
        isAuthenticated: function () {
            const session = getSession();
            return Boolean(session && session.email === ADMIN_EMAIL);
        }
    };
})();
