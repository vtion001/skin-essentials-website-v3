import { useState, useRef, useCallback } from 'react'

export function useCamera() {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const openCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      setCameraStream(stream)
      setIsCameraOpen(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      return true
    } catch (error) {
      console.error('Camera access error:', error)
      return false
    }
  }, [])

  const closeCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
    }
    setCameraStream(null)
    setIsCameraOpen(false)
  }, [cameraStream])

  const capturePhoto = useCallback(async (): Promise<File | null> => {
    if (!videoRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current || document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null)
          return
        }
        const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' })
        resolve(file)
      }, 'image/jpeg', 0.9)
    })
  }, [])

  return {
    isCameraOpen,
    videoRef,
    canvasRef,
    openCamera,
    closeCamera,
    capturePhoto
  }
}
