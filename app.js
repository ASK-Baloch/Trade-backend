import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import userrouter from './Routes/user.routes.js'
import videorouter from './Routes/video.routes.js'
 
 
const app=express()

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


app.use('/api/v1/user',userrouter)
// app.use("/",userrouter)
app.use('/api/v1/video',videorouter)
 
 
 


export {app}