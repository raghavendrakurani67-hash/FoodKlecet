
document.addEventListener("DOMContentLoaded", function () {

    const CURRENT_USER_KEY = "foodklect_current_user";

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    function showMessage(element, message, type) {
        if (!element) return;

        element.textContent = message;
        element.className = "auth-message " + type;
    }

    // PASSWORD VISIBILITY TOGGLE
    const togglePassword = document.getElementById("togglePassword");

    if (togglePassword) {
        togglePassword.addEventListener("click", function () {
            const passwordInput = document.getElementById("password");
            const icon = this.querySelector("i");

            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                icon.classList.replace("bi-eye", "bi-eye-slash");
            } else {
                passwordInput.type = "password";
                icon.classList.replace("bi-eye-slash", "bi-eye");
            }
        });
    }

    // REGISTRATION - MYSQL
    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const name = document.getElementById("fullName").value.trim();
            const studentId = document.getElementById("studentId").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const address = document.getElementById("address").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            const messageBox = document.getElementById("registerMessage");
            const submitButton = registerForm.querySelector('button[type="submit"]');

            if (name.length < 2) {
                showMessage(messageBox, "Please enter a valid name.", "error");
                return;
            }

            if (!/^[A-Za-z0-9-]{6,15}$/.test(studentId)) {
                showMessage(messageBox, "Student ID must be 6 to 15 characters long.", "error");
                return;
            }

            if (!/^[0-9]{10}$/.test(phone)) {
                showMessage(messageBox, "Please enter a valid 10-digit phone number.", "error");
                return;
            }

            if (!address) {
                showMessage(messageBox, "Please enter your address.", "error");
                return;
            }

            if (password.length < 6) {
                showMessage(messageBox, "Password must contain at least 6 characters.", "error");
                return;
            }

            if (password !== confirmPassword) {
                showMessage(messageBox, "Passwords do not match.", "error");
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = "Creating Account...";

            try {
                const response = await fetch("api/register.php", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fullName: name,
                        studentId: studentId,
                        phone: phone,
                        address: address,
                        password: password
                    })
                });

                const rawResponse = await response.text();
                console.log("Registration HTTP status:", response.status);
                console.log("Registration server response:", rawResponse);

                let result;

                try {
                    result = JSON.parse(rawResponse);
                } catch (error) {
                    throw new Error("Invalid server response. Check Console.");
                }

                if (!response.ok || !result.success) {
                    showMessage(messageBox, result.message || "Registration failed.", "error");
                    return;
                }

                showMessage(
                    messageBox,
                    "Account created successfully! Redirecting to login...",
                    "success"
                );

                registerForm.reset();

                setTimeout(function () {
                    window.location.href = "login.html";
                }, 1500);

            } catch (error) {
                console.error("Registration error:", error);
                showMessage(messageBox, error.message, "error");

            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Create Account <i class="bi bi-arrow-right"></i>';
            }
        });
    }

    // LOGIN - MYSQL
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const studentId = document.getElementById("studentId").value.trim();
            const password = document.getElementById("password").value;

            const messageBox = document.getElementById("loginMessage");
            const submitButton = loginForm.querySelector('button[type="submit"]');

            if (!studentId || !password) {
                showMessage(messageBox, "Please enter Student ID and password.", "error");
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = "Logging in...";

            try {
                const response = await fetch("api/login.php", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        studentId: studentId,
                        password: password
                    })
                });

                const rawResponse = await response.text();

                console.log("Login HTTP status:", response.status);
                console.log("Login server response:", rawResponse);

                let result;

                try {
                    result = JSON.parse(rawResponse);
                } catch (error) {
                    throw new Error("Invalid server response. Check Console.");
                }

                if (!response.ok || !result.success) {
                    showMessage(
                        messageBox,
                        result.message || "Login failed.",
                        "error"
                    );
                    return;
                }

                localStorage.setItem(
                    CURRENT_USER_KEY,
                    JSON.stringify(result.user)
                );

                showMessage(
                    messageBox,
                    "Login successful! Redirecting...",
                    "success"
                );

                setTimeout(function () {
                    window.location.href = "index.html";
                }, 1000);

            } catch (error) {
                console.error("Login error:", error);
                showMessage(messageBox, error.message, "error");

            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Login";
            }
        });
    }

});
