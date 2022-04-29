import validator from "validator"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Task } from "./task.js"

export const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid!")
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error("age must be a positve number")
            }
        }
    },
    tokens:[{ 
        token:{
            type: String,
            required: true,
        }
    }],

    password: { 
        type: String,
        required: true,
        trim: true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("Password cannot contain password!")
            }
        }   
    },
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
})

UserSchema.virtual("tasks",{
    "ref": "Task",
    "localField": "_id",
    "foreignField": "owner"
})

UserSchema.methods.toJSON = function() {
    const user = this 
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

UserSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

UserSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({ email })

    if(!user){
        throw new Error("unable to login")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch)
    {
        throw new Error("unable to login")
    }
    return user
}

UserSchema.pre("save",async function(next){
    const user = this

    if(user.isModified("password"))
    {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

UserSchema.pre("remove",async function(next){
    const user = this
    await Task.deleteMany({"owner": user._id})
    next()
})

export const User = mongoose.model("User",UserSchema)