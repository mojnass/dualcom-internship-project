import { useEffect, useState } from 'react'
import { Button, Paper, Radio, Typography } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import PaymentsIcon from '@mui/icons-material/Payments'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import PlaceIcon from '@mui/icons-material/Place'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import BackButton from '../components/backButton'
import CardPaymentDialog from '../components/cardPaymentDialog'
import type { Product } from '../components/productCard'
import type { Store } from '../components/storeCard'
import { getCart, clearCart, type CartItem } from '../lib/cart'
import { getSizeLabel } from '../lib/sizes'
import styles from '../css/checkout.module.css'

type PaymentMethod = 'cash' | 'card'

interface Address {
    _id: string
    label: string
    fullAddress: string
    building?: string
    floor?: string
    apartment?: string
}

function authHeaders() {
    const token = localStorage.getItem('token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

async function fetchJson<T>(url: string, withAuth = false): Promise<T> {
    const response = await fetch(url, withAuth ? { headers: authHeaders() } : undefined)
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body.message || `Request failed (${response.status})`)
    }
    return body
}

export default function Checkout() {
    const navigate = useNavigate()
    const [cartItems, setCartItems] = useState<CartItem[]>(() => getCart())
    const [addressId, setAddressId] = useState<string | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
    const [cardDialogOpen, setCardDialogOpen] = useState(false)

    useEffect(() => {
        function handleCartUpdated() {
            setCartItems(getCart())
        }
        window.addEventListener('cart-updated', handleCartUpdated)
        return () => window.removeEventListener('cart-updated', handleCartUpdated)
    }, [])

    const productsQuery = useQuery({ queryKey: ['allProducts'], queryFn: () => fetchJson<Product[]>('http://localhost:3000/product') })
    const storesQuery = useQuery({ queryKey: ['stores'], queryFn: () => fetchJson<Store[]>('http://localhost:3000/store') })
    const addressesQuery = useQuery({ queryKey: ['myAddresses'], queryFn: () => fetchJson<Address[]>('http://localhost:3000/address/me', true) })

    const products = productsQuery.data ?? []
    const stores = storesQuery.data ?? []
    const addresses = addressesQuery.data ?? []

    const selectedAddressId = addressId ?? addresses[0]?._id ?? null

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

    const total = resolvedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const itemCount = resolvedItems.reduce((sum, item) => sum + item.quantity, 0)

    const placeOrder = useMutation({
        mutationFn: async () => {
            const response = await fetch('http://localhost:3000/order', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    items: resolvedItems.map((item) => ({
                        product: item.productId,
                        size: item.size,
                        quantity: item.quantity
                    })),
                    paymentMethod,
                    addressId: selectedAddressId
                })
            })
            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.message || `Request failed (${response.status})`)
            }
            return body
        },
        onSuccess: () => {
            setCardDialogOpen(false)
            clearCart()
            navigate('/orders')
        }
    })

    function handlePlaceOrder() {
        if (paymentMethod === 'card') {
            setCardDialogOpen(true)
            return
        }
        placeOrder.mutate()
    }

    let placeOrderLabel = 'Place Order'
    if (placeOrder.isPending) {
        placeOrderLabel = 'Placing Order...'
    } else if (paymentMethod === 'card') {
        placeOrderLabel = 'Continue to Payment'
    }

    const isLoading = productsQuery.isLoading || storesQuery.isLoading || addressesQuery.isLoading
    const canPlaceOrder = resolvedItems.length > 0 && Boolean(selectedAddressId) && !placeOrder.isPending

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.topBarRow}>
                    <div className={styles.backButtonSlot}>
                        <BackButton to="/cart" label="Cart" />
                    </div>
                    <Typography variant="h4" className={styles.pageTitle}>Checkout</Typography>
                    <div className={styles.topBarSpacer} />
                </div>
            </div>

            <div className={styles.content}>
                {isLoading && <Typography className={styles.muted}>Loading checkout...</Typography>}

                {!isLoading && resolvedItems.length === 0 && (
                    <div className={styles.emptyState}>
                        <Typography variant="h6">Your cart is empty</Typography>
                        <Button variant="contained" component={Link} to="/home">Browse Stores</Button>
                    </div>
                )}

                {!isLoading && resolvedItems.length > 0 && (
                    <div className={styles.layout}>
                        <div className={styles.mainColumn}>
                            <Paper elevation={0} className={styles.section}>
                                <Typography variant="h6" className={styles.sectionTitle}>Delivery Address</Typography>

                                {addresses.length === 0 ? (
                                    <div className={styles.noAddress}>
                                        <Typography className={styles.muted}>
                                            You have no saved addresses. Add one to continue.
                                        </Typography>
                                        <Button variant="outlined" component={Link} to="/address?from=checkout">
                                            Add Address
                                        </Button>
                                    </div>
                                ) : (
                                    <div className={styles.addressList}>
                                        {addresses.map((address) => (
                                            <button
                                                type="button"
                                                key={address._id}
                                                className={selectedAddressId === address._id ? styles.addressCardActive : styles.addressCard}
                                                onClick={() => setAddressId(address._id)}
                                            >
                                                <Radio checked={selectedAddressId === address._id} size="small" />
                                                <PlaceIcon className={styles.addressIcon} />
                                                <div className={styles.addressText}>
                                                    <Typography className={styles.addressLabel}>{address.label}</Typography>
                                                    <Typography className={styles.addressDetail}>{address.fullAddress}</Typography>
                                                    {(address.building || address.floor || address.apartment) && (
                                                        <Typography className={styles.addressDetail}>
                                                            {[
                                                                address.building && `Building: ${address.building}`,
                                                                address.floor && `Floor: ${address.floor}`,
                                                                address.apartment && `Unit: ${address.apartment}`
                                                            ].filter(Boolean).join(' · ')}
                                                        </Typography>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </Paper>

                            <Paper elevation={0} className={styles.section}>
                                <Typography variant="h6" className={styles.sectionTitle}>Payment Method</Typography>
                                <div className={styles.paymentList}>
                                    <button
                                        type="button"
                                        className={paymentMethod === 'cash' ? styles.paymentCardActive : styles.paymentCard}
                                        onClick={() => setPaymentMethod('cash')}
                                    >
                                        <Radio checked={paymentMethod === 'cash'} size="small" />
                                        <PaymentsIcon className={styles.paymentIcon} />
                                        <div className={styles.paymentText}>
                                            <Typography className={styles.paymentLabel}>Cash on Delivery</Typography>
                                            <Typography className={styles.paymentDetail}>
                                                Pay the driver when your order arrives
                                            </Typography>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        className={paymentMethod === 'card' ? styles.paymentCardActive : styles.paymentCard}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <Radio checked={paymentMethod === 'card'} size="small" />
                                        <CreditCardIcon className={styles.paymentIcon} />
                                        <div className={styles.paymentText}>
                                            <Typography className={styles.paymentLabel}>Pay by Card</Typography>
                                            <Typography className={styles.paymentDetail}>
                                                Enter your card details to pay now
                                            </Typography>
                                        </div>
                                    </button>
                                </div>
                            </Paper>

                            <Paper elevation={0} className={styles.section}>
                                <Typography variant="h6" className={styles.sectionTitle}>Your Order</Typography>
                                {Array.from(groupedByStore.entries()).map(([storeId, items]) => {
                                    const store = stores.find((s) => s._id === storeId)
                                    return (
                                        <div key={storeId} className={styles.storeGroup}>
                                            <Typography className={styles.storeName}>{store?.name ?? 'Store'}</Typography>
                                            {items.map((item) => (
                                                <div key={`${item.productId}-${item.size}`} className={styles.orderRow}>
                                                    {item.product.image ? (
                                                        <img src={item.product.image} alt={item.product.name} className={styles.thumb} />
                                                    ) : (
                                                        <div className={styles.thumbPlaceholder}>
                                                            <Inventory2Icon fontSize="small" />
                                                        </div>
                                                    )}
                                                    <div className={styles.orderInfo}>
                                                        <Typography className={styles.orderName}>{item.product.name}</Typography>
                                                        <Typography className={styles.orderDetail}>
                                                            {getSizeLabel(item.product.category)}: {item.size} · Qty {item.quantity}
                                                        </Typography>
                                                    </div>
                                                    <Typography className={styles.orderPrice}>
                                                        ${(item.product.price * item.quantity).toFixed(2)}
                                                    </Typography>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })}
                            </Paper>
                        </div>

                        <div className={styles.summaryColumn}>
                            <Paper elevation={0} className={styles.summary}>
                                <Typography variant="h6" className={styles.sectionTitle}>Order Summary</Typography>
                                <div className={styles.summaryRow}>
                                    <Typography className={styles.muted}>Items ({itemCount})</Typography>
                                    <Typography>${total.toFixed(2)}</Typography>
                                </div>
                                <div className={styles.summaryRow}>
                                    <Typography className={styles.muted}>Delivery</Typography>
                                    <Typography className={styles.muted}>Paid on arrival</Typography>
                                </div>
                                <div className={styles.summaryRow}>
                                    <Typography className={styles.muted}>Payment</Typography>
                                    <Typography>{paymentMethod === 'cash' ? 'Cash' : 'Card'}</Typography>
                                </div>

                                <div className={styles.divider} />

                                <div className={styles.totalRow}>
                                    <Typography className={styles.totalLabel}>Total</Typography>
                                    <Typography className={styles.totalValue}>${total.toFixed(2)}</Typography>
                                </div>

                                {groupedByStore.size > 1 && (
                                    <Typography className={styles.note}>
                                        Your items come from {groupedByStore.size} stores, so they will be placed as
                                        separate orders.
                                    </Typography>
                                )}

                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={!canPlaceOrder}
                                    onClick={handlePlaceOrder}
                                    className={styles.placeButton}
                                >
                                    {placeOrderLabel}
                                </Button>
                                {!selectedAddressId && (
                                    <Typography className={styles.hint}>Select a delivery address to continue</Typography>
                                )}
                                {placeOrder.isError && (
                                    <Typography className={styles.error}>{(placeOrder.error as Error).message}</Typography>
                                )}
                            </Paper>
                        </div>
                    </div>
                )}
            </div>

            <CardPaymentDialog
                open={cardDialogOpen}
                amount={total}
                submitting={placeOrder.isPending}
                onClose={() => setCardDialogOpen(false)}
                onConfirm={() => placeOrder.mutate()}
            />
        </div>
    )
}
