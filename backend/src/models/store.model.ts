import {Schema,model,Types} from "mongoose";

export interface Istore{
    name:string
    location?:string
    logo?:string
    category:'men'|'women'|'men & women'
    owner:Types.ObjectId
};

const storeModel = new Schema<Istore>({
     name:{type:String,required:true,unique:true},
     location:{type:String,required:false},
     logo:{type:String,required:false},
     category:{type:String,enum:['men','women','men & women'],required:true},
     owner:{type:Schema.Types.ObjectId,ref:'User',required:true}
});

const Store = model<Istore>('Store',storeModel);
export default Store;
