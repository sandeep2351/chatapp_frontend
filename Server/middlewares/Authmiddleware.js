const jwt = require("jsonwebtoken");
const User = require("../models/Usermodel"); // Ensure this path is correct

const verifytoken = async (request, response, next) => {
    const token = request.cookies.jwt;
    if (!token) {
        return response.status(401).send("User not authenticated");
    }

    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
        if (err) {
            console.error("JWT verification error:", err);
            return response.status(403).send("Token is not valid!");
        }

        // Attach userId to request object
        request.userId = payload.userId;

        try {
            // Fetch user details from the database
            const user = await User.findById(request.userId);
            if (!user) {
                return response.status(404).send("User not found");
            }

            // Attach user details to request object
            request.user = user;
            next();
        } catch (error) {
            console.error("Error fetching user data:", error);
            return response.status(500).send("Internal server error");
        }
    });
};

module.exports = {verifytoken };
