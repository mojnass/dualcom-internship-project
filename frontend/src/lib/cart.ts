export interface CartItem {
    productId: string
    size: string
    quantity: number
}

const CART_KEY = 'cart'

function readCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(CART_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

function writeCart(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event('cart-updated'))
}

export function getCart(): CartItem[] {
    return readCart()
}

export function addToCart(productId: string, size: string, quantity = 1): void {
    const items = readCart()
    const existing = items.find((item) => item.productId === productId && item.size === size)
    if (existing) {
        existing.quantity += quantity
    } else {
        items.push({ productId, size, quantity })
    }
    writeCart(items)
}

export function updateCartItemQuantity(productId: string, size: string, quantity: number): void {
    const items = readCart()
    const existing = items.find((item) => item.productId === productId && item.size === size)
    if (!existing) return
    if (quantity <= 0) {
        writeCart(items.filter((item) => item !== existing))
        return
    }
    existing.quantity = quantity
    writeCart(items)
}

export function removeFromCart(productId: string, size: string): void {
    const items = readCart().filter((item) => !(item.productId === productId && item.size === size))
    writeCart(items)
}

export function clearCart(): void {
    writeCart([])
}

export function getCartCount(): number {
    return readCart().reduce((sum, item) => sum + item.quantity, 0)
}
