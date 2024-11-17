const express = require('express');
const { signup, login, getUserInfo, updateProfile, addProfileImage, removeProfileImage,logOut } = require('../controllers/AuthController');
const { verifytoken } = require('../middlewares/Authmiddleware');
const multer = require('multer');
const path=require("path");

const authRoutes = express.Router();

const storage = multer.diskStorage({
  destination: (request, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (request, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

authRoutes.post('/signUp', signup);
authRoutes.post('/login', login);
authRoutes.get('/userInfo', verifytoken, getUserInfo);
authRoutes.post('/update-profile', verifytoken, updateProfile);
authRoutes.post('/add-profile-image', verifytoken, upload.single('profile-image'), addProfileImage);
authRoutes.delete('/remove-profile-image', verifytoken, removeProfileImage);
authRoutes.post('/logout',logOut);

module.exports = authRoutes;
