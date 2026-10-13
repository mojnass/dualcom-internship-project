import { Button, Chip, Paper, Slider, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import BackButton from '../components/backButton'
import Search from '../components/search'
import ProductCard, { type Product } from '../components/productCard'
import styles from '../css/filterSearch.module.css'
import productCardStyles from '../css/productCard.module.css'

type GenderFilter = 'all' | 'men' | 'women'

interface AppliedFilters {
    gender: GenderFilter
    category: string | null
    priceRange: [number, number] | null
}

const categoryOptions = ['Shirts', 'Long Sleeves', 'Footwear', 'Headwear', 'Pants', 'Accessories', 'Socks', 'Jackets', 'Hoodies', 'Coats', 'Suits']

async function fetchAllProducts(): Promise<Product[]> {
    const response = await fetch('http://localhost:3000/product')
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || `Request failed (${response.status})`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
}

export default function FilterSearch() {
    const [query, setQuery] = useState('')

    const productsQuery = useQuery({ queryKey: ['allProducts'], queryFn: fetchAllProducts })
    const allProducts = productsQuery.data ?? []

    const priceBounds = useMemo<[number, number]>(() => {
        if (!productsQuery.data || productsQuery.data.length === 0) return [0, 100]
        const prices = productsQuery.data.map((product) => product.price)
        return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
    }, [productsQuery.data])

    // Draft state: what the filter board controls show, not yet applied to results.
    const [draftGender, setDraftGender] = useState<GenderFilter>('all')
    const [draftCategory, setDraftCategory] = useState<string | null>(null)
    const [draftPriceRange, setDraftPriceRange] = useState<[number, number] | null>(null)
    const [draftMin, draftMax] = draftPriceRange ?? priceBounds

    // Applied state: what actually filters the product list below.
    const [applied, setApplied] = useState<AppliedFilters>({ gender: 'all', category: null, priceRange: null })
    const [appliedMin, appliedMax] = applied.priceRange ?? priceBounds

    const products = allProducts.filter((product) => {
        const matchesGender = applied.gender === 'all' || product.gender === applied.gender
        const matchesCategory = !applied.category || product.category === applied.category
        const matchesPrice = product.price >= appliedMin && product.price <= appliedMax
        const matchesQuery = query
            ? [product.name, product.description, product.category].join(' ').toLowerCase().includes(query.toLowerCase())
            : true
        return matchesGender && matchesCategory && matchesPrice && matchesQuery
    })

    function applyFilters() {
        setApplied({ gender: draftGender, category: draftCategory, priceRange: draftPriceRange })
    }

    function clearFilters() {
        setDraftGender('all')
        setDraftCategory(null)
        setDraftPriceRange(null)
        setApplied({ gender: 'all', category: null, priceRange: null })
    }

    const hasActiveFilters = applied.gender !== 'all' || applied.category !== null || applied.priceRange !== null
    const hasUnappliedChanges = draftGender !== applied.gender
        || draftCategory !== applied.category
        || draftMin !== appliedMin
        || draftMax !== appliedMax

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.topBarRow}>
                    <div className={styles.backButtonSlot}>
                        <BackButton />
                    </div>
                    <Typography variant="h4" className={styles.pageTitle}>Filter Search</Typography>
                    <div className={styles.topBarSpacer} />
                </div>
            </div>

            <div className={styles.content}>
            <Search value={query} onChange={setQuery} />

            <Paper elevation={0} className={styles.board}>
                <div className={styles.boardHeader}>
                    <Typography variant="h6">Filters</Typography>
                    {hasActiveFilters && (
                        <Button variant="outlined" size="small" onClick={clearFilters} className={styles.clearButton}>
                            Clear All
                        </Button>
                    )}
                </div>

                <div className={styles.filterSection}>
                    <Typography variant="subtitle2" className={styles.sectionLabel}>Gender</Typography>
                    <div className={styles.chipRow}>
                        <Chip
                            label="All"
                            size="small"
                            onClick={() => setDraftGender('all')}
                            className={draftGender === 'all' ? styles.chipActive : styles.chip}
                        />
                        <Chip
                            label="Men"
                            size="small"
                            onClick={() => setDraftGender('men')}
                            className={draftGender === 'men' ? styles.chipActive : styles.chip}
                        />
                        <Chip
                            label="Women"
                            size="small"
                            onClick={() => setDraftGender('women')}
                            className={draftGender === 'women' ? styles.chipActive : styles.chip}
                        />
                    </div>
                </div>

                <div className={styles.filterSection}>
                    <Typography variant="subtitle2" className={styles.sectionLabel}>Category</Typography>
                    <div className={styles.categoryGrid}>
                        <Chip
                            label="All Categories"
                            size="small"
                            onClick={() => setDraftCategory(null)}
                            className={!draftCategory ? styles.chipActive : styles.chip}
                        />
                        {categoryOptions.map((cat) => (
                            <Chip
                                key={cat}
                                label={cat}
                                size="small"
                                onClick={() => setDraftCategory(cat)}
                                className={draftCategory === cat ? styles.chipActive : styles.chip}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.filterSection}>
                    <Typography variant="subtitle2" className={styles.sectionLabel}>
                        Price Range (${draftMin} - ${draftMax})
                    </Typography>
                    <div className={styles.priceSlider}>
                        <Slider
                            value={[draftMin, draftMax]}
                            onChange={(_, value) => setDraftPriceRange(value as [number, number])}
                            min={priceBounds[0]}
                            max={priceBounds[1]}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `$${value}`}
                            disableSwap
                        />
                    </div>
                </div>

                <Button
                    variant="contained"
                    onClick={applyFilters}
                    disabled={!hasUnappliedChanges}
                    className={styles.applyButton}
                >
                    Apply Filters
                </Button>
            </Paper>

            {productsQuery.isLoading && <Typography className={styles.muted}>Loading products...</Typography>}
            {productsQuery.isError && <Typography color="error">{(productsQuery.error as Error).message}</Typography>}
            {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 && (
                <Typography className={styles.muted}>No products match your search.</Typography>
            )}
            {products.length > 0 && (
                <div className={productCardStyles.gridCompact}>
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
            </div>
        </div>
    )
}
