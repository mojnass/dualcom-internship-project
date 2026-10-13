import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import styles from '../css/backButton.module.css'

interface BackButtonProps {
    readonly label?: string
     readonly to?: string
}

export default function BackButton({ label = 'Back', to }: BackButtonProps) {
    const navigate = useNavigate()

    const handleBack = () => {
        navigate(to ?? '/home')
    }

    return (
        <Button onClick={handleBack} startIcon={<ArrowBackIcon fontSize="small" />} className={styles.back}>
            <span className={styles.label}>{label}</span>
        </Button>
    )
}
