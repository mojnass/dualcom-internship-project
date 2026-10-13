import { Schema, model, Types } from "mongoose";

export interface IorderItem {
    product: Types.ObjectId
    name: string
    price: number
    size: string
    quantity: number
    image?: string
}

export interface Iorder {
    customer: Types.ObjectId
    store: Types.ObjectId
    items: IorderItem[]
    total: number
    paymentMethod: 'cash' | 'card'
    address: {
        label: string
        fullAddress: string
        building?: string
        floor?: string
        apartment?: string
        notes?: string
        lat: number
        lng: number
    }
    status: 'pending' | 'accepted' | 'rejected' | 'delivered'
    rejectionReason?: string
    createdAt: Date
}

const orderItemSchema = new Schema<IorderItem>({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: false }
}, { _id: false });

const orderSchema = new Schema<Iorder>({
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card'], required: true },
    address: {
        label: { type: String, required: true },
        fullAddress: { type: String, required: true },
        building: { type: String, required: false },
        floor: { type: String, required: false },
        apartment: { type: String, required: false },
        notes: { type: String, required: false },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'delivered'], default: 'pending' },
    rejectionReason: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

const Order = model<Iorder>('Order', orderSchema);
export default Order;
