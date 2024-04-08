import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser"



const app=express()
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
))
//from the browser the req may come in the form of url or json or file ,they are handeled by middleware using cors before sending reques to server
//Cookies are small pieces of data stored in the user's browser by websites they visit. 
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true ,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import

import userRouter from './routes/user.routes.js';
import publishRouter from './routes/video.routes.js';
import subscriptionRouter from './routes/subscription.routes.js'




//routes declration 
app.use("/api/v1/users",userRouter)
app.use("/api/v1/publish",publishRouter)
app.use("/api/v1/subscribe",subscriptionRouter)

//http://localhost:8000/api/v1/users/register


export { app }
