import express from "express";
import http from 'http'
import winston from 'winston'
import { Server } from 'socket.io'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeMariaDB, initializeDBSchema, executeSQL } from './Database/database'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import apiRouter from './API/api.js'
dotenv.config()

// Utility function to safely convert database results
const safeJsonParse = (obj) => {
    return JSON.parse(JSON.stringify(obj, (_, value) =>
        typeof value === 'bigint' ? Number(value) : value
    ));
};

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
// Basic middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Remove X-Powered-By header
app.use((req, res, next) => {
    res.removeHeader("X-Powered-By");
    next();
});

// CORS configuration
app.use(
    cors({
        origin: ['http://localhost:4200', 'http://localhost:4300'],  // Match Socket.IO CORS origins
        methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
        credentials: true,
        allowedHeaders: ['Authorization', 'Content-Type']
    })
)

// Mount API routes
app.use('/api', apiRouter)

// Serve static files 
app.use(express.static(path.join(__dirname, '../Client')))

// Generic error handler middleware
app.use((err, req, res, next) => {
    serverLogger.error(`Error: ${err.message}\nStack: ${err.stack}`);
    
    // Don't expose internal error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message;
    
    res.status(err.status || 500).json({
        error: errorMessage
    });
});

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

// Static HTML routes
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "Client", "Views", "index.html"));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "Client", "Views", "login.html"))
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "Client", "Views", "register.html"))
})
app.get('/')

// Registration endpoint
app.post('/auth/register', async (req, res) => {
    console.log('Attempting registration with:', {
        username: req.body.username,
        queryParams: [req.body.username, 'hashedPassword'], // Don't log actual hash
        timestamp: new Date().toISOString()
    });
    
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // Check if user already exists
        const existingUser = await executeSQL(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await executeSQL(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            [username, hashedPassword]
        );

        const userId = Number(result.insertId); // Convert BigInt to Number

        // Generate JWT token
        const token = jwt.sign(
            { userId, username },
            process.env.JWT_SECRET || 'your-default-secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            userId: userId,
            token
        });

    } catch (error) {
        console.log('Registration error details:', {
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack
        });
        serverLogger.error(`Registration error: ${error.message}\n${error.stack}`);
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed',
            error: error.message 
        });
    }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // Find user
        const users = await executeSQL(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }

        const user = users[0];

        // Compare password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'your-default-secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            userId: Number(user.id),
            token
        });

    } catch (error) {
        serverLogger.error(`Login error: ${error.message}\n${error.stack}`);
        res.status(500).json({ 
            success: false, 
            message: 'Login failed',
            error: error.message 
        });
    }
});

// Get message history endpoint
app.get('/api/messages', authenticateUser, async (req, res) => {
    try {
        const messages = await executeSQL(
            `SELECT m.*, u.username 
            FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            ORDER BY m.timestamp DESC 
            LIMIT 50`
        );
        res.json(messages.reverse());
    } catch (error) {
        serverLogger.error(`Error fetching messages: ${error.message}`);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// Socket.IO Authentication Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication required'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
        socket.userId = decoded.userId;
        socket.username = decoded.username;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    serverLogger.info(`User ${socket.username} connected`);

    // Send connection acknowledgment with user info
    socket.emit('connect-success', {
        userId: socket.userId,
        username: socket.username
    });

    // Fetch messages through API route
    fetch(`http://localhost:${PORT}/api/messages`, {
        headers: {
            'Authorization': `Bearer ${socket.handshake.auth.token}`
        }
    })
    .then(response => response.json())
    .then(messages => {
        socket.emit('previous-messages', messages);
    })
    .catch(error => {
        serverLogger.error(`Error loading messages: ${error.message}`);
        socket.emit('error', 'Failed to load message history');
    });

    // Handle new messages
    socket.on('send-chat-message', async (messageData) => {
        try {
            const { content, timestamp } = messageData;
            
            // Store message through API
            const response = await fetch(`http://localhost:${PORT}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${socket.handshake.auth.token}`
                },
                body: JSON.stringify({
                    content,
                    timestamp: timestamp || new Date()
                })
            });

            const result = await response.json();
            const messageId = result.id;

            // Broadcast message to all clients
            io.emit('chat-message', {
                id: messageId,
                content: content,
                sender_id: socket.userId,
                username: socket.username,
                timestamp: timestamp || new Date()
            });

        } catch (error) {
            serverLogger.error(`Error storing message: ${error.message}`);
            socket.emit('error', 'Failed to send message');
        }
    });

    // Handle typing status
    socket.on('typing', (isTyping) => {
        socket.broadcast.emit('user-typing', {
            username: socket.username,
            isTyping: isTyping
        });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        serverLogger.info(`User ${socket.username} disconnected`);
        io.emit('user-disconnected', {
            username: socket.username,
            timestamp: new Date()
        });
    });
});

;(async function () {
    initializeMariaDB()
    try {
        await initializeDBSchema()
    } catch (error) {
        console.error("Failed to initialize DBschema")
    }
    server.listen(PORT, () => {
        serverLogger.info(`Visit the Chat App on http://localhost:${PORT}/login`);
    });
})();


export const viteNodeApp = app