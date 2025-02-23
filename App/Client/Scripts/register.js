console.log('Register script loaded and initialized');
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#registerForm');
    
    if (!form) {
        console.error('Register form not found');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        const errorDisplay = document.querySelector('#register-error');
        console.log('Form submission triggered');
        e.preventDefault(); // Prevent form from submitting normally
        
        const usernameInput = document.querySelector('#username');
        const passwordInput = document.querySelector('#password');

        if (!usernameInput || !passwordInput) {
            console.error('Form inputs not found');
            return;
        }

        const username = usernameInput.value;
        const password = passwordInput.value;
        
        try {
            console.log('Attempting to send registration request');
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });
            
            const data = await response.json();
            console.log('Registration response received:', data);

            if (response.ok) {
                // Registration successful, redirect to login
                window.location.href = '/login';
            } else {
                // Show error message
                if (errorDisplay) {
                    errorDisplay.textContent = data.message || 'Registration failed. Please try again.';
                    errorDisplay.style.display = 'block';
                } else {
                    console.error('Error display element not found');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            // Handle network errors
            if (errorDisplay) {
                errorDisplay.textContent = 'Network error. Please try again later.';
                errorDisplay.style.display = 'block';
            } else {
                console.error('Error display element not found');
            }
        }
    });
});

