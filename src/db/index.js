/*
import mongoose, { connect } from 'mongoose';
import { DB_NAME } from './constants.js';
import express from 'express';


const connectDB=async () => {
    try{
        const connectionInstance=await mongoose.connect('${process.env.MONGODB_URI}/${DB_NAME}')
        console.log('\n Connected : $ {connectionInstance.connection.host}');

    }catch(error)
    {
        console.log("ERROR in connecting to db",error);
        process.exit(1)
    }
}
export default connectDB
*/
import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
import express from 'express';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("ERROR in connecting to db", error);
        process.exit(1);
    }
};

export default connectDB;
