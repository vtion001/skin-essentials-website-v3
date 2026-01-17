'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCcw } from 'lucide-react'
import { reportError } from '@/lib/client-logger'
import Link from 'next/link'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Report website crash to the Developer Hub
        reportError(error, { 
            context: 'website_crash',
            meta: { digest: error.digest }
        })
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-orange-50 rounded-full">
                        <AlertCircle className="w-12 h-12 text-orange-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Oops! Something went wrong
                </h1>
                <p className="text-gray-600 mb-8">
                    We've encountered an unexpected error. Don't worry, our team has been notified and we're looking into it.
                </p>
                
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={reset}
                        className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Try again
                    </Button>
                    <Link href="/" className="w-full">
                        <Button
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 text-left">
                        <p className="text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest">Debug Info</p>
                        <pre className="text-xs text-red-500 bg-red-50 p-4 rounded overflow-auto max-h-40 font-mono">
                            {error.message}
                            {"\n\n"}
                            {error.stack}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}
