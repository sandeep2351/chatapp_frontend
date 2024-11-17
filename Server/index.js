const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/Authroutes');
const { contactsRoutes } = require('./routes/ContactRoutes'); // Ensure this matches the export in ContactRoutes.js
const { setupServer } = require('./socket');
const { messageRoutes } = require('./routes/Messageroutes'); // Ensure this matches the export in Messageroutes.js
const { channelroutes } = require("./routes/Channelroutes");  // Correct relative path


dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const url = process.env.MONGO_URL;

app.use(cors({
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
}));

// Serve static files
// Static file serving
app.use('/uploads/profiles', express.static('uploads/profiles'));
app.use('/uploads/files', express.static('uploads/files'));




app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes); // Ensure this is correct
app.use('/api/messages', messageRoutes); // Ensure this is correct
app.use('/api/channel',channelroutes);

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

setupServer(server).catch(err => {
    console.error('Error setting up Socket.IO server:', err);
});
