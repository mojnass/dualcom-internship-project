import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import styles from '../css/cardPaymentDialog.module.css'

interface CardPaymentDialogProps {
    readonly open: boolean
    readonly amount: number
    readonly submitting: boolean
    readonly onClose: () => void
    readonly onConfirm: () => void
}

function formatCardNumber(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length < 3) return digits
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function expiryIsValid(expiry: string) {
    const match = /^(\d{2})\/(\d{2})$/.exec(expiry)
    if (!match) return false
    const month = Number(match[1])
    const year = Number(match[2])
    if (month < 1 || month > 12) return false

    const now = new Date()
    const currentYear = now.getFullYear() % 100
    const currentMonth = now.getMonth() + 1
    if (year < currentYear) return false
    if (year === currentYear && month < currentMonth) return false
    return true
}

export default function CardPaymentDialog({ open, amount, submitting, onClose, onConfirm }: CardPaymentDialogProps) {
    const [cardNumber, setCardNumber] = useState('')
    const [cardName, setCardName] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvv, setCvv] = useState('')
    const [touched, setTouched] = useState(false)

    const digits = cardNumber.replace(/\D/g, '')
    const numberError = digits.length !== 16
    const nameError = cardName.trim().length < 3
    const expiryError = !expiryIsValid(expiry)
    const cvvError = cvv.length !== 3
    const hasErrors = numberError || nameError || expiryError || cvvError

    function handleConfirm() {
        setTouched(true)
        if (hasErrors) return
        onConfirm()
    }

    function handleClose() {
        if (submitting) return
        onClose()
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle className={styles.title}>Pay with Card</DialogTitle>
            <DialogContent className={styles.content}>
                <TextField
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    error={touched && numberError}
                    helperText={touched && numberError ? 'Enter the 16 digits on your card' : ' '}
                    autoComplete="off"
                    fullWidth
                />

                <TextField
                    label="Name on Card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    error={touched && nameError}
                    helperText={touched && nameError ? 'Enter the name printed on the card' : ' '}
                    autoComplete="off"
                    fullWidth
                />

                <div className={styles.row}>
                    <TextField
                        label="Expiry"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        error={touched && expiryError}
                        helperText={touched && expiryError ? 'Use MM/YY' : ' '}
                        autoComplete="off"
                    />
                    <TextField
                        label="CVV"
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        error={touched && cvvError}
                        helperText={touched && cvvError ? '3 digits' : ' '}
                        autoComplete="off"
                    />
                </div>

                <Typography className={styles.testNote}>
                    
                </Typography>
            </DialogContent>
            <DialogActions className={styles.actions}>
                <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
                <Button variant="contained" onClick={handleConfirm} disabled={submitting}>
                    {submitting ? 'Placing Order...' : `Pay $${amount.toFixed(2)}`}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
