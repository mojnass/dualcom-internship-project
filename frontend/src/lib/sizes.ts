const letterSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const waistSizes = ['28', '30', '32', '34', '36', '38', '40']
const shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
const oneSize = ['One Size']

const sizesByCategory: Record<string, string[]> = {
    shirts: letterSizes,
    'long sleeves': letterSizes,
    jackets: letterSizes,
    hoodies: letterSizes,
    coats: letterSizes,
    suits: letterSizes,
    pants: waistSizes,
    footwear: shoeSizes,
    headwear: oneSize,
    accessories: oneSize,
    socks: oneSize,
}

export function getSizesForCategory(category: string): string[] {
    return sizesByCategory[category.trim().toLowerCase()] ?? letterSizes
}

export function getStockForSize(product: { sizes?: readonly { size: string; quantity: number }[] }, size: string): number {
    return product.sizes?.find((entry) => entry.size === size)?.quantity ?? 0
}

export function getSizeLabel(category: string): string {
    const sizes = getSizesForCategory(category)
    if (sizes === waistSizes) return 'Waist Size'
    if (sizes === shoeSizes) return 'Shoe Size (EU)'
    return 'Size'
}
