// DOM Elements
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const chatContainer = document.getElementById('chat-container');
const authContainer = document.getElementById('auth-container');

// State management
let currentUser = null;
let socket = null;

// Authentication functions
async function register(username, password) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error('Registration failed');
        }
        
        const data = await response.json();
        localStorage.setItem('token', data.token);
        currentUser = { username: data.username, id: data.userId };
        initializeChat();
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}

async function login(username, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error('Login failed');
        }
        
        const data = await response.json();
        localStorage.setItem('token', data.token);
        currentUser = { username: data.username, id: data.userId };
        initializeChat();
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    showAuthForms();
}

// Chat initialization and Socket.IO setup
function initializeChat() {
    const token = localStorage.getItem('token');
    if (!token) {
        showAuthForms();
        return;
    }
    
    socket = io({
        auth: { token }
    });
    
    socket.on('connect', () => {
        console.log('Connected to chat server');
        loadPreviousMessages();
        showChatInterface();
    });
    
    socket.on('chat-message', handleIncomingMessage);
    socket.on('previous-messages', displayPreviousMessages);
    socket.on('error', (error) => {
        console.error('Socket error:', error);
        if (error.type === 'authentication_error') {
            logout();
        }
    });
}

// Message handling
function handleIncomingMessage(data) {
    appendMessage({
        content: data.content,
        username: data.username,
        timestamp: data.timestamp,
        isSent: data.userId === currentUser.id
    });
}

async function loadPreviousMessages() {
    try {
        const response = await fetch('/api/messages', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load messages');
        }
        
        const messages = await response.json();
        displayPreviousMessages(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function displayPreviousMessages(messages) {
    messageContainer.innerHTML = '';
    messages.forEach(message => {
        appendMessage({
            content: message.content,
            username: message.username,
            timestamp: message.timestamp,
            isSent: message.userId === currentUser.id
        });
    });
}

function appendMessage({ content, username, timestamp, isSent }) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isSent ? 'sent-message' : 'received-message');
    
    const header = document.createElement('div');
    header.classList.add('message-header');
    header.textContent = `${username} • ${new Date(timestamp).toLocaleTimeString()}`;
    
    const body = document.createElement('div');
    body.classList.add('message-body');
    body.textContent = content;
    
    messageElement.appendChild(header);
    messageElement.appendChild(body);
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// UI helpers
function showAuthForms() {
    authContainer.style.display = 'block';
    chatContainer.style.display = 'none';
}

function showChatInterface() {
    authContainer.style.display = 'none';
    chatContainer.style.display = 'block';
}

// Event listeners
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();
    if (!content || !socket) return;
    
    socket.emit('send-chat-message', {
        content,
        timestamp: new Date().toISOString()
    });
    
    messageInput.value = '';
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    login(username, password);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    register(username, password);
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) {
        initializeChat();
    } else {
        showAuthForms();
    }
});

