import { useEffect, useState } from 'react'
import { Autocomplete, Button, TextField, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import type { LatLngLiteral, LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import BackButton from '../components/backButton'
import styles from '../css/myAddress.module.css'

const pinIcon = L.divIcon({
    className: styles.pinIcon,
    html: `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26s16-15 16-26C32 7.163 24.837 0 16 0z" fill="#d32f2f"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
    </svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42]
})

const defaultCenter: LatLngLiteral = { lat: 33.8938, lng: 35.5018 }

const labelOptions = ['Home', 'Work', 'Parents', 'Friend', 'Gym', 'Other']

type PickMode = 'current' | 'search' | 'manual'

interface Address {
    _id: string
    label: string
    fullAddress: string
    building?: string
    floor?: string
    apartment?: string
    notes?: string
    lat: number
    lng: number
}

function authHeaders() {
    const token = localStorage.getItem('token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

async function fetchMyAddresses(): Promise<Address[]> {
    const response = await fetch('http://localhost:3000/address/me', { headers: authHeaders() })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body.message || `Request failed (${response.status})`)
    }
    return Array.isArray(body) ? body : []
}

interface SearchResult {
    display_name: string
    lat: string
    lon: string
}

async function searchAddress(query: string): Promise<SearchResult[]> {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    )
    if (!response.ok) return []
    return response.json()
}

function MapClickHandler({ enabled, onPick }: { readonly enabled: boolean; readonly onPick: (pos: LatLngLiteral) => void }) {
    useMapEvents({
        click(e: LeafletMouseEvent) {
            if (!enabled) return
            onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
        }
    })
    return null
}

export default function MyAddress() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const cameFromCheckout = searchParams.get('from') === 'checkout'
    const addressesQuery = useQuery({ queryKey: ['myAddresses'], queryFn: fetchMyAddresses })
    const addresses = addressesQuery.data ?? []

    const [mode, setMode] = useState<PickMode>('search')
    const [label, setLabel] = useState('')
    const [fullAddress, setFullAddress] = useState('')
    const [building, setBuilding] = useState('')
    const [floor, setFloor] = useState('')
    const [apartment, setApartment] = useState('')
    const [notes, setNotes] = useState('')
    const [position, setPosition] = useState<LatLngLiteral>(defaultCenter)
    const [locating, setLocating] = useState(false)
    const [locateError, setLocateError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [searching, setSearching] = useState(false)

    const createAddress = useMutation({
        mutationFn: async (data: {
            label: string
            fullAddress: string
            building?: string
            floor?: string
            apartment?: string
            notes?: string
            lat: number
            lng: number
        }) => {
            const response = await fetch('http://localhost:3000/address', {
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
            setLabel('')
            setFullAddress('')
            setBuilding('')
            setFloor('')
            setApartment('')
            setNotes('')
            setSearchQuery('')
            setSearchResults([])
            setPosition(defaultCenter)
            queryClient.invalidateQueries({ queryKey: ['myAddresses'] })
            if (cameFromCheckout) {
                navigate('/checkout')
            }
        }
    })

    const deleteAddress = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`http://localhost:3000/address/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            })
            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.message || `Request failed (${response.status})`)
            }
            return body
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myAddresses'] })
    })

    function handlePick(next: LatLngLiteral) {
        setPosition(next)
    }

    function locateCurrentPosition() {
        setLocateError('')
        if (!navigator.geolocation) {
            setLocateError('Geolocation is not supported by your browser')
            return
        }
        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                handlePick({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                setLocating(false)
            },
            () => {
                setLocateError('Could not get your location. Please allow location access or pick manually.')
                setLocating(false)
            }
        )
    }

    async function handleSearch() {
        if (!searchQuery.trim()) return
        setSearching(true)
        const results = await searchAddress(searchQuery)
        setSearchResults(results)
        setSearching(false)
    }

    function pickSearchResult(result: SearchResult) {
        const next = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }
        setPosition(next)
        setSearchResults([])
        setSearchQuery(result.display_name)
    }

    function handleModeChange(_: unknown, next: PickMode | null) {
        if (!next) return
        setMode(next)
        setLocateError('')
        if (next === 'current') {
            locateCurrentPosition()
        }
    }

    function handleSubmit() {
        createAddress.mutate({
            label,
            fullAddress,
            building: building || undefined,
            floor: floor || undefined,
            apartment: apartment || undefined,
            notes: notes || undefined,
            lat: position.lat,
            lng: position.lng
        })
    }

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.topBarRow}>
                    <div className={styles.backButtonSlot}>
                        <BackButton
                            to={cameFromCheckout ? '/checkout' : undefined}
                            label={cameFromCheckout ? 'Checkout' : undefined}
                        />
                    </div>
                    <Typography variant="h4" className={styles.pageTitle}>My Address</Typography>
                    <div className={styles.topBarSpacer} />
                </div>
            </div>

            <div className={styles.content}>
            <Typography variant="h6" className={styles.sectionTitle}>Add Address</Typography>
            <div className={styles.form}>
                <Autocomplete
                    freeSolo
                    options={labelOptions}
                    value={label}
                    onInputChange={(_, value) => setLabel(value)}
                    renderInput={(params) => <TextField {...params} label="Name (e.g. Home)" autoComplete="off" />}
                />

                <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={handleModeChange}
                    fullWidth
                    color="primary"
                >
                    <ToggleButton value="current">Use Current Location</ToggleButton>
                    <ToggleButton value="search">Search Address</ToggleButton>
                    <ToggleButton value="manual">Pick on Map</ToggleButton>
                </ToggleButtonGroup>

                {mode === 'current' && (
                    <>
                        {locating && <Typography color="text.secondary">Getting your location...</Typography>}
                        {locateError && <Typography color="error">{locateError}</Typography>}
                        <Button variant="outlined" onClick={locateCurrentPosition} disabled={locating}>
                            Refresh Location
                        </Button>
                    </>
                )}

                {mode === 'search' && (
                    <div className={styles.searchBox}>
                        <TextField
                            label="Search address"
                            autoComplete="off"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch() } }}
                        />
                        <Button variant="outlined" onClick={handleSearch} disabled={searching}>
                            {searching ? 'Searching...' : 'Search'}
                        </Button>
                        {searchResults.length > 0 && (
                            <div className={styles.searchResults}>
                                {searchResults.map((result) => (
                                    <button
                                        key={`${result.lat}-${result.lon}`}
                                        type="button"
                                        className={styles.searchResultItem}
                                        onClick={() => pickSearchResult(result)}
                                    >
                                        {result.display_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {mode === 'manual' && (
                    <Typography color="text.secondary">Click on the map to set your location.</Typography>
                )}

                <div className={styles.map}>
                    <MapContainer center={position} zoom={15} className={styles.mapContainer}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapRecenter position={position} />
                        <MapClickHandler enabled={mode === 'manual'} onPick={handlePick} />
                        <Marker position={position} icon={pinIcon} />
                    </MapContainer>
                </div>

                <TextField label="Full address" autoComplete="off" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} />
                <TextField label="Building name (optional)" autoComplete="off" value={building} onChange={(e) => setBuilding(e.target.value)} />
                <TextField label="Floor (optional)" autoComplete="off" value={floor} onChange={(e) => setFloor(e.target.value)} />
                <TextField label="Apartment / Unit (optional)" autoComplete="off" value={apartment} onChange={(e) => setApartment(e.target.value)} />
                <TextField label="Notes (optional)" autoComplete="off" value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={2} />

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={createAddress.isPending || !label || !fullAddress}
                >
                    {createAddress.isPending ? 'Saving...' : 'Save Address'}
                </Button>
                {createAddress.isError && <p className={styles.error}>{(createAddress.error as Error).message}</p>}
            </div>

            <Typography variant="h6" className={styles.sectionTitle}>Saved Addresses</Typography>
            <div className={styles.list}>
                {addressesQuery.isLoading && <Typography color="text.secondary">Loading...</Typography>}
                {addressesQuery.isError && <Typography color="error">{(addressesQuery.error as Error).message}</Typography>}
                {!addressesQuery.isLoading && !addressesQuery.isError && addresses.length === 0 && (
                    <Typography color="text.secondary">You have no saved addresses yet.</Typography>
                )}
                {addresses.map((address) => (
                    <div key={address._id} className={styles.row}>
                        <div>
                            <Typography>{address.label} — {address.fullAddress}</Typography>
                            {(address.building || address.floor || address.apartment) && (
                                <Typography variant="body2" color="text.secondary">
                                    {[
                                        address.building && `Building: ${address.building}`,
                                        address.floor && `Floor: ${address.floor}`,
                                        address.apartment && `Unit: ${address.apartment}`
                                    ].filter(Boolean).join(' · ')}
                                </Typography>
                            )}
                        </div>
                        <Button color="error" onClick={() => deleteAddress.mutate(address._id)} disabled={deleteAddress.isPending}>
                            Delete
                        </Button>
                    </div>
                ))}
            </div>
            </div>
        </div>
    )
}

function MapRecenter({ position }: { readonly position: LatLngLiteral }) {
    const map = useMap()
    useEffect(() => {
        map.setView(position)
    }, [map, position])
    return null
}
