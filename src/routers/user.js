import express  from "express"
import { User } from "../models/user.js"
export const userRouter = express.Router()
import { auth } from "../middleware/auth.js"
import multer from "multer"
import sharp from "sharp"
import { sendWelcomeEmail } from "../emails/account.js"
import { sendCancelEmail  } from "../emails/account.js"

userRouter.post("/users", async(req,res)=>{

    const user = new User(req.body)
    
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch{
        res.status(400).send()
    } 
})

userRouter.post('/users/login', async(req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }
    catch(e){
        res.status(400).send()
    }
})

userRouter.get("/users/me",auth, async(req,res)=>{

    // console.log(req.user)

    // try{
    //     const users = await User.find({})
    //     res.send(users)
    // }catch(e){
    //     res.status(500).send()
    // }
    res.send(req.user)
})

userRouter.patch("/users/me", auth, async(req,res)=>{
    
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name","email","password","age"]
    const isValidOperation = updates.every((update)=>
        allowedUpdates.includes(update))
    if (!isValidOperation){
        return res.status(400).send( {error: "Invalid updates!"})
    }    

    try{
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }catch (e){
        res.status(400).send(e)
    }
})

userRouter.delete("/users/me", auth, async(req,res)=>{

    console.log(req.user)
    const R = req.user
    try{
        await req.user.remove()
        sendCancelEmail(R.email,R.name)
        res.send(req.user) 

    }catch (e){
        res.status(500).send()
    }
})

userRouter.post('/users/logout',auth, async(req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send("user is logged out")
    }
    catch (e){
        res.status(500).send()
    }
})

userRouter.post('/users/logoutAll',auth, async(req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send("All users are logged out")
    }
    catch (e){
        res.status(500).send()
    }
})

const upload = multer({
    limits:{
        fileSize: 1000000
},
fileFilter(req, file, cb)
{
    console.log(file)
    if(!file.originalname.match(/\.(png|jpg)$/)) {
        cb(new Error("please uplode image only"))
    }
    cb(undefined, true)
}
})

userRouter.post("/users/me/avatar",auth ,upload.single("avatar"), async (req,res)=>{

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send() 
},(error, req, res, next)=>{
        res.status(400).send({error: error.message})
    })  

userRouter.delete("/users/me/avatar",auth, async(req,res)=>{
        
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})      

userRouter.get("/users/:id/avatar",auth, async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }
        
        res.set("Content-type","image/jpg")
        res.send(user.avatar)
    }
    catch(e){
        res.status(400).send()
    }
})