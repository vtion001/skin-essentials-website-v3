"use client"

import React, { memo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AnimatedInput } from "@/components/ui/animated-input"
import { AnimatedSelect } from "@/components/ui/animated-select"
import { useFileUpload } from "@/lib/hooks/use-file-upload"
import type { PortfolioItem } from "@/lib/portfolio-data"

interface PortfolioEditDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    target: PortfolioItem | null
    onSaved: () => void
    categoryOptions: string[]
    procedureOptions: string[]
}

export const PortfolioEditDialog = memo(function PortfolioEditDialog({
    open,
    onOpenChange,
    target,
    onSaved,
    categoryOptions,
    procedureOptions,
}: PortfolioEditDialogProps) {
    const [draft, setDraft] = useState<Partial<PortfolioItem>>({})
    const [inlineAdd, setInlineAdd] = useState<{ beforeImage: string; afterImage: string }>({
        beforeImage: "",
        afterImage: "",
    })
    const inlineBeforeRef = React.useRef<HTMLInputElement | null>(null)
    const inlineAfterRef = React.useRef<HTMLInputElement | null>(null)
    const { uploadToApi } = useFileUpload()

    useEffect(() => {
        if (open) {
            setDraft(target || {})
        }
    }, [open, target])

    const handleAddResult = async () => {
        if (!target) return
        const b = String(inlineAdd.beforeImage || "")
        const a = String(inlineAdd.afterImage || "")
        if (!b || !a) return
        const payload = {
            title: target.title,
            category: target.category,
            beforeImage: b,
            afterImage: a,
            description: target.description,
            treatment: target.treatment,
            duration: target.duration,
            results: target.results,
            extraResults: [],
        }
        const res = await fetch("/api/portfolio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
        if (res.ok) {
            setInlineAdd({ beforeImage: "", afterImage: "" })
            onSaved()
        }
    }

    const handleSave = async () => {
        if (!target) return
        try {
            const payload = {
                title: String(draft.title || target.title),
                category: String(draft.category || target.category),
                treatment: String(draft.treatment || target.treatment),
                description: String(draft.description || target.description),
                beforeImage: String(draft.beforeImage || target.beforeImage),
                afterImage: String(draft.afterImage || target.afterImage),
                duration: String(draft.duration || target.duration),
                results: String(draft.results || target.results),
            }
            const res = await fetch(`/api/portfolio/${target.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error("Failed")
            onOpenChange(false)
            onSaved()
        } catch { }
    }

    const handleBeforeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.currentTarget
        const f = input.files?.[0]
        input.value = ""
        if (f) {
            const url = await uploadToApi(f, "before")
            setInlineAdd((prev) => ({ ...prev, beforeImage: url }))
        }
    }

    const handleAfterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.currentTarget
        const f = input.files?.[0]
        input.value = ""
        if (f) {
            const url = await uploadToApi(f, "after")
            setInlineAdd((prev) => ({ ...prev, afterImage: url }))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Portfolio Item</DialogTitle>
                </DialogHeader>
                {target && (
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <AnimatedInput
                                id="epf-title"
                                label="Title"
                                value={draft.title || ""}
                                onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                                required
                            />
                            <AnimatedSelect
                                value={draft.category || ""}
                                onValueChange={(v) => setDraft((prev) => ({ ...prev, category: v }))}
                                placeholder="Select category"
                                options={categoryOptions.map((c) => ({ value: c, label: c }))}
                                label="Category"
                            />
                            <AnimatedSelect
                                value={draft.treatment || ""}
                                onValueChange={(v) => setDraft((prev) => ({ ...prev, treatment: v }))}
                                placeholder="Select treatment"
                                options={procedureOptions.map((p) => ({ value: p, label: p }))}
                                label="Treatment"
                            />
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm font-medium text-gray-700">Description</Label>
                                <Textarea
                                    value={draft.description || ""}
                                    onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                            <AnimatedInput
                                id="epf-before"
                                label="Before Image URL"
                                value={draft.beforeImage || ""}
                                onChange={(e) => setDraft((prev) => ({ ...prev, beforeImage: e.target.value }))}
                                required
                            />
                            <AnimatedInput
                                id="epf-after"
                                label="After Image URL"
                                value={draft.afterImage || ""}
                                onChange={(e) => setDraft((prev) => ({ ...prev, afterImage: e.target.value }))}
                                required
                            />
                            <AnimatedInput
                                id="epf-duration"
                                label="Duration"
                                value={draft.duration || ""}
                                onChange={(e) => setDraft((prev) => ({ ...prev, duration: e.target.value }))}
                            />
                            <AnimatedInput
                                id="epf-results"
                                label="Results"
                                value={draft.results || ""}
                                onChange={(e) => setDraft((prev) => ({ ...prev, results: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <AnimatedInput
                                    id="inline-before"
                                    label="Add Result • Before Image URL"
                                    value={inlineAdd.beforeImage}
                                    onChange={(e) => setInlineAdd((prev) => ({ ...prev, beforeImage: e.target.value }))}
                                    required
                                />
                                <AnimatedInput
                                    id="inline-after"
                                    label="Add Result • After Image URL"
                                    value={inlineAdd.afterImage}
                                    onChange={(e) => setInlineAdd((prev) => ({ ...prev, afterImage: e.target.value }))}
                                    required
                                />
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => inlineBeforeRef.current?.click()}>
                                        Upload Before
                                    </Button>
                                    <input
                                        ref={inlineBeforeRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleBeforeUpload}
                                    />
                                    <Button variant="outline" onClick={() => inlineAfterRef.current?.click()}>
                                        Upload After
                                    </Button>
                                    <input
                                        ref={inlineAfterRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAfterUpload}
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <Button variant="secondary" onClick={handleAddResult}>
                                        Add Result
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button variant="brand" onClick={handleSave}>
                                Save Changes
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
})
