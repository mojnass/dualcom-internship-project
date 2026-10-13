import { useEffect, useState } from 'react'
import { Button, IconButton, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import BackButton from '../components/backButton'
import type { Product } from '../components/productCard'
import type { Store } from '../components/storeCard'
import { getCart, updateCartItemQuantity, removeFromCart, type CartItem } from '../lib/cart'
import { getSizeLabel, getStockForSize } from '../lib/sizes'
import styles from '../css/cart.module.css'

async function fetchAllProducts(): Promise<Product[]> {
    const response = await fetch('http://localhost:3000/product')
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || `Request failed (${response.status})`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
}

async function fetchAllStores(): Promise<Store[]> {
    const response = await fetch('http://localhost:3000/store')
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || `Request failed (${response.status})`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
}

export default function Cart() {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => getCart())

    useEffect(() => {
        function handleCartUpdated() {
            setCartItems(getCart())
        }
        window.addEventListener('cart-updated', handleCartUpdated)
        return () => window.removeEventListener('cart-updated', handleCartUpdated)
    }, [])

    const productsQuery = useQuery({ queryKey: ['allProducts'], queryFn: fetchAllProducts })
    const storesQuery = useQuery({ queryKey: ['stores'], queryFn: fetchAllStores })

    const products = productsQuery.data ?? []
    const stores = storesQuery.data ?? []

    const resolvedItems = cartItems
        .map((item) => {
            const product = products.find((p) => p._id === item.productId)
            return product ? { ...item, product } : null
        })
        .filter((item): item is CartItem & { product: Product } => item !== null)

    const groupedByStore = new Map<string, (CartItem & { product: Product })[]>()
    for (const item of resolvedItems) {
        const group = groupedByStore.get(item.product.store) ?? []
        group.push(item)
        groupedByStore.set(item.product.store, group)
    }

    const itemCount = resolvedItems.reduce((sum, item) => sum + item.quantity, 0)
    const total = resolvedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const isLoading = productsQuery.isLoading || storesQuery.isLoading
    const isError = productsQuery.isError || storesQuery.isError
    const showEmpty = !isLoading && !isError && resolvedItems.length === 0

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.topBarRow}>
                    <div className={styles.backButtonSlot}>
                        <BackButton />
                    </div>
                    <Typography variant="h4" className={styles.pageTitle}>Shopping Cart</Typography>
                    <div className={styles.topBarSpacer} />
                </div>
            </div>

            <div className={styles.content}>
                {isLoading && <Typography className={styles.muted}>Loading cart...</Typography>}
                {isError && <Typography className={styles.error}>Failed to load cart items.</Typography>}

                {showEmpty && (
                    <div className={styles.emptyState}>
                        <ShoppingCartOutlinedIcon className={styles.emptyIcon} />
                        <Typography variant="h6" className={styles.emptyTitle}>
                            {cartItems.length > 0 ? 'These items are no longer available' : 'Your cart is empty'}
                        </Typography>
                        <Typography className={styles.muted}>
                            Browse the stores and add something you like.
                        </Typography>
                        <Button variant="contained" component={Link} to="/home" className={styles.browseButton}>
                            Browse Stores
                        </Button>
                    </div>
                )}

                {resolvedItems.length > 0 && (
                    <div className={styles.layout}>
                        <div className={styles.itemsColumn}>
                            {Array.from(groupedByStore.entries()).map(([storeId, items]) => {
                                const store = stores.find((s) => s._id === storeId)
                                return (
                                    <Paper elevation={0} key={storeId} className={styles.storeGroup}>
                                        <div className={styles.storeHeader}>
                                            {store?.logo ? (
                                                <img src={store.logo} alt={store.name} className={styles.storeLogo} />
                                            ) : (
                                                <div className={styles.storeLogoPlaceholder}>
                                                    <StorefrontIcon fontSize="small" />
                                                </div>
                                            )}
                                            <Typography className={styles.storeName}>{store?.name ?? 'Store'}</Typography>
                                            <Typography className={styles.storeCount}>
                                                {items.length} {items.length === 1 ? 'item' : 'items'}
                                            </Typography>
                                        </div>

                                        {items.map((item) => {
                                            const sizeStock = getStockForSize(item.product, item.size)
                                            let stockNote: string | null = null
                                            if (sizeStock <= 0) stockNote = `Size ${item.size} is out of stock`
                                            else if (item.quantity > sizeStock) stockNote = `Only ${sizeStock} left in size ${item.size}`
                                            else if (item.quantity === sizeStock) stockNote = 'No more in stock'
                                            return (
                                                <div key={`${item.productId}-${item.size}`} className={styles.row}>
                                                    <Link to={`/product/${item.productId}`} className={styles.imageLink}>
                                                        {item.product.image ? (
                                                            <img src={item.product.image} alt={item.product.name} className={styles.image} />
                                                        ) : (
                                                            <div className={styles.imagePlaceholder}>
                                                                <Inventory2Icon />
                                                            </div>
                                                        )}
                                                    </Link>

                                                    <div className={styles.info}>
                                                        <Link to={`/product/${item.productId}`} className={styles.nameLink}>
                                                            <Typography className={styles.name}>{item.product.name}</Typography>
                                                        </Link>
                                                        <Typography className={styles.details}>
                                                            {getSizeLabel(item.product.category)}: <strong>{item.size}</strong>
                                                        </Typography>
                                                        <Typography className={styles.unitPrice}>
                                                            ${item.product.price} each
                                                        </Typography>
                                                    </div>

                                                    <div className={styles.actions}>
                                                        <Typography className={styles.lineTotal}>
                                                            ${(item.product.price * item.quantity).toFixed(2)}
                                                        </Typography>
                                                        <div className={styles.actionsRow}>
                                                            <div className={styles.quantityControls}>
                                                                <IconButton
                                                                    size="small"
                                                                    className={styles.quantityButton}
                                                                    onClick={() => updateCartItemQuantity(item.productId, item.size, item.quantity - 1)}
                                                                >
                                                                    <RemoveIcon fontSize="small" />
                                                                </IconButton>
                                                                <Typography className={styles.quantityValue}>{item.quantity}</Typography>
                                                                <IconButton
                                                                    size="small"
                                                                    className={styles.quantityButton}
                                                                    disabled={item.quantity >= sizeStock}
                                                                    onClick={() => updateCartItemQuantity(item.productId, item.size, item.quantity + 1)}
                                                                >
                                                                    <AddIcon fontSize="small" />
                                                                </IconButton>
                                                            </div>
                                                            <IconButton
                                                                size="small"
                                                                className={styles.removeButton}
                                                                aria-label="Remove item"
                                                                onClick={() => removeFromCart(item.productId, item.size)}
                                                            >
                                                                <DeleteOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </div>
                                                        {stockNote && (
                                                            <Typography variant="body2" className={styles.stockLimitNote}>
                                                                {stockNote}
                                                            </Typography>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </Paper>
                                )
                            })}
                        </div>

                        <div className={styles.summaryColumn}>
                            <Paper elevation={0} className={styles.summary}>
                                <Typography variant="h6" className={styles.summaryTitle}>Order Summary</Typography>

                                <div className={styles.summaryRow}>
                                    <Typography className={styles.muted}>
                                        Items ({itemCount})
                                    </Typography>
                                    <Typography>${total.toFixed(2)}</Typography>
                                </div>
                                <div className={styles.summaryRow}>
                                    <Typography className={styles.muted}>Delivery</Typography>
                                    <Typography className={styles.muted}>Calculated at checkout</Typography>
                                </div>

                                <div className={styles.divider} />

                                <div className={styles.totalRow}>
                                    <Typography className={styles.totalLabel}>Total</Typography>
                                    <Typography className={styles.totalValue}>${total.toFixed(2)}</Typography>
                                </div>

                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    component={Link}
                                    to="/checkout"
                                    className={styles.checkoutButton}
                                >
                                    Checkout
                                </Button>
                                <Button component={Link} to="/home" className={styles.continueButton}>
                                    Continue Shopping
                                </Button>
                            </Paper>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
