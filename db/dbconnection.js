// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";

// let connectdb=async()=>{
//     try {
//         let connectioninstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log(`MongoDB connected !! DB Host:${connectioninstance.connection.host}`)
//     } catch (error) {
//         console.log('Mongo DB connection error',error)
//     }
// }

// export {connectdb}

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const connectdb = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected!! DB Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error('Mongo DB connection error:', error);
  }
};

// Call the connection function
connectdb();
export {connectdb}
