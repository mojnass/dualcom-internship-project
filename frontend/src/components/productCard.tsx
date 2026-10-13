import { Chip, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import styles from '../css/productCard.module.css'

export interface SizeStock {
    readonly size: string
    readonly quantity: number
}

export interface Product {
    readonly _id: string
    readonly name: string
    readonly description: string
    readonly price: number
    readonly category: string
    readonly gender: 'men' | 'women'
    readonly sizes: readonly SizeStock[]
    readonly quantity: number
    readonly stock: 'in_stock' | 'out_of_stock'
    readonly image?: string
    readonly store: string
}

export default function ProductCard({ product }: { readonly product: Product }) {
    const soldOut = product.quantity <= 0

    return (
        <Link to={`/product/${product._id}`} className={styles.card}>
            <Paper elevation={0} className={styles.cardFront}>
                <div className={styles.imageWrap}>
                    {product.image ? (
                        <img src={product.image} alt={product.name} className={styles.image} />
                    ) : (
                        <div className={styles.imagePlaceholder}>
                            <Inventory2Icon fontSize="large" />
                        </div>
                    )}
                    <span className={soldOut ? styles.soldOutBadge : styles.inStockBadge}>
                        {soldOut ? 'Out of Stock' : 'In Stock'}
                    </span>
                </div>

                <div className={styles.body}>
                    <Typography className={styles.name}>{product.name}</Typography>
                    <Typography className={styles.price}>${product.price}</Typography>
                    <div className={styles.meta}>
                        <Chip label={product.category} size="small" className={styles.chip} />
                        <Chip label={product.gender === 'men' ? 'Men' : 'Women'} size="small" className={styles.chip} />
                    </div>
                </div>
            </Paper>
        </Link>
    )
}
