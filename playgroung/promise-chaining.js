import "../src/db/mongoose.js"
import {User} from "../src/models/user.js"
import {Task} from "../src/models/task.js"

// User.findByIdAndUpdate("624040b61d2fb5201e862e22",{
//     age: 1 }).then((user)=>{
//         console.log(user)
//         return User.countDocuments({ age:1 })
//     }).then((result)=>{
//         console.log(result)
//     }).catch((e)=>{
//         console.log(e)
//     })

 const updateAgeAndCount = async (id, age) =>{
    const user = await User.findByIdAndUpdate(id, {age})
    const count = await User.countDocuments({age})
    return count
 }   

 updateAgeAndCount("623d957d0aaf6e69bf509a78",21)
 .then((count)=>{
     console.log(count)
 }).catch((e)=>{
     console.log(e)
 })

// Task.findByIdAndDelete("624044f0129c96d9ee00c88f")
// .then((task)=>{
//         console.log(task)
//         return User.countDocuments({ completed:true })
//     }).then((result)=>{
//         console.log(result)
//     }).catch((e)=>{
//         console.log(e)
//     })

const findIdAndDelett = async (id) =>{
    const task = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments(id)
    return count
 }  

 findIdAndDelett("623d9827e3736a52c6c49038")
 .then((count)=>{
     console.log(count)
 }).catch((e)=>{
     console.log(e)
 }) 
    