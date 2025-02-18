import express from 'express'
import http from 'http'
import winston from 'winston'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const server = http.createServer(app)
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
        new winston.transports.File({ filename: "/App/Server/Logs/server-logs.log"}),
        new winston.transports.Console()
    ]
})

app.use(express.json())

app.use(
    cors({
        origin: 'localhost:443',
        methods: ['POST', 'GET', 'DELETE', 'UPDATE'],
        allowedHeaders: ['Authorization', 'Content-Type']
    })
)

// Global middleware to remove X-Powered-By header
app.use((req, res, next) => {
    res.removeHeader("X-Powered-By");
    next();
  });

app.use(express.static(path.join(__dirname, '../Client')))

app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname, "/App/Client/Views/dashboard.html")
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname, "/App/Client/Views/login.html")
})

app.get('/register', (req, res) => {
    res.sendFile(__dirname, "/App/Client/Views/register.html")
})

server.listen(PORT, () => {
    console.log(`Visit the Chat App on http://localhost:${PORT}/login`)
})