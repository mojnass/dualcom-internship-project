import { useState } from 'react'
import { Alert, Button, Chip, IconButton, Snackbar, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import BackButton from '../components/backButton'
import type { Product } from '../components/productCard'
import { addToCart } from '../lib/cart'
import { isSignedIn } from '../lib/auth'
import { getSizeLabel, getStockForSize } from '../lib/sizes'
import styles from '../css/productPage.module.css'

async function fetchProduct(id: string): Promise<Product> {
    const response = await fetch(`http://localhost:3000/product/${id}`)
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || `Request failed (${response.status})`)
    }
    return response.json()
}

export default function ProductPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const signedIn = isSignedIn()
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [confirmOpen, setConfirmOpen] = useState(false)

    const productQuery = useQuery({
        queryKey: ['product', id],
        queryFn: () => fetchProduct(id as string),
        enabled: Boolean(id),
    })
    const product = productQuery.data
    const outOfStock = (product?.quantity ?? 0) <= 0
    const available = product && selectedSize ? getStockForSize(product, selectedSize) : 0
    const sizeOptions = product?.sizes ?? []
    const sizeLabel = product ? getSizeLabel(product.category) : 'Size'

    function toggleSize(size: string) {
        if (selectedSize === size) {
            setSelectedSize(null)
            return
        }
        setSelectedSize(size)
        const stock = product ? getStockForSize(product, size) : 0
        setQuantity((q) => Math.max(1, Math.min(q, stock)))
    }

    function handleAddToCart() {
        if (!signedIn) {
            navigate('/login')
            return
        }
        if (!product || !selectedSize) return
        addToCart(product._id, selectedSize, quantity)
        setConfirmOpen(true)
    }

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.topBarRow}>
                    <div className={styles.backButtonSlot}>
                        <BackButton to={product ? `/store/${product.store}` : undefined} label="Store" />
                    </div>
                    <Typography variant="h4" className={styles.pageTitle}>{product?.name ?? 'Product'}</Typography>
                    <div className={styles.topBarSpacer} />
                </div>
            </div>

            {productQuery.isLoading && <Typography className={styles.muted}>Loading product...</Typography>}
            {productQuery.isError && <Typography color="error">{(productQuery.error as Error).message}</Typography>}

            {product && (
                <div className={styles.content}>
                    <div className={styles.imageColumn}>
                        {product.image ? (
                            <img src={product.image} alt={product.name} className={styles.image} />
                        ) : (
                            <div className={styles.imagePlaceholder}>
                                <Inventory2Icon fontSize="large" />
                            </div>
                        )}
                    </div>

                    <div className={styles.detailsColumn}>
                        <Typography variant="h5" className={styles.name}>{product.name}</Typography>
                        <Typography variant="h4" className={styles.price}>${product.price}</Typography>

                        <div className={styles.meta}>
                            <Chip label={product.category} size="small" className={styles.chip} />
                            <Chip label={product.gender === 'men' ? 'Men' : 'Women'} size="small" className={styles.chip} />
                            <Chip
                                label={outOfStock ? 'Out of Stock' : 'In Stock'}
                                size="small"
                                className={outOfStock ? styles.outOfStock : styles.inStock}
                            />
                        </div>

                        <Typography className={styles.description}>{product.description}</Typography>

                        <div className={styles.section}>
                            <Typography className={styles.sectionLabel}>{sizeLabel}</Typography>
                            <div className={styles.sizeRow}>
                                {sizeOptions.map(({ size, quantity: sizeStock }) => {
                                    let chipClass = styles.sizeChip
                                    if (sizeStock <= 0) chipClass = styles.sizeChipSoldOut
                                    else if (selectedSize === size) chipClass = styles.sizeChipActive
                                    return (
                                        <Chip
                                            key={size}
                                            label={size}
                                            onClick={() => toggleSize(size)}
                                            disabled={sizeStock <= 0}
                                            className={chipClass}
                                        />
                                    )
                                })}
                            </div>
                            {selectedSize && available > 0 && available <= 3 && (
                                <Typography variant="body2" className={styles.hint}>
                                    Only {available} left in {selectedSize}
                                </Typography>
                            )}
                        </div>

                        <div className={styles.section}>
                            <Typography className={styles.sectionLabel}>Quantity</Typography>
                            <div className={styles.quantityRow}>
                                <IconButton
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                    className={styles.quantityButton}
                                >
                                    <RemoveIcon />
                                </IconButton>
                                <Typography className={styles.quantityValue}>{quantity}</Typography>
                                <IconButton
                                    onClick={() => setQuantity((q) => Math.min(available, q + 1))}
                                    disabled={quantity >= available}
                                    className={styles.quantityButton}
                                >
                                    <AddIcon />
                                </IconButton>
                            </div>
                            {selectedSize && quantity >= available && (
                                <Typography variant="body2" className={styles.hint}>No more in stock</Typography>
                            )}
                        </div>

                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<ShoppingCartIcon />}
                            className={styles.addButton}
                            disabled={outOfStock || (signedIn && !selectedSize)}
                            onClick={handleAddToCart}
                        >
                            {outOfStock ? 'Out of Stock' : signedIn ? 'Add to Cart' : 'Log in to Add to Cart'}
                        </Button>
                        {signedIn && !outOfStock && !selectedSize && (
                            <Typography variant="body2" className={styles.hint}>Select a size to continue</Typography>
                        )}
                    </div>
                </div>
            )}

            <Snackbar
                open={confirmOpen}
                autoHideDuration={3000}
                onClose={() => setConfirmOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" variant="filled" onClose={() => setConfirmOpen(false)}>
                    Added {quantity} × {sizeLabel} {selectedSize} to your cart
                </Alert>
            </Snackbar>
        </div>
    )
}
