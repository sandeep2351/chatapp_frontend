const User = require("../models/Usermodel.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require('path');
const maxAge = 3 * 24 * 60 * 60;

const createtoken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge });
};

const signup = async (request, response, next) => {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).send("Email and password are required");
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return response.status(400).send("Email already exists");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create a new user with the hashed password
        const user = new User({ email, password: hashedPassword });
        await user.save();

        // Create a token for the new user
        const token = createtoken(user.email, user._id);

        // Set the token in the response cookie
        response.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000,
            secure: true,
            sameSite: "None",
        });

        // Return success response
        return response.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                profileSetup: user.profileSetup,
            },
        });
    } catch (error) {
        console.log("Error in signup handler:", error);
        return response.status(500).send("Internal server error");
    }
};



const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("Email and password are required");
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send("User not found!");
        }

        // Compare the entered password with the hashed password in the database
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).send("Invalid credentials!");
        }

        // Create a token
        const token = createtoken(user.email, user._id);
        
        // Set the token in the response cookie
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000, // Convert to milliseconds
            secure: true,
            sameSite: "None",
        });

        // Return success response with user details
        return res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            },
        });
    } catch (error) {
        console.log("Error in login handler:", error);
        return res.status(500).send("Internal server error");
    }
};

const getUserInfo = async (request, response, next) => {
    try {
        console.log("Fetching user info for userId:", request.userId);

        const userData = await User.findById(request.userId);
        if (!userData) {
            console.log("User not found");
            return response.status(400).send("User not found");
        }

        console.log("User data found:", userData);
        return response.status(200).json({
            id: userData._id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        });
    } catch (error) {
        console.error("Error in getUserInfo handler:", error);
        return response.status(500).send("Internal server error");
    }
};

const updateProfile = async (request, response, next) => {
    try {
        console.log("UpdateProfile function called");
        console.log("Received data:", request.body);

        const { userId } = request;
        const { firstName, lastName, color } = request.body;

        if (!firstName || !lastName) {
            return response.status(400).send("First name and last name are required!");
        }

        const userData = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName, color, profileSetup: true },
            { new: true, runValidators: true }
        );

        if (!userData) {
            return response.status(404).send("User not found");
        }

        return response.status(200).json({
            id: userData._id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        });
    } catch (error) {
        console.error("Error in updateProfile handler:", error);
        return response.status(500).send("Internal server error");
    }
};

const addProfileImage = async (request, response, next) => {
    try {
        if (!request.file) {
            console.log('No file received:', request.file);
            return response.status(400).send('No file uploaded.');
        }

        const imagePath = request.file.filename;
        const user = await User.findByIdAndUpdate(request.user.id, { image: imagePath }, { new: true });

        if (!user) {
            console.log('User not found:', request.user.id);
            return response.status(404).send('User not found.');
        }

        return response.status(200).json({ image: imagePath });
    } catch (error) {
        console.error('Error uploading image:', error);
        return response.status(500).send('Internal server error');
    }
};

const removeProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // Fetch the user
        if (!user) {
            console.log('User not found:', req.user.id);
            return res.status(404).send('User not found.');
        }

        if (user.image) {
            const imagePath = path.join(__dirname, '../uploads/profiles', user.image);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            } else {
                console.warn(`File not found: ${imagePath}`);
            }

            user.image = null; // Clear the image from the user profile
            await user.save(); // Save the user profile
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error removing profile image:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const logOut = async (request, response) => {
    try {
        // Clear the JWT cookie by setting it with a very short expiration time
        response.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "none" });
        
        // Send a success response
        return response.status(200).send("Successfully logged out!");
    } catch (error) {
        console.error("Error during logout:", error);
        
        // Send an internal server error response
        return response.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports = { signup, login, getUserInfo, updateProfile, addProfileImage, removeProfileImage,logOut };
