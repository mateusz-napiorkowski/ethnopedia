import mongoose from "mongoose"

import { authAsyncWrapper } from "../middleware/auth"

const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()
import { NextFunction, Request, Response } from "express"

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existingUser = await User.findOne({ username: req.body.username }).exec()
        if (existingUser) {
            const err = new Error("User already exists")
            res.status(409)
            return next(err)
        }
    } catch {
        const err = new Error("Database unavailable")
        res.status(503)
        return next(err)
    }

    const hashCallback = async (err: Error, hashedPassword: string) => {
        if(err) {
            const err = new Error("Password encryption error")
            res.status(500)
            return next(err)
        }
        try {
            const user = await User.create({
                username: req.body.username,
                password: hashedPassword,
                firstName: req.body.firstName,
            })
            const token = jwt.sign(
                { username: user.username, firstName: user.firstName, userId: user._id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.EXPIRATION_TIME }
            )
            return res.status(201).json({ token })
        } catch {
            const err = new Error("Database unavailable")
            res.status(503)
            return next(err)
        }
    }

    const saltRounds = 10
    bcrypt.hash(req.body.password, saltRounds, hashCallback)        
}

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findOne({ username: req.body.username }).exec()
        if (!user) {
            const err = new Error("Invalid username or password")
            res.status(404)
            return next(err)
        }

        const compareCallback = (err: Error, validPassword: string) => {
            if(err) {
                const err = new Error("Internal server error")
                res.status(500)
                return next(err)
            }
            if (!validPassword) {
                const err = new Error("Invalid username or password")
                res.status(404)
                return next(err)
            } 
            const token = jwt.sign(
                { username: user.username, firstName: user.firstName, userId: user._id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.EXPIRATION_TIME })
            return res.status(200).json({ token })
        }

        bcrypt.compare(req.body.password, user.password, compareCallback)      
    } catch {
        const err = new Error("Database unavailable")
        res.status(503)
        return next(err)
    }
}

const deleteUser = authAsyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId
    if (!mongoose.isValidObjectId(userId)) {
        const err = new Error(`Invalid user id: ${userId}`)
        res.status(400)
        return next(err)
    }
    try {
        const deletedUserData = await User.findByIdAndRemove(userId).exec()
        if (!deletedUserData) {
            const err = new Error(`User not found`)
            res.status(404)
            return next(err)
        }
        return res.status(200).json(deletedUserData)
    } catch (error) {
        const err = new Error("Database unavailable")
        res.status(503)
        return next(err)
    }
})

module.exports = {
    registerUser,
    loginUser,
    deleteUser,
}