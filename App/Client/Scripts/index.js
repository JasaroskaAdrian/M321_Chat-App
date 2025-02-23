const token = localStorage.getItem('token');
console.log('Retrieved token for socket connection. Token exists:', !!token, 'Token starts with:', token?.substring(0, 10));

const socket = io('http://localhost:4200', {
    auth: { token }
});
console.log('Attempting socket connection with token...');
const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')

socket.on('chat-message', message => {
    appendMessage(message, 'received')
})

messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`You: ${message}`, 'sent')
    socket.emit('send-chat-message', message)
    messageInput.value = ''
})

function appendMessage(message, sender) {
    console.log("Appending Message: ", message)
    const messageElement = document.createElement('div')
    messageElement.innerText = message
    messageElement.classList.add(sender === 'sent' ? 'sent-message' : 'received-message')
    messageContainer.append(messageElement)
    console.log(messageContainer)
}
