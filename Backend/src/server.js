import express from 'express';
const app = express();
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './lib/db.js';
import ENV from './lib/env.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Port = ENV.PORT || 3000;
const frontendDistPath = path.join(__dirname, '../../Frontend/dist');

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({origin: ENV.CLIENT_URL || "http://localhost:5173", credentials: true}));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.use((err, _req, res, next) => {
    if (err?.type === "entity.too.large") {
        return res.status(413).json({ message: "Image is too large. Please upload a smaller image." });
    }
    next(err);
});

const server = app.listen(Port, ()=>{
    console.log(`Server is running on port ${Port}`);
    connectDB();
});

if(ENV.NODE_ENV === 'production'){
    app.use(express.static(frontendDistPath));
    app.get('*', (_,res)=>{
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${Port} is already in use. Stop the other process or set a different PORT in .env.`);
    } else {
        console.error('Server failed to start:', err);
    }
    process.exit(1);
});
