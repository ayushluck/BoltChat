import express from 'express';
const app = express();
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';

dotenv.config();
const Port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(Port, (err)=>{
    if(err){
        console.error(err);
    }   
    console.log(`Server is running on port ${Port}`);
});