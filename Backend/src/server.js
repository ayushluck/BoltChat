import express from 'express';
const app = express();
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './lib/db.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Port = process.env.PORT || 3000;
const frontendDistPath = path.join(__dirname, '../../Frontend/dist');

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(frontendDistPath));
    app.get('*', (_,res)=>{
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

app.listen(Port, (err)=>{
    if(err){
        console.error(err);
    }   
    console.log(`Server is running on port ${Port}`);
    connectDB();
});
