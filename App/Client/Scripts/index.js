const socket = io('http://localhost:4300')

socket.on('chat-message', data => {
    console.log(data)
})