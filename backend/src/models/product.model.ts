import {Schema,model,Types} from "mongoose";

export interface IsizeStock{
    size:string
    quantity:number
}

export interface Iproduct{
    name:string
    description:string
    price:number
    image?:string
    category:string
    gender:'men'|'women'
    sizes:IsizeStock[]
    quantity:number
    stock:'in_stock'|'out_of_stock'
    store:Types.ObjectId
};

const sizeStockSchema = new Schema<IsizeStock>({
    size:{type:String,required:true},
    quantity:{type:Number,required:true,default:0,min:0}
},{_id:false});

const productModel = new Schema<Iproduct>({
     name:{type:String,required:true},
     description:{type:String,required:true},
     price:{type:Number,required:true},
     image:{type:String,required:false},
     category:{type:String,required:true},
     gender:{type:String,enum:['men','women'],required:true},
     sizes:{type:[sizeStockSchema],default:[]},
     quantity:{type:Number,required:true,default:0,min:0},
     stock:{type:String,enum:['in_stock','out_of_stock'],required:true},
     store:{type:Schema.Types.ObjectId,ref:'Store',required:true}
});


productModel.pre('validate', function () {
    this.quantity = this.sizes.reduce((sum, entry) => sum + entry.quantity, 0)
    this.stock = this.quantity > 0 ? 'in_stock' : 'out_of_stock'
});

const Product = model<Iproduct>('Product',productModel);
export default Product;
