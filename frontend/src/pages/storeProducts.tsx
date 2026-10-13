import { Autocomplete, Button, Chip, MenuItem, Paper, TextField, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import BackButton from '../components/backButton'
import ImageUploader from '../components/imageUploader'
import { getSizesForCategory, getSizeLabel } from '../lib/sizes'
import styles from '../css/storeProducts.module.css'

const categoryOptions = ['Shirts', 'Long Sleeves', 'Footwear', 'Headwear', 'Pants', 'Accessories', 'Socks', 'Jackets', 'Hoodies', 'Coats', 'Suits']

interface Product {
    _id: string
    name: string
    description: string
    price: number
    category: string
    gender: 'men' | 'women'
    sizes: SizeStock[]
    quantity: number
    stock: 'in_stock' | 'out_of_stock'
    image?: string
    store: string
}

interface SizeStock {
    size: string
    quantity: number
}

interface ProductData {
    name: string
    description: string
    price: number
    category: string
    gender: 'men' | 'women'
    sizes: SizeStock[]
    image?: string
}

function authHeaders() {
    const token = localStorage.getItem('token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

async function fetchAllProducts(): Promise<Product[]> {
    const response = await fetch('http://localhost:3000/product', { headers: authHeaders() })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body.message || `Request failed (${response.status})`)
    }
    return Array.isArray(body) ? body : []
}

export default function StoreProducts() {
    const { storeId } = useParams()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [category, setCategory] = useState('')
    const [gender, setGender] = useState<'men' | 'women'>('men')
    const [sizeStock, setSizeStock] = useState<Record<string, string>>({})
    const [image, setImage] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)

    const productsQuery = useQuery({ queryKey: ['products'], queryFn: fetchAllProducts })
    const products = (productsQuery.data ?? []).filter((product) => product.store === storeId)
    const sizeOptions = getSizesForCategory(category)

    function clearForm() {
        setName('')
        setDescription('')
        setPrice('')
        setCategory('')
        setGender('men')
        setSizeStock({})
        setImage('')
        setEditingId(null)
    }

    const createProduct = useMutation({
        mutationFn: async (data: ProductData) => {
            const response = await fetch(`http://localhost:3000/product/${storeId}`, {
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
            productsQuery.refetch()
        }
    })

    const updateProduct = useMutation({
        mutationFn: async (data: ProductData & { id: string }) => {
            const response = await fetch(`http://localhost:3000/product/${data.id}`, {
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
            productsQuery.refetch()
        }
    })

    const deleteProduct = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`http://localhost:3000/product/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            })
            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.message || `Request failed (${response.status})`)
            }
            return body
        },
        onSuccess: () => productsQuery.refetch()
    })

    function startEdit(product: Product) {
        setEditingId(product._id)
        setName(product.name)
        setDescription(product.description)
        setPrice(String(product.price))
        setCategory(product.category)
        setGender(product.gender)
        setSizeStock(Object.fromEntries((product.sizes ?? []).map((s) => [s.size, String(s.quantity)])))
        setImage(product.image ?? '')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function handleSubmit() {
        const data = {
            name,
            description,
            price: Number(price),
            category,
            gender,
            sizes: sizeOptions.map((size) => ({ size, quantity: Number(sizeStock[size] || 0) })),
            image: image || undefined
        }
        if (editingId) {
            updateProduct.mutate({ ...data, id: editingId })
        } else {
            createProduct.mutate(data)
        }
    }

    const submitting = createProduct.isPending || updateProduct.isPending

    let submitLabel = 'Create Product'
    if (submitting) {
        submitLabel = 'Saving...'
    } else if (editingId) {
        submitLabel = 'Save Changes'
    }

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.topBarRow}>
                    <div className={styles.backButtonSlot}>
                        <BackButton to="/store-owner" label="My Stores" />
                    </div>
                    <Typography variant="h4" className={styles.pageTitle}>Store Products</Typography>
                    <div className={styles.topBarSpacer} />
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.layout}>
                    <Paper elevation={0} className={styles.formCard}>
                        <Typography variant="h6" className={styles.sectionTitle}>
                            {editingId ? 'Edit Product' : 'Create Product'}
                        </Typography>
                        <div className={styles.form}>
                            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                            <TextField
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                multiline
                                minRows={2}
                            />
                            <TextField label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                            <Autocomplete
                                freeSolo
                                options={categoryOptions}
                                value={category}
                                onInputChange={(_, value) => setCategory(value)}
                                renderInput={(params) => <TextField {...params} label="Category" />}
                            />
                            <TextField
                                select
                                label="Gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value as 'men' | 'women')}
                            >
                                <MenuItem value="men">Men</MenuItem>
                                <MenuItem value="women">Women</MenuItem>
                            </TextField>
                            <div>
                                <Typography className={styles.uploadLabel}>Stock per {getSizeLabel(category).toLowerCase()}</Typography>
                            </div>
                            <div className={styles.sizeGrid}>
                                {sizeOptions.map((size) => (
                                    <TextField
                                        key={size}
                                        label={size}
                                        type="number"
                                        size="small"
                                        value={sizeStock[size] ?? ''}
                                        placeholder="0"
                                        onChange={(e) => setSizeStock((current) => ({ ...current, [size]: e.target.value }))}
                                        slotProps={{ htmlInput: { min: 0 }, inputLabel: { shrink: true } }}
                                    />
                                ))}
                            </div>
                            <Typography className={styles.uploadLabel}>Product image</Typography>
                            <ImageUploader key={editingId ?? 'new'} value={image || undefined} onChange={setImage} />
                            <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                                {submitLabel}
                            </Button>
                            {editingId && <Button onClick={clearForm} disabled={submitting}>Cancel</Button>}
                            {createProduct.isError && <p className={styles.error}>{(createProduct.error as Error).message}</p>}
                            {updateProduct.isError && <p className={styles.error}>{(updateProduct.error as Error).message}</p>}
                        </div>
                    </Paper>

                    <div className={styles.productsColumn}>
                        <Typography variant="h6" className={styles.sectionTitle}>
                            All Products ({products.length})
                        </Typography>

                        {productsQuery.isLoading && <Typography className={styles.muted}>Loading...</Typography>}
                        {productsQuery.isError && (
                            <Typography color="error">{(productsQuery.error as Error).message}</Typography>
                        )}
                        {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 && (
                            <div className={styles.emptyState}>
                                <Inventory2Icon className={styles.emptyIcon} />
                                <Typography variant="h6">No products yet</Typography>
                                <Typography className={styles.muted}>Add your first product using the form.</Typography>
                            </div>
                        )}

                        <div className={styles.grid}>
                            {products.map((product) => (
                                <Paper
                                    elevation={0}
                                    key={product._id}
                                    className={editingId === product._id ? styles.productCardActive : styles.productCard}
                                >
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className={styles.image} />
                                    ) : (
                                        <div className={styles.imagePlaceholder}>
                                            <Inventory2Icon />
                                        </div>
                                    )}

                                    <div className={styles.cardBody}>
                                        <Typography className={styles.productName}>{product.name}</Typography>
                                        <Typography className={styles.price}>${product.price}</Typography>
                                        <div className={styles.chips}>
                                            <Chip size="small" label={product.category} className={styles.chip} />
                                            <Chip
                                                size="small"
                                                label={product.gender === 'men' ? 'Men' : 'Women'}
                                                className={styles.chip}
                                            />
                                            <Chip
                                                size="small"
                                                label={product.quantity > 0 ? `${product.quantity} in stock` : 'Out of Stock'}
                                                className={product.quantity > 0 ? styles.inStock : styles.outOfStock}
                                            />
                                        </div>
                                        {product.sizes?.length > 0 && (
                                            <Typography variant="body2" className={styles.sizeBreakdown}>
                                                {product.sizes.map((s) => `${s.size}: ${s.quantity}`).join(' · ')}
                                            </Typography>
                                        )}
                                    </div>

                                    <div className={styles.cardActions}>
                                        <Button size="small" onClick={() => startEdit(product)}>Edit</Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => deleteProduct.mutate(product._id)}
                                            disabled={deleteProduct.isPending}
                                        >
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
