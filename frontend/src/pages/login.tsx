import { TextField, Button } from '@mui/material'
import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import BackButton from '../components/backButton'
import styles from '../css/authForm.module.css'

interface LoginData {
    identifier: string
    password: string
}
export default function Login() {
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const mutation = useMutation({
        mutationFn: async (data: LoginData) => {
            const response = await fetch('http://localhost:3000/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.message || `Login failed (${response.status})`)
            }
            return body
        },
        onSuccess: (data) => {
            if (!data.token) {
                throw new Error('No token returned')
            }
            localStorage.setItem('token', data.token)
            localStorage.setItem('role', data.role)
            if (data.role === 'admin') {
                navigate('/admin')
            } else if (data.role === 'store_owner') {
                navigate('/store-owner')
            } else {
                navigate('/home')
            }
        }
    })

    function handleLogin(e: FormEvent) {
        e.preventDefault()
        mutation.mutate({ identifier, password })
    }

    return (
        <div className={styles.page}>
            <BackButton />
            <form className={styles.form} onSubmit={handleLogin}>
                <h1>Login</h1>
                <TextField
                    label="Email or Phone"
                    name="username"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />
                <TextField
                    label="Password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" variant="contained" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Logging in...' : 'Login'}
                </Button>
                {mutation.isSuccess && <p className={styles.success}>{mutation.data.message}</p>}
                {mutation.isError && <p className={styles.error}>{(mutation.error as Error).message}</p>}
                <p className={styles.switch}>
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </form>
        </div>
    )
}
