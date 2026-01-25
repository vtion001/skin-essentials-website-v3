import type { ImageLoader } from 'next/image'

// Cloudinary configuration interface
export interface CloudinaryConfig {
  cloudName: string
  apiKey: string
}

// Cloudinary configuration
export const cloudinaryConfig: CloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dbviya1rj',
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '983557369189495',
}

// Optimized Cloudinary URL builder
export function getCloudinaryUrl(publicId: string, options: {
  width?: number
  height?: number
  quality?: number
  format?: 'auto' | 'webp' | 'avif'
  crop?: 'fill' | 'thumb' | 'scale'
  gravity?: string
  dpr?: number
  fetchFormat?: 'auto' | 'format'
} = {}): string {
  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    crop,
    gravity,
    dpr,
    fetchFormat = 'auto'
  } = options

  const transformations = [
    width && `w_${width}`,
    height && `h_${height}`,
    `q_${quality}`,
    format && `f_${format}`,
    crop && `c_${crop}`,
    gravity && `g_${gravity}`,
    dpr && `dpr_${dpr}`,
    fetchFormat && `fl_${fetchFormat}`
  ].filter(Boolean).join(',')

  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`
  const transformationPart = transformations ? `${transformations}/` : ''
  return `${baseUrl}/${transformationPart}${publicId}`
}

// Cloudinary loader for Next.js Image component
export const cloudinaryLoader: ImageLoader = ({ src, width, quality }) => {
  let publicId = src

  // If it's a full Cloudinary URL, extract the public ID cleanly.
  if (src.includes('cloudinary.com')) {
    const parts = src.split('/upload/');
    if (parts.length === 2) {
      // Path after /upload/, which may contain transformations, version, and public ID
      const path = parts[1];
      
      // Split into segments and filter out those that look like transformations (e.g., w_100, q_auto, f_auto)
      const segments = path.split('/');
      const cleanSegments = segments.filter(segment => {
        // Transformation segments typically contain an underscore followed by values, or are specific keywords
        // e.g., w_500, c_fill, q_auto, f_auto, fl_auto
        const isTransform = /^[a-z]+_[a-z0-9,._]+$/i.test(segment) || 
                           ['q_auto', 'f_auto', 'fl_auto', 'br_auto'].includes(segment);
        return !isTransform;
      });
      
      publicId = cleanSegments.join('/');
    }
  }
  
  // Remove file extension for a clean public ID, as Cloudinary works best without it
  publicId = publicId.replace(/\.(jpg|jpeg|png|webp|avif)$/, '');

  return getCloudinaryUrl(publicId, { width, quality });
}


// WebP/AVIF format detection
export function supportsFormat(format: 'webp' | 'avif'): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    
    if (format === 'webp') {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    }
    
    if (format === 'avif') {
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
    }
  } catch {
    return false
  }
}

// Optimize image props based on format support
export function getOptimizedImageProps(publicId: string, baseProps: {
  width?: number
  height?: number
  alt?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  quality?: number
  placeholder?: 'blur' | 'empty'
  fill?: boolean
  sizes?: string
  unoptimized?: boolean
}) {
  const { width, height, alt, priority = false, loading = 'lazy', quality, placeholder, fill, sizes, unoptimized } = baseProps
  
  let format: 'auto' | 'webp' | 'avif' = 'auto'
  if (supportsFormat('avif')) {
    format = 'avif'
  } else if (supportsFormat('webp')) {
    format = 'webp'
  }
  
  const imageQuality = quality || 80
  
  return {
    loader: cloudinaryLoader,
    src: publicId,
    width,
    height,
    alt,
    priority,
    loading,
    quality: imageQuality,
    placeholder,
    fill,
    sizes,
    unoptimized,
    ...(process.env.NODE_ENV === 'development' && placeholder === 'blur' && {
      blurDataURL: `data:image/svg+xml;base64,${btoa(
        `<svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>`
      )}`,
    })
  }
}

// Critical Cloudinary URLs for site
export const criticalImages = {
  logo: 'v1753674655/skinessentials_logo_350_x_180_px_fpp26r',
  heroVideo: 'v1766267101/v2httaofqjgsxkgsoqvm.mov',
  clinic: 'v1766177518/Aesthetic_Clinic_Picture_ifcih6.jpg',
  beforeAfter: 'v1758859267/bbecd5de-3bea-4490-8fef-144ca997ed41.png'
}

// Preload critical images
export function preloadCriticalImages(urls: string[]) {
  if (typeof window === 'undefined') return
  urls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    document.head.appendChild(link)
  })
}
