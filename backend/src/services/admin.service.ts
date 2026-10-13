import User from '../models/user.model.ts'
import type { CreateStoreOwnerData } from '../schema/admin.schema.ts'
import { hash } from 'bcrypt-ts'

export const createStoreOwnerFeature = async (data: CreateStoreOwnerData) => {
    const hashedPassword = await hash(data.password, 10)
    const storeOwner = await User.create({
        ...data,
        email: data.email || undefined,
        password: hashedPassword,
        role: 'store_owner'
    })
    return storeOwner
}

export const deleteStoreOwnerFeature = async (id: string): Promise<void> => {
    const storeOwner = await User.findByIdAndDelete(id)
    if (!storeOwner) throw new Error('Store owner not found')
}

export const getAllUsersFeature = async () => {
    const users = await User.find({ role: 'customer' })
    return users
}

export const getAllStoreOwnersFeature = async () => {
    const storeOwners = await User.find({ role: 'store_owner' })
    return storeOwners
}
