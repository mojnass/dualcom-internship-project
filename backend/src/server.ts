import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import User from './routes/user.routes.ts'
import adminRouter from './routes/admin.routes.ts'
import storeRouter from './routes/store.routes.ts'
import storeOwnerRouter from './routes/storeOwner.route.ts'
import productRouter from './routes/product.routes.ts'
import addressRouter from './routes/address.routes.ts'
import orderRouter from './routes/order.routes.ts'
import uploadRouter from './routes/upload.routes.ts'


const server = express();

server.use(express.json());
server.disable('x-powered-by');
server.use(cors({origin: process.env.CLIENT_URL}))
server.use('/user',User);
server.use('/admin', adminRouter);
server.use('/store', storeRouter);
server.use('/store-owner', storeOwnerRouter);
server.use('/product', productRouter);
server.use('/address', addressRouter);
server.use('/order', orderRouter);
server.use('/upload', uploadRouter);

try {
  await mongoose.connect(process.env.Mongo_URI!)
  console.log('MongoDB connected ')
} catch (error) {
  console.error('MongoDB connection failed ', error)
  process.exit(1)
}

server.listen(3000, () =>{
    console.log("server running ,your good to go");
})