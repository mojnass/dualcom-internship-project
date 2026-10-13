import mongoose from "mongoose";

interface Iuser{
    name:string
    lastName:string
    phoneNumber:string
    email?:string
    password:string
    role: 'customer' | 'store_owner' | 'admin'
}

const userSchema = new mongoose.Schema<Iuser>({
    name:{type:String, required:true},
    lastName:{type:String, required:true},
    phoneNumber:{type:String, required:true, unique:true},
    email:{type:String,required:false, unique:true, sparse:true},
    password:{type:String, required:true,select:false},
    role:{type:String, enum:['customer','store_owner','admin'], default:'customer'}
})

const User= mongoose.model<Iuser>('User',userSchema);
export default User;