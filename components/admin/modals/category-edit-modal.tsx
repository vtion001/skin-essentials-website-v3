"use client"

import { memo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export interface CategoryEditData {
    id: string
    category: string
    description?: string
    image?: string
    color?: string
}

interface CategoryEditModalProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    target: CategoryEditData | null
    onSaved: () => void
}

export const CategoryEditModal = memo(function CategoryEditModal({
    open,
    onOpenChange,
    target,
    onSaved,
}: CategoryEditModalProps) {
    const [draft, setDraft] = useState<{
        category?: string
        description?: string
        image?: string
        color?: string
    }>({})

    useEffect(() => {
        if (open) {
            setDraft(
                target
                    ? {
                        category: target.category,
                        description: target.description || "",
                        image: target.image || "",
                        color: target.color || "",
                    }
                    : {}
            )
        }
    }, [open, target])

    const handleSave = async () => {
        if (!target) return
        try {
            const res = await fetch("/api/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "updateCategory", id: target.id, ...draft }),
            })
            if (!res.ok) throw new Error("Failed")
            onOpenChange(false)
            onSaved()
        } catch { }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label>Category Name</Label>
                        <Input
                            value={draft.category || ""}
                            onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                            placeholder="Category name"
                        />
                    </div>
                    <div>
                        <Label>Color</Label>
                        <Input
                            value={draft.color || ""}
                            onChange={(e) => setDraft((prev) => ({ ...prev, color: e.target.value }))}
                            placeholder="#hex or theme color"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                            value={draft.description || ""}
                            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe the category"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label>Image URL</Label>
                        <Input
                            value={draft.image || ""}
                            onChange={(e) => setDraft((prev) => ({ ...prev, image: e.target.value }))}
                            placeholder="https://..."
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="brand" onClick={handleSave}>
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
})
