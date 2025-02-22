document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email"); 
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("loginForm"); 
    let errorText = document.getElementById("error");

    // Creates error message element if not found
    if (!errorText) {
        errorText = document.createElement("div");
        errorText.id = "error";
        errorText.className = "text-red-500 text-sm mt-2";
        loginButton.appendChild(errorText);
    }

    loginButton.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent form from reloading page

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();

                if (data?.token) {
                    localStorage.setItem("token", data.token);
                    if (data?.user) {
                        localStorage.setItem("user", JSON.stringify(data.user));
                    }
                    window.location.href = "/dashboard";
                } else {
                    errorText.innerText = "Login failed: No token received.";
                }
            } else if (response.status === 401) {
                errorText.innerText = "Invalid email or password.";
            } else {
                errorText.innerText = "An unexpected error occurred. Please try again.";
            }
        } catch (error) {
            console.error("Login error:", error);
            errorText.innerText = "An error occurred. Please try again.";
        }
    });
});
