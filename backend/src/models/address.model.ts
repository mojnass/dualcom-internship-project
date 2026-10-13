import { Schema, model, Types } from "mongoose";

export interface Iaddress {
    label: string
    fullAddress: string
    building?: string
    floor?: string
    apartment?: string
    notes?: string
    lat: number
    lng: number
    user: Types.ObjectId
}

const addressSchema = new Schema<Iaddress>({
    label: { type: String, required: true },
    fullAddress: { type: String, required: true },
    building: { type: String, required: false },
    floor: { type: String, required: false },
    apartment: { type: String, required: false },
    notes: { type: String, required: false },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

const Address = model<Iaddress>('Address', addressSchema);
export default Address;
