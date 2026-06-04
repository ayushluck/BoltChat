import cloudinary from '../lib/cloudinary.js';
import User from '../models/User.js';
import Message from '../models/message.js';
import { getReceiverSocketId, io } from '../lib/socket.js';
const userResponse = (user) => ({
    _id: user._id,
    fullName: user.fullname,
    email: user.email,
    profilePic: user.profilePic,
});

export const getAllContacts = async( req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
        res.status(200).json(filteredUsers.map(userResponse));
    }catch(err){
        console.error('Error fetching contacts:', err);
        res.status(500).json({ message: 'Error fetching contacts' });
    }
}

export const getMessagesByUserId = async (req, res) => {
    try {
    const myId = req.user._id;
    const {id:userToChatId} = req.params;
    const message = await Message.find({
        $or:[
                {senderId:myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ]
        }).sort({createdAt:1});
        res.status(200).json(message);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });
        await newMessage.save();

        //todo send real-time notification to receiver using socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
}

export const getChatPartners = async(req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const messages = await Message.find({
            $or:[{senderId:loggedInUserId}, {receiverId:loggedInUserId}]
        });
        const chatPartnerIds = [...new Set(messages.map(msg => msg.senderId === loggedInUserId.toString() ? msg.receiverId.toString() : msg.senderId.toString()))];
        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select('-password');
        res.status(200).json(chatPartners.map(userResponse));
    } catch (error) {
        console.error('Error fetching chat partners:', error);
        res.status(500).json({ message: 'Error fetching chat partners' });
    }
}
