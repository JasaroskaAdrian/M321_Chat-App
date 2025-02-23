document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        console.log('Login response received:', { status: response.status, hasToken: !!data.token });

        if (response.ok && data.token) {
            console.log('Token received, storing... Token starts with:', data.token.substring(0, 10));
            localStorage.setItem('token', data.token);
            if (data.userId) localStorage.setItem('userId', data.userId);
            if (data.username) localStorage.setItem('username', data.username);
            console.log('Token and user data stored successfully');
            window.location.href = '/dashboard';
        } else {
            document.getElementById('login-error').textContent = data.message || 'Invalid username or password';
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('login-error').textContent = 'Login failed. Please try again.';
    }
});
