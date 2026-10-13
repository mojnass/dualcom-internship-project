import { Types } from 'mongoose'
import Order from '../models/order.model.ts'
import Product from '../models/product.model.ts'
import Store from '../models/store.model.ts'
import Address from '../models/address.model.ts'
import type { CreateOrderData } from '../schema/order.schema.ts'

export const createOrderFeature = async (customerId: string, data: CreateOrderData) => {
    const address = await Address.findOne({ _id: data.addressId, user: customerId })
    if (!address) throw new Error('Address not found')

    const productIds = data.items.map((item) => item.product)
    const products = await Product.find({ _id: { $in: productIds } })

    const groupedByStore = new Map<string, { product: typeof products[number], size: string, quantity: number }[]>()

    const requestedPerSize = new Map<string, number>()
    for (const item of data.items) {
        const key = `${item.product}:${item.size}`
        requestedPerSize.set(key, (requestedPerSize.get(key) ?? 0) + item.quantity)
    }

    for (const item of data.items) {
        const product = products.find((p) => p._id.toString() === item.product)
        if (!product) throw new Error('One of the products is no longer available')

        const sizeStock = product.sizes.find((s) => s.size === item.size)
        if (!sizeStock) throw new Error(`${product.name} is not sold in size ${item.size}`)
        if (sizeStock.quantity <= 0) throw new Error(`${product.name} is out of stock in size ${item.size}`)

        const requested = requestedPerSize.get(`${item.product}:${item.size}`) ?? 0
        if (requested > sizeStock.quantity) {
            throw new Error(`Only ${sizeStock.quantity} left in size ${item.size} for ${product.name}`)
        }

        const storeId = product.store.toString()
        const group = groupedByStore.get(storeId) ?? []
        group.push({ product, size: item.size, quantity: item.quantity })
        groupedByStore.set(storeId, group)
    }

    const orders = await Promise.all(
        [...groupedByStore].map(([storeId, group]) => {
            const items = group.map(({ product, size, quantity }) => ({
                product: product._id,
                name: product.name,
                price: product.price,
                size,
                quantity,
                image: product.image
            }))
            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

            return Order.create({
                customer: customerId,
                store: storeId,
                items,
                total,
                paymentMethod: data.paymentMethod,
                address: {
                    label: address.label,
                    fullAddress: address.fullAddress,
                    building: address.building,
                    floor: address.floor,
                    apartment: address.apartment,
                    notes: address.notes,
                    lat: address.lat,
                    lng: address.lng
                }
            })
        })
    )

    return orders
}

export const getOwnOrdersFeature = async (customerId: string) => {
    const orders = await Order.find({ customer: customerId }).sort({ createdAt: -1 }).populate('store', 'name logo')
    return orders
}

export const getStoreOrdersFeature = async (ownerId: string) => {
    const stores = await Store.find({ owner: ownerId }).select('_id')
    const storeIds = stores.map((store) => store._id)
    const orders = await Order.find({ store: { $in: storeIds } })
        .sort({ createdAt: -1 })
        .populate('store', 'name logo')
        .populate('customer', 'name lastName phoneNumber')
    return orders
}

export const updateOrderStatusFeature = async (
    ownerId: string,
    orderId: string,
    data: { status: 'accepted' | 'rejected' | 'delivered', rejectionReason?: string }
) => {
    const order = await Order.findById(orderId)
    if (!order) throw new Error('Order not found')

    const store = await Store.findById(order.store)
    if (!store) throw new Error('Store not found')
    if (store.owner.toString() !== ownerId) throw new Error('Not authorized to update this order')

    if (data.status === 'delivered' && order.status !== 'accepted') {
        throw new Error('Only accepted orders can be marked delivered')
    }
    if ((data.status === 'accepted' || data.status === 'rejected') && order.status !== 'pending') {
        throw new Error('This order has already been handled')
    }

    if (data.status === 'accepted') {
        await deductStockForOrder(order)
    }

    order.status = data.status
    if (data.status === 'rejected') {
        order.rejectionReason = data.rejectionReason
    }
    await order.save()
    return order
}

const deductStockForOrder = async (order: { items: { product: Types.ObjectId, size: string, quantity: number }[] }) => {
    const needed = new Map<string, { productId: string, size: string, amount: number }>()
    for (const item of order.items) {
        const productId = item.product.toString()
        const key = `${productId}:${item.size}`
        const entry = needed.get(key) ?? { productId, size: item.size, amount: 0 }
        entry.amount += item.quantity
        needed.set(key, entry)
    }

    const entries = [...needed.values()]

    // conditional update: only succeeds if enough stock is still there in this size,
    // so two owners accepting at once can't push a size below zero
    const results = await Promise.all(
        entries.map(({ productId, size, amount }) =>
            Product.findOneAndUpdate(
                { _id: productId, sizes: { $elemMatch: { size, quantity: { $gte: amount } } } },
                { $inc: { 'sizes.$.quantity': -amount, quantity: -amount } },
                { returnDocument: 'after' }
            )
        )
    )

    const failedIndex = results.indexOf(null)
    if (failedIndex !== -1) {
        await Promise.all(
            entries
                .filter((_, i) => results[i])
                .map((done) =>
                    Product.updateOne(
                        { _id: done.productId, 'sizes.size': done.size },
                        { $inc: { 'sizes.$.quantity': done.amount, quantity: done.amount }, $set: { stock: 'in_stock' } }
                    )
                )
        )
        const { productId, size } = entries[failedIndex]
        const product = await Product.findById(productId)
        if (!product) throw new Error('A product in this order no longer exists')
        const left = product.sizes.find((s) => s.size === size)?.quantity ?? 0
        throw new Error(`Not enough stock for ${product.name} in size ${size} — only ${left} left`)
    }

    await Promise.all(
        results
            .filter((updated) => updated && updated.quantity <= 0 && updated.stock !== 'out_of_stock')
            .map((updated) =>
                Product.updateOne({ _id: updated!._id, quantity: { $lte: 0 } }, { $set: { stock: 'out_of_stock' } })
            )
    )
}
