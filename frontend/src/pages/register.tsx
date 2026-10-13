import { TextField, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import BackButton from '../components/backButton'
import styles from '../css/authForm.module.css'

interface RegisterData {
    name: string
    lastName: string
    phoneNumber: string
    email?: string
    password: string
}

export default function Register() {
    const [name, setName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const mutation = useMutation({
        mutationFn: async (data: RegisterData) => {
            const response = await fetch('http://localhost:3000/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.message || `Registration failed (${response.status})`)
            }
            return body
        }
    })

    function handleRegister(e: FormEvent) {
        e.preventDefault()
        mutation.mutate({ name, lastName, phoneNumber, email, password })
    }

    return (
        <div className={styles.page}>
            <BackButton />
            <form className={styles.form} onSubmit={handleRegister}>
                <h1>Register</h1>
                <TextField
                    label="Name"
                    name="given-name"
                    autoComplete="given-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    label="Last Name"
                    name="family-name"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                <TextField
                    label="Phone Number"
                    name="tel"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <TextField
                    label="Email (optional)"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="Password"
                    type="password"
                    name="new-password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    helperText="At least 8 characters, with an uppercase letter, a lowercase letter, a number and a symbol"
                />
                <Button type="submit" variant="contained" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Registering...' : 'Sign Up'}
                </Button>
                {mutation.isSuccess && <p className={styles.success}>{mutation.data.message}</p>}
                {mutation.isError && <p className={styles.error}>{(mutation.error as Error).message}</p>}
                <p className={styles.switch}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    )
}
