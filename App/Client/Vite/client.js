// Live Reload Configuration
if (location.host.includes('localhost')) {
    document.write(
        `<script src="http://${(location.host || 'localhost').split(':')[0]}:35729/livereload.js?snipver=1"></script>`
    )
}

// Socket.IO and Authentication Setup
const socket = io({
    auth: (cb) => {
        cb({ token: localStorage.getItem('token') });
    }
});

// DOM Elements
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const typingIndicator = document.getElementById('typing-indicator');

// User Authentication Functions
async function login(username, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) throw new Error('Login failed');
        
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        socket.connect();
        window.location.href = '/chat.html';
    } catch (error) {
        showNotification('Login failed: ' + error.message, 'error');
    }
}

async function register(username, password) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) throw new Error('Registration failed');
        
        showNotification('Registration successful! Please login.', 'success');
        window.location.href = '/login';
    } catch (error) {
        showNotification('Registration failed: ' + error.message, 'error');
    }
}

// Message Functions
function appendMessage(message, isCurrentUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isCurrentUser ? 'sent-message' : 'received-message');
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = message.content;
    
    const messageInfo = document.createElement('div');
    messageInfo.classList.add('message-info');
    messageInfo.textContent = `${message.username} - ${new Date(message.timestamp).toLocaleTimeString()}`;
    
    messageElement.appendChild(messageContent);
    messageElement.appendChild(messageInfo);
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Socket Event Handlers
socket.on('connect', () => {
    console.log('Connected to server');
    loadMessageHistory();
});

socket.on('chat-message', (data) => {
    appendMessage(data, false);
});

socket.on('user-typing', (username) => {
    typingIndicator.textContent = `${username} is typing...`;
    setTimeout(() => {
        typingIndicator.textContent = '';
    }, 3000);
});

socket.on('error', (error) => {
    showNotification(error.message, 'error');
});

// Message History
async function loadMessageHistory() {
    try {
        const response = await fetch('/api/messages', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load messages');
        
        const messages = await response.json();
        messages.forEach(message => {
            appendMessage(message, message.username === localStorage.getItem('username'));
        });
    } catch (error) {
        showNotification('Failed to load message history: ' + error.message, 'error');
    }
}

// Event Listeners
if (messageForm) {
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('send-message', {
                content: message,
                username: localStorage.getItem('username'),
                timestamp: new Date()
            });
            appendMessage({
                content: message,
                username: localStorage.getItem('username'),
                timestamp: new Date()
            }, true);
            messageInput.value = '';
        }
    });

    messageInput.addEventListener('input', () => {
        socket.emit('typing', localStorage.getItem('username'));
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        login(username, password);
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        register(username, password);
    });
}

// Utility Functions
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Token Management
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
    }
}

// Initialize
checkAuth();
console.log("Chat application initialized");
