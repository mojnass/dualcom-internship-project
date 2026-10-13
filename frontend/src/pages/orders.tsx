import { Button, Chip, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import BackButton from '../components/backButton'
import styles from '../css/orders.module.css'

interface OrderItem {
    product: string
    name: string
    price: number
    size: string
    quantity: number
    image?: string
}

interface Order {
    _id: string
    store: { _id: string, name: string, logo?: string } | null
    items: OrderItem[]
    total: number
    paymentMethod: 'cash' | 'card'
    address: { label: string, fullAddress: string }
    status: 'pending' | 'accepted' | 'rejected' | 'delivered'
    rejectionReason?: string
    createdAt: string
}

const statusLabels: Record<Order['status'], string> = {
    pending: 'Awaiting Store',
    accepted: 'Accepted',
    rejected: 'Rejected',
    delivered: 'Delivered'
}

async function fetchMyOrders(): Promise<Order[]> {
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:3000/order/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body.message || `Request failed (${response.status})`)
    }
    return Array.isArray(body) ? body : []
}

function statusClass(status: Order['status']) {
    if (status === 'accepted' || status === 'delivered') return styles.statusSuccess
    if (status === 'rejected') return styles.statusError
    return styles.statusPending
}

export default function Orders() {
    const ordersQuery = useQuery({ queryKey: ['myOrders'], queryFn: fetchMyOrders })
    const orders = ordersQuery.data ?? []

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.topBarRow}>
                    <div className={styles.backButtonSlot}>
                        <BackButton />
                    </div>
                    <Typography variant="h4" className={styles.pageTitle}>My Orders</Typography>
                    <div className={styles.topBarSpacer} />
                </div>
            </div>

            <div className={styles.content}>
                {ordersQuery.isLoading && <Typography className={styles.muted}>Loading orders...</Typography>}
                {ordersQuery.isError && (
                    <Typography className={styles.error}>{(ordersQuery.error as Error).message}</Typography>
                )}

                {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 && (
                    <div className={styles.emptyState}>
                        <ReceiptLongIcon className={styles.emptyIcon} />
                        <Typography variant="h6">No orders yet</Typography>
                        <Typography className={styles.muted}>Your orders will appear here once you place one.</Typography>
                        <Button variant="contained" component={Link} to="/home" className={styles.browseButton}>
                            Browse Stores
                        </Button>
                    </div>
                )}

                <div className={styles.list}>
                    {orders.map((order) => (
                        <Paper elevation={0} key={order._id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <div className={styles.orderHeaderLeft}>
                                    <Typography className={styles.storeName}>{order.store?.name ?? 'Store'}</Typography>
                                    <Typography className={styles.orderDate}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </Typography>
                                </div>
                                <Chip size="small" label={statusLabels[order.status]} className={statusClass(order.status)} />
                            </div>

                            {order.status === 'rejected' && order.rejectionReason && (
                                <Typography className={styles.rejectionReason}>
                                    Reason: {order.rejectionReason}
                                </Typography>
                            )}

                            <div className={styles.items}>
                                {order.items.map((item) => (
                                    <div key={`${item.product}-${item.size}`} className={styles.itemRow}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className={styles.thumb} />
                                        ) : (
                                            <div className={styles.thumbPlaceholder}>
                                                <Inventory2Icon fontSize="small" />
                                            </div>
                                        )}
                                        <div className={styles.itemInfo}>
                                            <Typography className={styles.itemName}>{item.name}</Typography>
                                            <Typography className={styles.itemDetail}>
                                                Size: {item.size} · Qty {item.quantity}
                                            </Typography>
                                        </div>
                                        <Typography className={styles.itemPrice}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.orderFooter}>
                                <Typography className={styles.footerDetail}>
                                    {order.paymentMethod === 'cash' ? 'Cash' : 'Card'} · {order.address.label}
                                </Typography>
                                <Typography className={styles.orderTotal}>${order.total.toFixed(2)}</Typography>
                            </div>
                        </Paper>
                    ))}
                </div>
            </div>
        </div>
    )
}
