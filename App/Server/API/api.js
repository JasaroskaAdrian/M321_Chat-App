import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { executeSQL } from '../Database/database';

const router = express.Router();

// Authentication middleware
const authenticateToken = (req, res, next) => {
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];

if (!token) {
    return res.status(401).json({ error: 'Access denied' });
}

try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
} catch (err) {
    res.status(403).json({ error: 'Invalid token' });
}
};

// Authentication Routes
router.post('/register', async (req, res) => {
try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = await executeSQL('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
    return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert user
    await executeSQL(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, hashedPassword]
    );
    
    res.status(201).json({ message: 'User created successfully' });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.post('/login', async (req, res) => {
try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check if user exists
    const users = await executeSQL('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
    );
    
    res.json({ token, userId: user.id, username: user.username });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
}
});

// Message Routes
router.get('/messages', authenticateToken, async (req, res) => {
try {
    const messages = await executeSQL(
    `SELECT m.*, u.username FROM messages m 
    JOIN users u ON m.sender_id = u.id 
    ORDER BY m.timestamp DESC LIMIT 100`
    );
    res.json(messages);
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.post('/messages', authenticateToken, async (req, res) => {
try {
    const { content } = req.body;
    const senderId = req.user.userId;
    
    if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
    }
    
    await executeSQL(
    'INSERT INTO messages (sender_id, content, timestamp) VALUES (?, ?, NOW())',
    [senderId, content]
    );
    
    res.status(201).json({ message: 'Message sent successfully' });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
}
});

// User Routes
router.get('/users', authenticateToken, async (req, res) => {
try {
    const users = await executeSQL('SELECT id, username, email FROM users');
    res.json(users);
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.get('/users/:id', authenticateToken, async (req, res) => {
try {
    const { id } = req.params;
    const users = await executeSQL(
    'SELECT id, username, email FROM users WHERE id = ?',
    [id]
    );
    
    if (users.length === 0) {
    return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
}
});

export default router;
