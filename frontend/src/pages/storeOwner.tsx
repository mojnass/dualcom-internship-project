import { Button, Chip, IconButton, MenuItem, Paper, TextField, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import ImageUploader from '../components/imageUploader'
import styles from '../css/storeOwner.module.css'

type StoreCategory = 'men' | 'women' | 'men & women'

const categoryLabels: Record<StoreCategory, string> = {
    men: 'Men',
    women: 'Women',
    'men & women': 'Men & Women'
}

interface Store {
    _id: string
    name: string
    location?: string
    category: StoreCategory
    logo?: string
}

interface StoreData {
    name: string
    location?: string
    category: StoreCategory
    logo?: string
}

function authHeaders() {
    const token = localStorage.getItem('token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

async function fetchMyStores(): Promise<Store[]> {
    const response = await fetch('http://localhost:3000/store-owner/me/stores', { headers: authHeaders() })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body.message || `Request failed (${response.status})`)
    }
    return Array.isArray(body) ? body : []
}

export default function StoreOwner() {
    const [name, setName] = useState('')
    const [location, setLocation] = useState('')
    const [category, setCategory] = useState<StoreCategory>('men & women')
    const [logo, setLogo] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)

    const storesQuery = useQuery({ queryKey: ['myStores'], queryFn: fetchMyStores })
    const stores = storesQuery.data ?? []

    function clearForm() {
        setName('')
        setLocation('')
        setCategory('men & women')
        setLogo('')
        setEditingId(null)
    }

    const createStore = useMutation({
        mutationFn: async (data: StoreData) => {
            const response = await fetch('http://localhost:3000/store', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(data)
            })
            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.message || `Request failed (${response.status})`)
            }
            return body
        },
        onSuccess: () => {
            clearForm()
            storesQuery.refetch()
        }
    })

    const updateStore = useMutation({
        mutationFn: async (data: StoreData & { id: string }) => {
            const response = await fetch(`http://localhost:3000/store/${data.id}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(data)
            })
            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.message || `Request failed (${response.status})`)
            }
            return body
        },
        onSuccess: () => {
            clearForm()
            storesQuery.refetch()
        }
    })

    const deleteStore = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`http://localhost:3000/store/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            })
            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.message || `Request failed (${response.status})`)
            }
            return body
        },
        onSuccess: () => storesQuery.refetch()
    })

    function startEdit(store: Store) {
        setEditingId(store._id)
        setName(store.name)
        setLocation(store.location ?? '')
        setCategory(store.category)
        setLogo(store.logo ?? '')
    }

    function handleSubmit() {
        const data = {
            name,
            location: location || undefined,
            category,
            logo: logo || undefined
        }
        if (editingId) {
            updateStore.mutate({ ...data, id: editingId })
        } else {
            createStore.mutate(data)
        }
    }

    const submitting = createStore.isPending || updateStore.isPending

    let submitLabel = 'Create Store'
    if (submitting) {
        submitLabel = 'Saving...'
    } else if (editingId) {
        submitLabel = 'Save Changes'
    }

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.topBarRow}>
                    <div className={styles.backButtonSlot} />
                    <Typography variant="h4" className={styles.heading}>My Stores</Typography>
                    <div className={styles.topBarSpacer}>
                        <IconButton component={Link} to="/account" aria-label="Account" className={styles.accountButton}>
                            <AccountCircleIcon fontSize="large" />
                        </IconButton>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <Button
                    component={Link}
                    to="/store-owner/orders"
                    variant="contained"
                    startIcon={<ReceiptLongIcon />}
                    className={styles.ordersButton}
                >
                    View Orders
                </Button>

                <div className={styles.layout}>
                    <Paper elevation={0} className={styles.formCard}>
                        <Typography variant="h6" className={styles.sectionTitle}>
                            {editingId ? 'Edit Store' : 'Create Store'}
                        </Typography>
                        <div className={styles.form}>
                            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                            <TextField label="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
                            <TextField
                                select
                                label="Category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value as StoreCategory)}
                            >
                                <MenuItem value="men">Men</MenuItem>
                                <MenuItem value="women">Women</MenuItem>
                                <MenuItem value="men & women">Men &amp; Women</MenuItem>
                            </TextField>
                            <Typography className={styles.uploadLabel}>Store logo</Typography>
                            <ImageUploader key={editingId ?? 'new'} value={logo || undefined} onChange={setLogo} />
                            <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                                {submitLabel}
                            </Button>
                            {editingId && <Button onClick={clearForm} disabled={submitting}>Cancel</Button>}
                            {createStore.isError && <p className={styles.error}>{(createStore.error as Error).message}</p>}
                            {updateStore.isError && <p className={styles.error}>{(updateStore.error as Error).message}</p>}
                        </div>
                    </Paper>

                    <div className={styles.storesColumn}>
                        <Typography variant="h6" className={styles.sectionTitle}>All My Stores</Typography>

                        {storesQuery.isLoading && <Typography className={styles.muted}>Loading...</Typography>}
                        {storesQuery.isError && <Typography color="error">{(storesQuery.error as Error).message}</Typography>}
                        {!storesQuery.isLoading && !storesQuery.isError && stores.length === 0 && (
                            <div className={styles.emptyState}>
                                <StorefrontIcon className={styles.emptyIcon} />
                                <Typography variant="h6">No stores yet</Typography>
                                <Typography className={styles.muted}>Create your first store to start selling.</Typography>
                            </div>
                        )}

                        <div className={styles.list}>
                            {stores.map((store) => (
                                <Paper elevation={0} key={store._id} className={styles.storeCard}>
                                    <div className={styles.storeMain}>
                                        {store.logo ? (
                                            <img src={store.logo} alt={store.name} className={styles.storeLogo} />
                                        ) : (
                                            <div className={styles.storeLogoPlaceholder}>
                                                <StorefrontIcon />
                                            </div>
                                        )}
                                        <div className={styles.storeInfo}>
                                            <Typography className={styles.storeName}>{store.name}</Typography>
                                            <Typography className={styles.storeLocation}>
                                                {store.location ?? 'No location set'}
                                            </Typography>
                                            <Chip size="small" label={categoryLabels[store.category]} className={styles.chip} />
                                        </div>
                                    </div>
                                    <div className={styles.actions}>
                                        <Button
                                            variant="outlined"
                                            component={Link}
                                            to={`/store-owner/store/${store._id}/products`}
                                        >
                                            Manage Products
                                        </Button>
                                        <Button onClick={() => startEdit(store)}>Edit</Button>
                                        <Button color="error" onClick={() => deleteStore.mutate(store._id)} disabled={deleteStore.isPending}>
                                            Delete
                                        </Button>
                                    </div>
                                </Paper>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
