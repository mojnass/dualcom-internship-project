import { Badge, Button, IconButton, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PlaceIcon from '@mui/icons-material/Place'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TuneIcon from '@mui/icons-material/Tune'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LoginIcon from '@mui/icons-material/Login'
import { useEffect, useState } from 'react'
import StoreCard, { type Store } from '../components/storeCard'
import Search from '../components/search'
import { isSignedIn } from '../lib/auth'
import { getCartCount } from '../lib/cart'
import styles from '../css/home.module.css'

async function fetchStores(): Promise<Store[]> {
    const response = await fetch('http://localhost:3000/store')
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || `Request failed (${response.status})`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
}

export default function Home() {
    const [query, setQuery] = useState('')
    const signedIn = isSignedIn()
    const [cartCount, setCartCount] = useState(() => getCartCount())
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem('sidebarCollapsed') === 'true'
        } catch {
            return false
        }
    })

    useEffect(() => {
        try {
            localStorage.setItem('sidebarCollapsed', String(collapsed))
        } catch {
            // storage can be blocked; the sidebar still works, it just won't remember
        }
    }, [collapsed])

    useEffect(() => {
        function handleCartUpdated() {
            setCartCount(getCartCount())
        }
        window.addEventListener('cart-updated', handleCartUpdated)
        return () => window.removeEventListener('cart-updated', handleCartUpdated)
    }, [])

    const storesQuery = useQuery({ queryKey: ['stores'], queryFn: fetchStores })
    const stores = storesQuery.data ?? []
    const filtered = query
        ? stores.filter((store) =>
              [store.name, store.location, store.category]
                  .join(' ')
                  .toLowerCase()
                  .includes(query.toLowerCase()),
          )
        : stores

    return (
        <div className={styles.page}>
            <Paper elevation={0} className={styles.panel}>
                <Paper elevation={0} className={collapsed ? styles.sidebarCollapsed : styles.sidebar}>
                    <IconButton
                        onClick={() => setCollapsed((c) => !c)}
                        className={styles.toggleButton}
                        aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
                        title={collapsed ? 'Expand menu' : 'Collapse menu'}
                    >
                        {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>

                    {signedIn ? (
                        <>
                            <SidebarItem icon={<AccountCircleIcon />} label="Account" to="/account" collapsed={collapsed} />
                            <SidebarItem
                                icon={(
                                    <Badge badgeContent={cartCount} color="error">
                                        <ShoppingCartIcon />
                                    </Badge>
                                )}
                                label="Shopping Cart"
                                to="/cart"
                                collapsed={collapsed}
                            />
                        </>
                    ) : (
                        <>
                            <SidebarItem icon={<LoginIcon />} label="Log In" to="/login" collapsed={collapsed} />
                            <SidebarItem icon={<PersonAddIcon />} label="Sign Up" to="/register" collapsed={collapsed} />
                        </>
                    )}
                    <div className={styles.spacer} />
                    {signedIn && <SidebarItem icon={<ReceiptLongIcon />} label="My Orders" to="/orders" collapsed={collapsed} />}
                    <SidebarItem icon={<PlaceIcon />} label="My Address" to="/address" collapsed={collapsed} />
                </Paper>

                <div className={styles.content}>
                    <div className={styles.toolbar}>
                        <Button
                            component={Link}
                            to="/filter-search"
                            variant="outlined"
                            startIcon={<TuneIcon />}
                            className={styles.filterButton}
                        >
                            Filter Search
                        </Button>
                        <Search value={query} onChange={setQuery} />
                    </div>

                    {storesQuery.isLoading && <Typography className={styles.muted}>Loading stores...</Typography>}
                    {storesQuery.isError && (
                        <Typography color="error">{(storesQuery.error as Error).message}</Typography>
                    )}
                    {!storesQuery.isLoading && !storesQuery.isError && filtered.length === 0 && (
                        <Typography className={styles.muted}>No stores found.</Typography>
                    )}
                    <div className={styles.storeGrid}>
                        {filtered.map((store) => (
                            <StoreCard key={store._id} store={store} />
                        ))}
                    </div>
                </div>
            </Paper>
        </div>
    )
}

function SidebarItem({
    icon,
    label,
    to,
    collapsed,
}: {
    readonly icon: React.ReactNode
    readonly label: string
    readonly to: string
    readonly collapsed?: boolean
}) {
    return (
        <Button
            component={Link}
            to={to}
            aria-label={label}
            title={collapsed ? label : undefined}
            startIcon={collapsed ? undefined : icon}
            fullWidth
            className={collapsed ? styles.sidebarItemCollapsed : styles.sidebarItem}
        >
            {collapsed ? icon : label}
        </Button>
    )
}
