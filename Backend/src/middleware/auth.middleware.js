import jwt from 'jsonwebtoken';
import ENV from '../lib/env.js';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({
                message:"Unauthoried access, token missing"
            });
        }
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message:"Unauthoried access, invalid token"});
        }
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(401).json({message:"Unauthoried access, user not found"});
        }
        req.user = user;
        next();
    }catch(err){
        console.error("Error in auth middleware:", err);
        return res.status(401).json({message:"Unauthoried access, invalid token"});
    }
}
