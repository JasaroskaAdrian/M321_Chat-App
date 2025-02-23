const socket = io('http://localhost:4200')
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
