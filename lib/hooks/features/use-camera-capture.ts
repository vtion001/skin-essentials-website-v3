"use client"

import { useState, useRef, useCallback } from "react"
import { useFileUpload } from "@/lib/hooks/use-file-upload"

interface CameraCaptureState {
    isCameraDialogOpen: boolean
    cameraStream: MediaStream | null
    cameraTarget: "payment" | "medical" | null
}

interface UseCameraCaptureReturn extends CameraCaptureState {
    videoRef: React.RefObject<HTMLVideoElement | null>
    canvasRef: React.RefObject<HTMLCanvasElement | null>
    openCamera: (target?: "payment" | "medical") => Promise<void>
    closeCamera: () => void
    capturePhoto: () => Promise<string | null>
}

/**
 * Hook for managing camera capture functionality
 * Extracted from AdminDashboard to follow SRP
 */
export function useCameraCapture(): UseCameraCaptureReturn {
    const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false)
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
    const [cameraTarget, setCameraTarget] = useState<"payment" | "medical" | null>(null)

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const openCamera = useCallback(async (target: "payment" | "medical" = "payment") => {
        try {
            setCameraTarget(target)
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            })
            setCameraStream(stream)
            setIsCameraDialogOpen(true)

            // Attach stream to video element after dialog opens
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
            }, 100)
        } catch (error) {
            console.error("Failed to access camera:", error)
            throw new Error("Camera access denied or not available")
        }
    }, [])

    const closeCamera = useCallback(() => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop())
            setCameraStream(null)
        }
        setIsCameraDialogOpen(false)
        setCameraTarget(null)
    }, [cameraStream])

    const capturePhoto = useCallback(async (): Promise<string | null> => {
        if (!videoRef.current || !canvasRef.current) return null

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (!context) return null

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to blob
        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8)
        })

        if (!blob) return null

        // Convert blob to data URL for preview
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8)

        // Close camera after capture
        closeCamera()

        return dataUrl
    }, [closeCamera])

    return {
        isCameraDialogOpen,
        cameraStream,
        cameraTarget,
        videoRef,
        canvasRef,
        openCamera,
        closeCamera,
        capturePhoto,
    }
}
