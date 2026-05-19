import express from 'express';
const app = express();
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import path from 'path';

dotenv.config();
const __dirname = path.resolve();
const Port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get('*', (_,res)=>{
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
}

app.listen(Port, (err)=>{
    if(err){
        console.error(err);
    }   
    console.log(`Server is running on port ${Port}`);
});