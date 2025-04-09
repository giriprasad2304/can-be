require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());

// ✅ Proper CORS Middleware
const allowedOrigins = [
    "https://giriprasad2304.github.io", // Your frontend URL
    "http://localhost:3000" // For local testing
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Handle Preflight Requests
app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.sendStatus(200);
});

// Root route
app.get("/", (req, res) => {
    res.send("Hello, World!");
});

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

// ✅ Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 10000
        });
        console.log('Connected to database');
    } catch (error) {
        console.error('Database connection error:', error.message);
        throw error;
    }
};

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
};

startServer();

// ✅ Menu Schema and Routes
const menuSchema = new mongoose.Schema({
    category: String,
    items: [
        {
            name: String,
            price: String,
            image: String,
            quantity: Number
        }
    ]
});

const Menu = mongoose.model('Menu', menuSchema);

app.get('/menu', async (req, res) => {
    try {
        const menu = await Menu.find();
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Order Schema and Routes
const orderSchema = new mongoose.Schema({
    consumer: String,
    flavour: String,
    quantity: Number,
    phone: String,
    info: String
});

const Order = mongoose.model('Order', orderSchema);

app.post('/order', async (req, res) => {
    console.log("Incoming order data:", req.body); // Debugging log

    const { consumer, flavour, quantity, phone, info } = req.body;
    if (!consumer || !flavour || !quantity || !phone || !info) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const newOrder = new Order({ consumer, flavour, quantity, phone, info });
        await newOrder.save();
        res.status(201).json({ message: "Order created" });
    } catch (err) {
        console.error("Error creating order:", err.message);
        res.status(500).json({ message: "Error creating order: " + err.message });
    }
});

// ✅ Handle Undefined Routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
