import { Chip, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import StorefrontIcon from '@mui/icons-material/Storefront'
import styles from '../css/storeCard.module.css'

export interface Store {
    readonly _id: string
    readonly name: string
    readonly location: string
    readonly category: string
    readonly logo?: string
}

export default function StoreCard({ store }: { readonly store: Store }) {
    return (
        <Paper component={Link} to={`/store/${store._id}`} elevation={0} className={styles.card}>
            <div className={styles.logoHalf}>
                {store.logo ? (
                    <img src={store.logo} alt={store.name} className={styles.logo} />
                ) : (
                    <div className={styles.logoPlaceholder}>
                        <StorefrontIcon />
                    </div>
                )}
            </div>
            <div className={styles.infoHalf}>
                <Typography variant="h6" className={styles.name}>{store.name}</Typography>
                <Typography className={styles.text}>{store.location}</Typography>
                <div className={styles.chipSlot}>
                    <Chip label={store.category} size="small" className={styles.chip} />
                </div>
            </div>
        </Paper>
    )
}
