import mongoose from 'mongoose';
import ENV from './env.js';

const connectDB = async () => {
    try{
        const conn =await mongoose.connect(ENV.MONGO_URI);
        console.log("Connected to MongoDB",conn.connection.host);
    }catch(err){
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

export default connectDB;
