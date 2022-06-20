import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Image } from "../models/Image.model.js";
import bcrypt from 'bcrypt';

export const signup = async (req, res) => {
    const url = req.protocol + '://' + req.get('host');
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        res.status(400).json({ success: false, message: "Sorry, that email is already taken" })
    }
    else {
        const { username, email, password } = req.body;
        bcrypt.hash(password, 10, async (err, hashPassword) => {
            const createdImage = new Image({
                image: url + '/public/' + req.file.filename
            });
            const user = new User({
                username, email, password: hashPassword,
                profileImg: createdImage._id
            });
            await createdImage.save();
            await user.save();
            res.status(200).json({ success: true, data: user });
        })
    }
};

export const signin = async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        bcrypt.compare(req.body.password, user.password, (err, passwordIsValid) => {
            if (passwordIsValid) {
                let token = jwt.sign({ _id: user._id, username: user.username, email: user.email },
                    process.env.API_SECRET, { expiresIn: '1h' });
                res.status(200).send({ success: true, message: 'Bearer ' + token });
            } else {
                res.status(401).send({ success: false, message: "invalid credentials" });
            }
        })
    } else {
        res.status(401).send({ success: false, message: "invalid credentials" });
    }
}