import { Chip, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import BackButton from '../components/backButton'
import type { Store } from '../components/storeCard'
import ProductCard, { type Product } from '../components/productCard'
import Search from '../components/search'
import styles from '../css/storePage.module.css'
import productCardStyles from '../css/productCard.module.css'

type GenderFilter = 'all' | 'men' | 'women'

async function fetchStore(id: string): Promise<Store> {
    const response = await fetch(`http://localhost:3000/store/${id}`)
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || `Request failed (${response.status})`)
    }
    return response.json()
}

async function fetchStoreProducts(id: string): Promise<Product[]> {
    const response = await fetch('http://localhost:3000/product')
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || `Request failed (${response.status})`)
    }
    const data = await response.json()
    const products: Product[] = Array.isArray(data) ? data : []
    return products.filter((product) => product.store === id)
}

export default function StorePage() {
    const { id } = useParams()
    const [query, setQuery] = useState('')
    const [gender, setGender] = useState<GenderFilter>('all')

    const storeQuery = useQuery({
        queryKey: ['store', id],
        queryFn: () => fetchStore(id as string),
        enabled: Boolean(id),
    })
    const store = storeQuery.data

    const productsQuery = useQuery({
        queryKey: ['storeProducts', id],
        queryFn: () => fetchStoreProducts(id as string),
        enabled: Boolean(id),
    })
    const allProducts = productsQuery.data ?? []
    const products = allProducts.filter((product) => {
        const matchesGender = gender === 'all' || product.gender === gender
        const matchesQuery = query
            ? [product.name, product.description, product.category].join(' ').toLowerCase().includes(query.toLowerCase())
            : true
        return matchesGender && matchesQuery
    })

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.topBarRow}>
                    <div className={styles.backButtonSlot}>
                        <BackButton />
                    </div>
                    <Typography variant="h4" className={styles.storeName}>{store?.name}</Typography>
                    <div className={styles.topBarSpacer} />
                </div>
                <div className={styles.filters}>
                    <Search value={query} onChange={setQuery} />
                    <div className={styles.genderFilters}>
                        <Chip
                            label="All"
                            size="small"
                            onClick={() => setGender('all')}
                            className={gender === 'all' ? styles.chipActive : styles.chip}
                        />
                        <Chip
                            label="Men"
                            size="small"
                            onClick={() => setGender('men')}
                            className={gender === 'men' ? styles.chipActive : styles.chip}
                        />
                        <Chip
                            label="Women"
                            size="small"
                            onClick={() => setGender('women')}
                            className={gender === 'women' ? styles.chipActive : styles.chip}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                {storeQuery.isLoading && <Typography className={styles.muted}>Loading store...</Typography>}
                {storeQuery.isError && <Typography color="error">{(storeQuery.error as Error).message}</Typography>}

                {store && (
                    <>
                        <Typography variant="h6" className={styles.productsTitle}>Products</Typography>

                        {productsQuery.isLoading && <Typography className={styles.muted}>Loading products...</Typography>}
                        {productsQuery.isError && <Typography color="error">{(productsQuery.error as Error).message}</Typography>}
                        {!productsQuery.isLoading && !productsQuery.isError && allProducts.length === 0 && (
                            <Typography className={styles.muted}>No products yet.</Typography>
                        )}
                        {!productsQuery.isLoading && !productsQuery.isError && allProducts.length > 0 && products.length === 0 && (
                            <Typography className={styles.muted}>No products match your search.</Typography>
                        )}
                        {products.length > 0 && (
                            <div className={productCardStyles.gridCompact}>
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
