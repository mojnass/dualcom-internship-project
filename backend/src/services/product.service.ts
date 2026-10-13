import Product from '../models/product.model.ts'
import Store from '../models/store.model.ts'
import type { ProductData, UpdateProductData } from '../schema/product.schema.ts'

export const getAllProductsFeature = async () => {
    const products = await Product.find()
    return products
}

export const getProductByIdFeature = async (id: string) => {
    const product = await Product.findById(id)
    if (!product) throw new Error('Product not found')
    return product
}

export const createProductFeature = async (storeId: string, ownerId: string, data: ProductData) => {
    const store = await Store.findById(storeId)
    if (!store) throw new Error('Store not found')
    if (store.owner.toString() !== ownerId) throw new Error('Not authorized to add products to this store')

    const product = await Product.create({
        ...data,
        store: storeId
    })
    return product
}

export const updateOwnProductFeature = async (productId: string, ownerId: string, data: UpdateProductData) => {
    const product = await Product.findById(productId)
    if (!product) throw new Error('Product not found')

    const store = await Store.findById(product.store)
    if (!store) throw new Error('Store not found')
    if (store.owner.toString() !== ownerId) throw new Error('Not authorized to edit this product')

    Object.assign(product, data)
    await product.save()
    return product
}

export const deleteOwnProductFeature = async (productId: string, ownerId: string): Promise<void> => {
    const product = await Product.findById(productId)
    if (!product) throw new Error('Product not found')

    const store = await Store.findById(product.store)
    if (!store) throw new Error('Store not found')
    if (store.owner.toString() !== ownerId) throw new Error('Not authorized to delete this product')

    await product.deleteOne()
}
