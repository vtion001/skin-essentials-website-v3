"use client"

import React from "react"
import { AlertCircle, ShieldAlert, RefreshCw, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface EncryptionErrorBannerProps {
    onRetry: () => void
    onDismiss?: () => void
    onRunDiagnostics?: () => Promise<void>
    errorCount: number
}

export function EncryptionErrorBanner({ onRetry, onDismiss, onRunDiagnostics, errorCount }: EncryptionErrorBannerProps) {
    const [isDiagnosing, setIsDiagnosing] = React.useState(false)

    const handleRunDiagnostics = async () => {
        if (!onRunDiagnostics) return
        setIsDiagnosing(true)
        try {
            await onRunDiagnostics()
        } finally {
            setIsDiagnosing(false)
        }
    }
    if (errorCount === 0) return null

    return (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-900 shadow-lg border-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onDismiss && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-400 hover:text-rose-600 hover:bg-rose-100" onClick={onDismiss}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="flex items-start gap-4">
                    <div className="bg-rose-100 p-2 rounded-xl">
                        <ShieldAlert className="h-5 w-5 text-rose-600" />
                    </div>

                    <div className="flex-1 space-y-1">
                        <AlertTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            Security Notice: Data Access Restricted
                        </AlertTitle>
                        <AlertDescription className="text-xs font-medium text-rose-700/80 leading-relaxed">
                            <span className="font-bold text-rose-900 underline decoration-rose-300 underline-offset-2">{errorCount}</span> record{errorCount > 1 ? 's' : ''} contain{errorCount === 1 ? 's' : ''} encrypted data from a previous security key.
                            These fields display as <code className="bg-rose-100 px-1 rounded text-rose-900">[Unavailable]</code> for HIPAA compliance.
                            Contact your system administrator to repair affected records or restore the original encryption key.
                        </AlertDescription>


                        <div className="pt-3 flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRetry}
                                className="bg-white border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300 h-8 text-[10px] font-bold uppercase tracking-wider"
                            >
                                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                Retry Decryption
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRunDiagnostics}
                                disabled={isDiagnosing || !onRunDiagnostics}
                                className="bg-white border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300 h-8 text-[10px] font-bold uppercase tracking-wider"
                            >
                                <AlertCircle className={`mr-2 h-3.5 w-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
                                {isDiagnosing ? 'Running...' : 'Run Diagnostics'}
                            </Button>
                            <div className="text-[9px] font-bold text-rose-400 uppercase tracking-tight italic">
                                All decryption failures have been logged in the security audit trail.
                            </div>
                        </div>
                    </div>
                </div>
            </Alert>
        </div>
    )
}
