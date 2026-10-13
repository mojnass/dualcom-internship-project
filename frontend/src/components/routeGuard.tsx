import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getRole, isSignedIn } from '../lib/auth'

export function RequireAuth({ children }: { readonly children: ReactNode }) {
    if (!isSignedIn()) {
        return <Navigate to="/login" replace />
    }
    return <>{children}</>
}

export function RequireAdmin({ children }: { readonly children: ReactNode }) {
    if (!isSignedIn()) {
        return <Navigate to="/login" replace />
    }
    if (getRole() !== 'admin') {
        return <Navigate to="/home" replace />
    }
    return <>{children}</>
}

export function RequireStoreOwner({ children }: { readonly children: ReactNode }) {
    if (!isSignedIn()) {
        return <Navigate to="/login" replace />
    }
    if (getRole() !== 'store_owner') {
        return <Navigate to="/home" replace />
    }
    return <>{children}</>
}

export function CustomerOnly({ children }: { readonly children: ReactNode }) {
    if (getRole() === 'admin') {
        return <Navigate to="/admin" replace />
    }
    if (getRole() === 'store_owner') {
        return <Navigate to="/store-owner" replace />
    }
    return <>{children}</>
}
