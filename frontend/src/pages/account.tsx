import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/backButton'
import { signOut } from '../lib/auth'
import styles from '../css/account.module.css'

interface Profile {
    name: string
    lastName: string
    phoneNumber: string
    email?: string
}

function authHeaders() {
    const token = localStorage.getItem('token')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

async function fetchProfile(): Promise<Profile> {
    const response = await fetch('http://localhost:3000/user/me', { headers: authHeaders() })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body.message || `Request failed (${response.status})`)
    }
    return body
}

export default function Account() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false)

    const profileQuery = useQuery({ queryKey: ['myProfile'], queryFn: fetchProfile })

    const updateProfile = useMutation({
        mutationFn: async (data: { email: string }) => {
            const response = await fetch('http://localhost:3000/user/me', {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ email: data.email || undefined })
            })
            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.message || `Request failed (${response.status})`)
            }
            return body
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myProfile'] })
    })

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')

    const changePassword = useMutation({
        mutationFn: async () => {
            const response = await fetch('http://localhost:3000/user/me/password', {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ currentPassword, newPassword })
            })
            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.message || `Request failed (${response.status})`)
            }
            return body
        },
        onSuccess: () => {
            setCurrentPassword('')
            setNewPassword('')
        }
    })

    function handleLogout() {
        signOut()
        navigate('/')
    }

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.topBarRow}>
                    <div className={styles.backButtonSlot}>
                        <BackButton />
                    </div>
                    <Typography variant="h4" className={styles.pageTitle}>Account</Typography>
                    <div className={styles.topBarSpacer} />
                </div>
            </div>

            <div className={styles.content}>
                {profileQuery.isLoading && <Typography color="text.secondary">Loading...</Typography>}
                {profileQuery.isError && <Typography color="error">{(profileQuery.error as Error).message}</Typography>}

                {profileQuery.data && (
                    <>
                        <Typography variant="h6" className={styles.sectionTitle}>Profile</Typography>
                        <ProfileForm profile={profileQuery.data} onSave={(data) => updateProfile.mutate(data)} mutation={updateProfile} />

                        <Typography variant="h6" className={styles.sectionTitle}>Change Password</Typography>
                        <div className={styles.form}>
                            <TextField
                                label="Current Password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <TextField
                                label="New Password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                helperText="At least 8 characters, with an uppercase letter, a lowercase letter, a number and a symbol"
                            />
                            <Button
                                variant="contained"
                                onClick={() => changePassword.mutate()}
                                disabled={changePassword.isPending || !currentPassword || !newPassword}
                            >
                                {changePassword.isPending ? 'Updating...' : 'Change Password'}
                            </Button>
                            {changePassword.isSuccess && <p className={styles.success}>Password changed</p>}
                            {changePassword.isError && <p className={styles.error}>{(changePassword.error as Error).message}</p>}
                        </div>
                    </>
                )}

                <div className={styles.logoutSection}>
                    <Button variant="outlined" color="error" onClick={() => setConfirmLogoutOpen(true)}>
                        Log Out
                    </Button>
                </div>
            </div>

            <Dialog open={confirmLogoutOpen} onClose={() => setConfirmLogoutOpen(false)}>
                <DialogTitle>Log out</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to log out?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmLogoutOpen(false)}>Cancel</Button>
                    <Button color="error" onClick={handleLogout}>Log Out</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

function ProfileForm({
    profile,
    onSave,
    mutation
}: {
    readonly profile: Profile
    readonly onSave: (data: { email: string }) => void
    readonly mutation: UseMutationResult<unknown, Error, { email: string }>
}) {
    const [email, setEmail] = useState(profile.email ?? '')

    return (
        <div className={styles.form}>
            <div className={styles.readOnlyField}>
                <Typography className={styles.readOnlyLabel}>Name</Typography>
                <Typography className={styles.readOnlyValue}>{profile.name} {profile.lastName}</Typography>
            </div>
            <div className={styles.readOnlyField}>
                <Typography className={styles.readOnlyLabel}>Phone Number</Typography>
                <Typography className={styles.readOnlyValue}>{profile.phoneNumber}</Typography>
            </div>
            <TextField label="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button variant="contained" onClick={() => onSave({ email })} disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            {mutation.isSuccess && <p className={styles.success}>Profile updated</p>}
            {mutation.isError && <p className={styles.error}>{(mutation.error as Error).message}</p>}
        </div>
    )
}
