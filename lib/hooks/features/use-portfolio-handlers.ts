"use client"

import { useCallback, useState } from "react"
import type { PortfolioItem } from "@/lib/types/api.types"

interface UsePortfolioHandlersProps {
    setPortfolioItems: (items: PortfolioItem[]) => void
    setPortfolioForm: (form: Partial<PortfolioItem> | ((prev: Partial<PortfolioItem>) => Partial<PortfolioItem>)) => void
    setEditPortfolioForm: (form: Partial<PortfolioItem> | ((prev: Partial<PortfolioItem>) => Partial<PortfolioItem>)) => void
    setAddResultForm: (form: Partial<{ beforeImage: string; afterImage: string }> | ((prev: Partial<{ beforeImage: string; afterImage: string }>) => Partial<{ beforeImage: string; afterImage: string }>)) => void
    uploadToApi: (file: File, type: string) => Promise<string>
    showNotification: (type: "success" | "error" | "info", message: string) => void
    setIsLoading: (loading: boolean) => void
}

interface UsePortfolioHandlersReturn {
    uploadPortfolioFile: (file: File, kind: "before" | "after", target: "create" | "edit" | "addResult") => Promise<void>
    handlePortfolioSubmit: (portfolioForm: Partial<PortfolioItem>) => Promise<void>
    handlePortfolioUpdate: (id: string, form: Partial<PortfolioItem>) => Promise<void>
    handlePortfolioDelete: (id: string) => Promise<void>
    handleAddExtraResult: (id: string, beforeImage: string, afterImage: string) => Promise<void>
    isSensitivePreview: (item: PortfolioItem) => boolean
}

/**
 * Hook for managing portfolio operations
 * Extracted from AdminDashboard to follow SRP
 */
export function usePortfolioHandlers({
    setPortfolioItems,
    setPortfolioForm,
    setEditPortfolioForm,
    setAddResultForm,
    uploadToApi,
    showNotification,
    setIsLoading,
}: UsePortfolioHandlersProps): UsePortfolioHandlersReturn {

    const uploadPortfolioFile = useCallback(async (
        file: File,
        kind: "before" | "after",
        target: "create" | "edit" | "addResult" = "create"
    ) => {
        try {
            const url = await uploadToApi(file, kind)
            if (target === "create") {
                setPortfolioForm((prev) => ({
                    ...prev,
                    [kind === "before" ? "beforeImage" : "afterImage"]: url,
                }))
            } else if (target === "edit") {
                setEditPortfolioForm((prev) => ({
                    ...prev,
                    [kind === "before" ? "beforeImage" : "afterImage"]: url,
                }))
            } else if (target === "addResult") {
                setAddResultForm((prev) => ({
                    ...prev,
                    [kind === "before" ? "beforeImage" : "afterImage"]: url,
                }))
            }
            showNotification("success", "Image uploaded")
        } catch {
            showNotification("error", "Upload failed")
        }
    }, [uploadToApi, setPortfolioForm, setEditPortfolioForm, setAddResultForm, showNotification])

    const handlePortfolioSubmit = useCallback(async (portfolioForm: Partial<PortfolioItem>) => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(portfolioForm),
            })
            if (!res.ok) throw new Error("Failed to create portfolio item")

            const json = await res.json()
            if (json.success) {
                // Refresh portfolio items
                const listRes = await fetch("/api/portfolio")
                const listJson = await listRes.json()
                setPortfolioItems(Array.isArray(listJson.items) ? listJson.items : [])
                showNotification("success", "Portfolio item added!")
                setPortfolioForm({})
            }
        } catch (error) {
            console.error("Portfolio submit error:", error)
            showNotification("error", "Failed to add portfolio item")
        } finally {
            setIsLoading(false)
        }
    }, [setPortfolioItems, setPortfolioForm, showNotification, setIsLoading])

    const handlePortfolioUpdate = useCallback(async (id: string, form: Partial<PortfolioItem>) => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/portfolio/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            if (!res.ok) throw new Error("Failed to update portfolio item")

            // Refresh portfolio items
            const listRes = await fetch("/api/portfolio")
            const json = await listRes.json()
            setPortfolioItems(Array.isArray(json.items) ? json.items : [])
            showNotification("success", "Portfolio item updated!")
        } catch (error) {
            console.error("Portfolio update error:", error)
            showNotification("error", "Failed to update portfolio item")
        } finally {
            setIsLoading(false)
        }
    }, [setPortfolioItems, showNotification, setIsLoading])

    const handlePortfolioDelete = useCallback(async (id: string) => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/portfolio/${id}`, {
                method: "DELETE",
            })
            if (!res.ok) throw new Error("Failed to delete portfolio item")

            // Refresh portfolio items
            const listRes = await fetch("/api/portfolio")
            const json = await listRes.json()
            setPortfolioItems(Array.isArray(json.items) ? json.items : [])
            showNotification("success", "Portfolio item deleted!")
        } catch (error) {
            console.error("Portfolio delete error:", error)
            showNotification("error", "Failed to delete portfolio item")
        } finally {
            setIsLoading(false)
        }
    }, [setPortfolioItems, showNotification, setIsLoading])

    const handleAddExtraResult = useCallback(async (
        id: string,
        beforeImage: string,
        afterImage: string
    ) => {
        setIsLoading(true)
        try {
            // Get current item
            const itemRes = await fetch(`/api/portfolio/${id}`)
            const itemJson = await itemRes.json()
            const currentItem = itemJson.item

            // Add extra result
            const extraResults = Array.isArray(currentItem?.extraResults)
                ? currentItem.extraResults
                : []
            extraResults.push({ beforeImage, afterImage })

            const res = await fetch(`/api/portfolio/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ extraResults }),
            })
            if (!res.ok) throw new Error("Failed to add extra result")

            // Refresh portfolio items
            const listRes = await fetch("/api/portfolio")
            const json = await listRes.json()
            setPortfolioItems(Array.isArray(json.items) ? json.items : [])
            showNotification("success", "Extra result added!")
        } catch (error) {
            console.error("Add extra result error:", error)
            showNotification("error", "Failed to add extra result")
        } finally {
            setIsLoading(false)
        }
    }, [setPortfolioItems, showNotification, setIsLoading])

    const isSensitivePreview = useCallback((item: PortfolioItem): boolean => {
        const title = String(item.title || "").toLowerCase()
        return (
            title.includes("feminine") ||
            title.includes("intimate") ||
            title.includes("butt") ||
            title.includes("breast")
        )
    }, [])

    return {
        uploadPortfolioFile,
        handlePortfolioSubmit,
        handlePortfolioUpdate,
        handlePortfolioDelete,
        handleAddExtraResult,
        isSensitivePreview,
    }
}
