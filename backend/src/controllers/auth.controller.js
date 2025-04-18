import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';


export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    
    try {
        // Validate required fields
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        // Save user to database
        await newUser.save();

        // Generate JWT token
        const token = generateToken(newUser._id,res);

        // Set token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        console.log(token);

        // Send response
        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic || null,
            token:token
        });

    } catch (error) {
        console.error("Error in signup controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async(req, res) => {
    const {email,password}=req.body
    try {
        const user=await User.findOne({email})
        if(!user)
        {
            return res.status(400).json({message:"Invalid credentails"})

        }

        const isPasswordCorrect=await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect)
        {
            return res.status(400).json({message:"Invalid credentails"})

        }
        const token=generateToken(user._id, res)
                // Set token in cookie
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict"
                });
                console.log(token);
        return res.status(200).json({
            _id:user.id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
            token:token,
        })

    } catch (error) {
        console.log("Error in login controller",error.message);
        return res.status(500).json({message:"Internal server error"});

    }
    res.send()
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0});
        return res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller",error.message);
        return res.status(200).json({message: "Logged out successfully"});

    }
};


export const updateProfile=async(req,res)=>
{
    try {
        const {profilePic}=req.body;
        const userId=req.user._id;
        if(!profilePic)
        {
            return res.status(400).json({message: "Profile pic is required"});

        }
        const uploadResponse=await cloudinary.uploader.upload(profilePic);
        const updatedUser=await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});
        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("error in update profile:", error);
        res.status(500).json({message:"Internal server error"});
    }
};


export const checkAuth=(req, res)=>
{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller",error.message);
        res.status(500).json({message:"Internal server Error"});
    }
};