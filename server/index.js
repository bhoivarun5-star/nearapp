import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { initDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-it';
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

const db = await initDb();

// Middleware to verify JWT
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// --- AUTH ROUTES ---

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const result = await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        const token = jwt.sign({ userId: result.lastID }, JWT_SECRET);
        res.json({ token, userId: result.lastID, username });
    } catch (err) {
        res.status(400).json({ error: 'Username already exists' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token, userId: user.id, username: user.username });
});

// --- USER & CONNECTION ROUTES ---

app.get('/api/users', authenticate, async (req, res) => {
    // Get all users except current user
    const users = await db.all('SELECT id, username FROM users WHERE id != ?', [req.userId]);

    // Also get the status of connections with these users
    const connections = await db.all('SELECT * FROM connections WHERE requesterId = ? OR receiverId = ?', [req.userId, req.userId]);

    const usersWithStatus = users.map(u => {
        const conn = connections.find(c => (c.requesterId === u.id || c.receiverId === u.id));
        return {
            ...u,
            connectionStatus: conn ? conn.status : 'none',
            isRequester: conn ? conn.requesterId === req.userId : false
        };
    });

    res.json(usersWithStatus);
});

app.post('/api/connect', authenticate, async (req, res) => {
    const { targetUserId } = req.body;
    await db.run('INSERT INTO connections (requesterId, receiverId) VALUES (?, ?)', [req.userId, targetUserId]);
    res.json({ success: true });
});

app.post('/api/accept', authenticate, async (req, res) => {
    const { requesterId } = req.body;
    await db.run('UPDATE connections SET status = "accepted" WHERE requesterId = ? AND receiverId = ?', [requesterId, req.userId]);
    res.json({ success: true });
});

// --- SOCKET.IO FOR REAL-TIME LOCATION ---

const userLocations = new Map(); // Store latest location of each active user

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(`user-${userId}`);
        socket.userId = userId;
    });

    socket.on('updateLocation', async ({ userId, location }) => {
        userLocations.set(userId, location);

        // Find all accepted connections for this user
        const connections = await db.all('SELECT * FROM connections WHERE (requesterId = ? OR receiverId = ?) AND status = "accepted"', [userId, userId]);

        connections.forEach(conn => {
            const otherUserId = conn.requesterId === userId ? conn.receiverId : conn.requesterId;
            // Emit location to the other user
            io.to(`user-${otherUserId}`).emit('locationChanged', { userId, location });
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Fallback for SPA: serve index.html for any unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
