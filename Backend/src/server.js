import express from 'express';
const app = express();
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './lib/db.js';
import ENV from './lib/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Port = ENV.PORT || 3000;
const frontendDistPath = path.join(__dirname, '../../Frontend/dist');

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(ENV.NODE_ENV === 'production'){
    app.use(express.static(frontendDistPath));
    app.get('*', (_,res)=>{
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

const server = app.listen(Port, ()=>{
    console.log(`Server is running on port ${Port}`);
    connectDB();
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${Port} is already in use. Stop the other process or set a different PORT in .env.`);
    } else {
        console.error('Server failed to start:', err);
    }
    process.exit(1);
});
