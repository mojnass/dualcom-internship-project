import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

const endpoint = process.env.B2_ENDPOINT!
const bucket = process.env.B2_BUCKET!
const region = new URL(endpoint).hostname.split('.')[1]

const s3 = new S3Client({
    endpoint,
    region,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APP_KEY!,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
})

const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
}

export const allowedImageTypes = Object.keys(extensions)

export const uploadImageFeature = async (file: Express.Multer.File) => {
    const key = `images/${randomUUID()}.${extensions[file.mimetype]}`
    await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    }))
    return `https://${bucket}.${new URL(endpoint).host}/${key}`
}
