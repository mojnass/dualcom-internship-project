import { useState } from 'react'
import {
    Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Paper, Tab, Tabs, TextField, Typography
} from '@mui/material'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PlaceIcon from '@mui/icons-material/Place'
import PersonIcon from '@mui/icons-material/Person'
import BackButton from '../components/backButton'
import styles from '../css/storeOrders.module.css'

type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'delivered'

interface OrderItem {
    product: string
    name: string
    price: number
    size: string
    quantity: number
    image?: string
}

interface StoreOrder {
    _id: string
    store: { _id: string, name: string } | null
    customer: { _id: string, name: string, lastName: string, phoneNumber: string } | null
    items: OrderItem[]
    total: number
    paymentMethod: 'cash' | 'card'
    address: {
        label: string
        fullAddress: string
        building?: string
        floor?: string
        apartment?: string
        notes?: string
        lat: number
        lng: number
    }
    status: OrderStatus
    rejectionReason?: string
    createdAt: string
}

const statusLabels: Record<OrderStatus, string> = {
    pending: 'New',
    accepted: 'Accepted',
    rejected: 'Rejected',
    delivered: 'Delivered'
}

function authHeaders() {
    const token = localStorage.getItem('token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

async function fetchStoreOrders(): Promise<StoreOrder[]> {
    const response = await fetch('http://localhost:3000/order/store', { headers: authHeaders() })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body.message || `Request failed (${response.status})`)
    }
    return Array.isArray(body) ? body : []
}

export default function StoreOrders() {
    const queryClient = useQueryClient()
    const [tab, setTab] = useState(0)
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    const ordersQuery = useQuery({ queryKey: ['storeOrders'], queryFn: fetchStoreOrders })
    const orders = ordersQuery.data ?? []

    const updateStatus = useMutation({
        mutationFn: async (data: { id: string, status: OrderStatus, rejectionReason?: string }) => {
            const response = await fetch(`http://localhost:3000/order/${data.id}/status`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ status: data.status, rejectionReason: data.rejectionReason })
            })
            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.message || `Request failed (${response.status})`)
            }
            return body
        },
        onSuccess: () => {
            setRejectingId(null)
            setRejectionReason('')
            queryClient.invalidateQueries({ queryKey: ['storeOrders'] })
        }
    })

    const pending = orders.filter((order) => order.status === 'pending')
    const active = orders.filter((order) => order.status === 'accepted')
    const past = orders.filter((order) => order.status === 'rejected' || order.status === 'delivered')
    const shown = [pending, active, past][tab] ?? []

    function confirmReject() {
        if (!rejectingId) return
        updateStatus.mutate({
            id: rejectingId,
            status: 'rejected',
            rejectionReason: rejectionReason.trim() || undefined
        })
    }

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.topBarRow}>
                    <div className={styles.backButtonSlot}>
                        <BackButton to="/store-owner" label="My Stores" />
                    </div>
                    <Typography variant="h4" className={styles.pageTitle}>Orders</Typography>
                    <div className={styles.topBarSpacer}>
                        <IconButton component={Link} to="/account" aria-label="Account" className={styles.accountButton}>
                            <AccountCircleIcon fontSize="large" />
                        </IconButton>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <Tabs value={tab} onChange={(_, val) => setTab(val)} className={styles.tabs}>
                    <Tab label={`New (${pending.length})`} />
                    <Tab label={`Accepted (${active.length})`} />
                    <Tab label={`Past (${past.length})`} />
                </Tabs>

                {ordersQuery.isLoading && <Typography className={styles.muted}>Loading orders...</Typography>}
                {ordersQuery.isError && (
                    <Typography className={styles.error}>{(ordersQuery.error as Error).message}</Typography>
                )}
                {updateStatus.isError && (
                    <Typography className={styles.error}>{(updateStatus.error as Error).message}</Typography>
                )}

                {!ordersQuery.isLoading && !ordersQuery.isError && shown.length === 0 && (
                    <div className={styles.emptyState}>
                        <ReceiptLongIcon className={styles.emptyIcon} />
                        <Typography variant="h6">No orders here</Typography>
                        <Typography className={styles.muted}>
                            {tab === 0 ? 'New orders from customers will appear here.' : 'Nothing in this list yet.'}
                        </Typography>
                    </div>
                )}

                <div className={styles.list}>
                    {shown.map((order) => (
                        <Paper elevation={0} key={order._id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <div>
                                    <Typography className={styles.storeName}>{order.store?.name ?? 'Store'}</Typography>
                                    <Typography className={styles.orderDate}>
                                        {new Date(order.createdAt).toLocaleString()}
                                    </Typography>
                                </div>
                                <Chip
                                    size="small"
                                    label={statusLabels[order.status]}
                                    className={styles[`status_${order.status}`]}
                                />
                            </div>

                            <div className={styles.customerRow}>
                                <PersonIcon fontSize="small" className={styles.rowIcon} />
                                <Typography className={styles.customerText}>
                                    {order.customer ? `${order.customer.name} ${order.customer.lastName}` : 'Customer'}
                                    {order.customer?.phoneNumber && ` · ${order.customer.phoneNumber}`}
                                </Typography>
                            </div>

                            <div className={styles.customerRow}>
                                <PlaceIcon fontSize="small" className={styles.rowIcon} />
                                <div className={styles.addressText}>
                                    <Typography className={styles.customerText}>
                                        {order.address.label} — {order.address.fullAddress}
                                    </Typography>
                                    {(order.address.building || order.address.floor || order.address.apartment) && (
                                        <Typography className={styles.addressDetail}>
                                            {[
                                                order.address.building && `Building: ${order.address.building}`,
                                                order.address.floor && `Floor: ${order.address.floor}`,
                                                order.address.apartment && `Unit: ${order.address.apartment}`
                                            ].filter(Boolean).join(' · ')}
                                        </Typography>
                                    )}
                                    {order.address.notes && (
                                        <Typography className={styles.addressDetail}>Note: {order.address.notes}</Typography>
                                    )}
                                    <a
                                        className={styles.mapLink}
                                        href={`https://www.google.com/maps/search/?api=1&query=${order.address.lat},${order.address.lng}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Open in Google Maps
                                    </a>
                                </div>
                            </div>

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
                                                Size: <strong>{item.size}</strong> · Qty {item.quantity}
                                            </Typography>
                                        </div>
                                        <Typography className={styles.itemPrice}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </div>
                                ))}
                            </div>

                            {order.status === 'rejected' && order.rejectionReason && (
                                <Typography className={styles.rejectionReason}>
                                    Reason given: {order.rejectionReason}
                                </Typography>
                            )}

                            <div className={styles.orderFooter}>
                                <Typography className={styles.footerDetail}>
                                    {order.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                                </Typography>
                                <Typography className={styles.orderTotal}>${order.total.toFixed(2)}</Typography>
                            </div>

                            {order.status === 'pending' && (
                                <div className={styles.actions}>
                                    <Button
                                        variant="contained"
                                        disabled={updateStatus.isPending}
                                        onClick={() => updateStatus.mutate({ id: order._id, status: 'accepted' })}
                                    >
                                        Accept Order
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        disabled={updateStatus.isPending}
                                        onClick={() => setRejectingId(order._id)}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            )}

                            {order.status === 'accepted' && (
                                <div className={styles.actions}>
                                    <Button
                                        variant="contained"
                                        disabled={updateStatus.isPending}
                                        onClick={() => updateStatus.mutate({ id: order._id, status: 'delivered' })}
                                    >
                                        Mark as Delivered
                                    </Button>
                                </div>
                            )}
                        </Paper>
                    ))}
                </div>
            </div>

            <Dialog open={rejectingId !== null} onClose={() => setRejectingId(null)} fullWidth maxWidth="xs">
                <DialogTitle>Reject Order</DialogTitle>
                <DialogContent className={styles.dialogContent}>
                    <Typography className={styles.muted}>
                        Let the customer know why — for example if the size they chose is unavailable.
                    </Typography>
                    <TextField
                        label="Reason (optional)"
                        placeholder="Size M is out of stock"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        multiline
                        minRows={2}
                        fullWidth
                        autoComplete="off"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectingId(null)} disabled={updateStatus.isPending}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={confirmReject} disabled={updateStatus.isPending}>
                        {updateStatus.isPending ? 'Rejecting...' : 'Reject Order'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
