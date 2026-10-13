import { Divider, InputBase } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import styles from '../css/search.module.css'

export default function Search({
    value,
    onChange,
}: {
    readonly value: string
    readonly onChange: (value: string) => void
}) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.row}>
                <SearchIcon className={styles.icon} />
                <InputBase
                    fullWidth
                    placeholder="Search"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={styles.input}
                />
            </div>
            <Divider className={styles.divider} />
        </div>
    )
}
