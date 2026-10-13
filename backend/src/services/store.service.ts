import Store from '../models/store.model.ts'
import type { StoreData, UpdateStoreData } from '../schema/store.schema.ts'

export const getAllStoresFeature = async () => {
    const stores = await Store.find()
    return stores
}

export const getStoreByIdFeature = async (id: string) => {
    const store = await Store.findById(id)
    if (!store) throw new Error('Store not found')
    return store
}

export const createStoreFeature = async (ownerId: string, data: StoreData) => {
    const store = await Store.create({ ...data, owner: ownerId })
    return store
}

export const updateOwnStoreFeature = async (storeId: string, ownerId: string, data: UpdateStoreData) => {
    const store = await Store.findById(storeId)
    if (!store) throw new Error('Store not found')
    if (store.owner.toString() !== ownerId) throw new Error('Not authorized to edit this store')

    Object.assign(store, data)
    await store.save()
    return store
}

export const deleteOwnStoreFeature = async (storeId: string, ownerId: string): Promise<void> => {
    const store = await Store.findById(storeId)
    if (!store) throw new Error('Store not found')
    if (store.owner.toString() !== ownerId) throw new Error('Not authorized to delete this store')

    await store.deleteOne()
}
