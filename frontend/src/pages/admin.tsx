import { Button, IconButton, TextField, Typography, Tab, Tabs } from '@mui/material'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import styles from '../css/admin.module.css'

interface StoreOwner {
    _id: string
    name: string
    lastName: string
    phoneNumber: string
    email?: string
}

interface StoreOwnerData {
    name: string
    lastName: string
    phoneNumber: string
    email?: string
    password: string
}

function authHeaders() {
    const token = localStorage.getItem('token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

async function fetchStoreOwners(): Promise<StoreOwner[]> {
    const response = await fetch('http://localhost:3000/admin/store-owners', { headers: authHeaders() })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body.message || `Request failed (${response.status})`)
    }
    return Array.isArray(body) ? body : []
}

async function fetchUsers(): Promise<StoreOwner[]> {
    const response = await fetch('http://localhost:3000/admin/users', { headers: authHeaders() })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body.message || `Request failed (${response.status})`)
    }
    return Array.isArray(body) ? body : []
}

export default function Admin() {
    const [tab, setTab] = useState(0)

    const [name, setName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const storeOwnersQuery = useQuery({ queryKey: ['storeOwners'], queryFn: fetchStoreOwners })
    const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers, enabled: tab === 1 })

    const storeOwners = storeOwnersQuery.data ?? []
    const users = usersQuery.data ?? []

    const createStoreOwner = useMutation({
        mutationFn: async (data: StoreOwnerData) => {
            const response = await fetch('http://localhost:3000/admin/store-owner', {
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
        onSuccess: () => storeOwnersQuery.refetch()
    })

    const deleteStoreOwner = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`http://localhost:3000/admin/store-owner/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            })
            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.message || `Request failed (${response.status})`)
            }
            return body
        },
        onSuccess: () => storeOwnersQuery.refetch()
    })

    function handleCreateStoreOwner() {
        createStoreOwner.mutate({ name, lastName, phoneNumber, email, password })
    }

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.topBarRow}>
                    <div className={styles.backButtonSlot} />
                    <Typography variant="h4" className={styles.heading}>Admin Dashboard</Typography>
                    <div className={styles.topBarSpacer}>
                        <IconButton component={Link} to="/account" aria-label="Account" className={styles.accountButton}>
                            <AccountCircleIcon fontSize="large" />
                        </IconButton>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
            <Tabs value={tab} onChange={(_, val) => setTab(val)} className={styles.tabs}>
                <Tab label="Store Owners" />
                <Tab label="Users" />
            </Tabs>

            {tab === 0 && (
                <div>
                    <Typography variant="h6" className={styles.sectionTitle}>Create Store Owner</Typography>
                    <div className={styles.form}>
                        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                        <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        <TextField label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                        <TextField label="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            helperText="At least 8 characters, with an uppercase letter, a lowercase letter, a number and a symbol"
                        />
                        <Button variant="contained" onClick={handleCreateStoreOwner} disabled={createStoreOwner.isPending}>
                            {createStoreOwner.isPending ? 'Creating...' : 'Create Store Owner'}
                        </Button>
                        {createStoreOwner.isSuccess && <p className={styles.success}>{createStoreOwner.data.message}</p>}
                        {createStoreOwner.isError && <p className={styles.error}>{(createStoreOwner.error as Error).message}</p>}
                    </div>

                    <Typography variant="h6" className={styles.sectionTitle}>All Store Owners</Typography>
                    <div className={styles.list}>
                        {storeOwnersQuery.isLoading && <Typography color="text.secondary">Loading...</Typography>}
                        {storeOwnersQuery.isError && <Typography color="error">{(storeOwnersQuery.error as Error).message}</Typography>}
                        {!storeOwnersQuery.isLoading && !storeOwnersQuery.isError && storeOwners.length === 0 && (
                            <Typography color="text.secondary">No store owners yet.</Typography>
                        )}
                        {storeOwners.map((storeOwner) => (
                            <div key={storeOwner._id} className={styles.row}>
                                <Typography>{storeOwner.name} {storeOwner.lastName} — {storeOwner.phoneNumber}</Typography>
                                <Button color="error" onClick={() => deleteStoreOwner.mutate(storeOwner._id)}>Delete</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 1 && (
                <div>
                    <Typography variant="h6" className={styles.sectionTitle}>All Users</Typography>
                    <div className={styles.list}>
                        {usersQuery.isLoading && <Typography color="text.secondary">Loading...</Typography>}
                        {usersQuery.isError && <Typography color="error">{(usersQuery.error as Error).message}</Typography>}
                        {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && (
                            <Typography color="text.secondary">No users yet.</Typography>
                        )}
                        {users.map((user) => (
                            <div key={user._id} className={styles.userRow}>
                                <Typography>{user.name} {user.lastName} — {user.phoneNumber}</Typography>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            </div>
        </div>
    )
}
