export type Role = 'customer' | 'store_owner' | 'admin'

export function getToken(): string | null {
    const token = localStorage.getItem('token')
    return token && token !== 'undefined' && token !== 'null' ? token : null
}

export function getRole(): Role | null {
    const role = localStorage.getItem('role')
    if (role === 'customer' || role === 'store_owner' || role === 'admin') {
        return role
    }
    return null
}

export function isSignedIn(): boolean {
    return getToken() !== null
}

export function signOut(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
}
