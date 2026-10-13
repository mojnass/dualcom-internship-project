import { Button } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import UploadIcon from '@mui/icons-material/Upload'
import { getToken } from '../lib/auth'
import styles from '../css/imageUploader.module.css'

async function uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)
    const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body.message || `Upload failed (${response.status})`)
    }
    return body.url
}

export default function ImageUploader({ value, onChange }: { readonly value?: string; readonly onChange: (url: string) => void }) {
    const upload = useMutation({ mutationFn: uploadImage, onSuccess: onChange })

    return (
        <div className={styles.uploader}>
            {value && <img src={value} alt="Uploaded preview" className={styles.preview} />}
            <Button component="label" variant="outlined" startIcon={<UploadIcon />} disabled={upload.isPending} className={styles.button}>
                {upload.isPending ? 'Uploading...' : value ? 'Change image' : 'Upload image'}
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    hidden
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) upload.mutate(file)
                        e.target.value = ''
                    }}
                />
            </Button>
            {upload.isError && <p className={styles.error}>{(upload.error as Error).message}</p>}
        </div>
    )
}
