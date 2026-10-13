import User from '../models/user.model.ts'
import Store from '../models/store.model.ts'

export const getOwnProfileFeature = async (ownerId: string) => {
    const storeOwner = await User.findById(ownerId)
    if(!storeOwner || storeOwner.role !== 'store_owner') {
    throw new Error('Store owner not found')
    }
    return storeOwner
    
}

export const getOwnStoresFeature = async (ownerId: string) => {
    const stores = await Store.find({ owner: ownerId })
    return stores
}
