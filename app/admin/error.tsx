// app/admin/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Admin dashboard error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-rose-50 rounded-full">
                        <AlertCircle className="w-8 h-8 text-rose-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Something went wrong!
                </h2>
                <p className="text-gray-600 mb-6">
                    An error occurred while loading the admin dashboard. Please try again.
                </p>
                {error.message && (
                    <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-50 p-3 rounded">
                        {error.message}
                    </p>
                )}
                <Button
                    onClick={reset}
                    className="w-full bg-[#0F2922] hover:bg-[#0F2922]/90"
                >
                    Try again
                </Button>
            </div>
        </div>
    )
}
