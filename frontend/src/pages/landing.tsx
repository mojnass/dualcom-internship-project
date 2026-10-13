import { Button, IconButton, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { getRole, isSignedIn } from '../lib/auth'
import styles from '../css/landing.module.css'
import indoorS_Img3 from '../assets/indoorS_Img3.webp'

export default function Landing() {
    const signedIn = isSignedIn()
    const roleHome: Record<string, string> = { admin: '/admin', store_owner: '/store-owner' }
    const exploreTo = roleHome[getRole() ?? ''] ?? '/home'

    return (
        <div className={styles.page}>
            <img src={indoorS_Img3} alt="clothing shop" className={styles.image}/>
            <div className={styles.overlay} />
            <div className={styles.topRight}>
                {signedIn ? (
                    <IconButton component={Link} to="/account" aria-label="Account" className={styles.accountButton}>
                        <AccountCircleIcon fontSize="large" />
                    </IconButton>
                ) : (
                    <>
                        <Button component={Link} to="/login" className={styles.loginButton}>
                            Log In
                        </Button>
                        <Button component={Link} to="/register" variant="contained" className={styles.signupButton}>
                            Sign Up
                        </Button>
                    </>
                )}
            </div>

            <Typography variant="h1" className={styles.title}>
                Internship Project
            </Typography>

            <Typography variant="h5" className={styles.subtitle}>
                Clothing from local stores, all in one place
            </Typography>

            <Button component={Link} to={exploreTo} variant="contained" className={styles.exploreButton}>
                Explore
            </Button>
        </div>
    )
}
