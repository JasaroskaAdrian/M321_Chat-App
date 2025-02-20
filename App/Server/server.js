import express from "express";
import http from 'http'
import winston from 'winston'
import { Server } from 'socket.io'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:4200', 'http://localhost:4300'],  // Allow both frontend ports
        methods: ['GET', 'POST'],  // Specify the methods you need
        allowedHeaders: ['Authorization', 'Content-Type'],
    }
})
const PORT = process.env.PORT

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { printf, combine, timestamp, colorize } = winston.format
const serverLogger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A'}),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.File({ 
            filename: path.join(__dirname, 'Logs', 'server-logs.log')
        }),
        new winston.transports.Console()
    ]
});

app.use(express.json())


app.use(
    cors({
        origin: ['http://localhost:4200', 'https://localhost:4300'], //Production Port and Developement Port
        methods: ['POST', 'GET', 'DELETE', 'PUT', 'PATCH'],
        allowedHeaders: ['Authorization', 'Content-Type']
    })
)

// Global middleware to remove X-Powered-By header
app.use((req, res, next) => {
    res.removeHeader("X-Powered-By");
    next();
  });

//Error Message to the Client
app.use((err, req, res, next) => {
    serverLogger.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use(express.static(path.join(__dirname, '../Client')))

/* TODO
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1]; // Get token from "Bearer <token>"
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
*/

app.get('/dashboard', /*authenticateUser,*/ (req, res) => {
    res.sendFile(path.join(__dirname, "..", "Client", "Views", "index.html"));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "Client", "Views", "login.html"))
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "Client", "Views", "register.html"))
})

//Socket IO

io.on('connection', (socket) => {
    console.log('A User connected');
    socket.emit('chat-message', 'Hello World')
});

server.listen(PORT, () => {
    serverLogger.info(`Visit the Chat App on http://localhost:${PORT}/login`);
});

export const viteNodeApp = app