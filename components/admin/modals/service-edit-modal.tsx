"use client"

import { memo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export interface ServiceEditData {
    name: string
    price: string
    description: string
    duration?: string
    results?: string
    sessions?: string
    includes?: string
    originalPrice?: string
    badge?: string
    pricing?: string
    image?: string
    benefits?: string[]
    faqs?: { q: string; a: string }[]
}

interface ServiceEditModalProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    target: ServiceEditData | null
    selectedCategory: string
    onSaved: () => void
}

export const ServiceEditModal = memo(function ServiceEditModal({
    open,
    onOpenChange,
    target,
    selectedCategory,
    onSaved,
}: ServiceEditModalProps) {
    const [draft, setDraft] = useState<ServiceEditData>({
        name: "",
        price: "",
        description: "",
        benefits: [],
        faqs: [],
    })

    useEffect(() => {
        if (open) {
            setDraft(target || { name: "", price: "", description: "", image: "", benefits: [], faqs: [] })
        }
    }, [open, target])

    const handleSave = async () => {
        if (!target) return
        try {
            const res = await fetch("/api/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "updateService",
                    categoryId: selectedCategory,
                    originalName: target.name,
                    service: draft,
                }),
            })
            if (!res.ok) throw new Error("Failed")
            onOpenChange(false)
            onSaved()
        } catch { }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Service</DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label>Name</Label>
                        <Input
                            value={draft.name}
                            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Service name"
                        />
                    </div>
                    <div>
                        <Label>Price</Label>
                        <Input
                            value={draft.price}
                            onChange={(e) => setDraft((prev) => ({ ...prev, price: e.target.value }))}
                            placeholder="₱0"
                        />
                    </div>
                    <div>
                        <Label>Duration</Label>
                        <Input
                            value={draft.duration || ""}
                            onChange={(e) => setDraft((prev) => ({ ...prev, duration: e.target.value }))}
                            placeholder="e.g. 45 minutes"
                        />
                    </div>
                    <div>
                        <Label>Results</Label>
                        <Input
                            value={draft.results || ""}
                            onChange={(e) => setDraft((prev) => ({ ...prev, results: e.target.value }))}
                            placeholder="e.g. 6-12 months"
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
                    <div>
                        <Label>Sessions</Label>
                        <Input
                            value={draft.sessions || ""}
                            onChange={(e) => setDraft((prev) => ({ ...prev, sessions: e.target.value }))}
                            placeholder="e.g. 6-8 sessions"
                        />
                    </div>
                    <div>
                        <Label>Includes</Label>
                        <Input
                            value={draft.includes || ""}
                            onChange={(e) => setDraft((prev) => ({ ...prev, includes: e.target.value }))}
                            placeholder="e.g. Post-care kit"
                        />
                    </div>
                    <div>
                        <Label>Original Price</Label>
                        <Input
                            value={draft.originalPrice || ""}
                            onChange={(e) => setDraft((prev) => ({ ...prev, originalPrice: e.target.value }))}
                            placeholder="₱0"
                        />
                    </div>
                    <div>
                        <Label>Badge</Label>
                        <Input
                            value={draft.badge || ""}
                            onChange={(e) => setDraft((prev) => ({ ...prev, badge: e.target.value }))}
                            placeholder="e.g. PROMO"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label>Pricing Notes</Label>
                        <Input
                            value={draft.pricing || ""}
                            onChange={(e) => setDraft((prev) => ({ ...prev, pricing: e.target.value }))}
                            placeholder="e.g. per thread/cc"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                            value={draft.description}
                            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe the service"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label>Benefits</Label>
                        {(draft.benefits || []).map((b, idx) => (
                            <div key={idx} className="flex gap-2">
                                <Input
                                    value={b}
                                    onChange={(e) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            benefits: (prev.benefits || []).map((x, i) => (i === idx ? e.target.value : x)),
                                        }))
                                    }
                                    placeholder={`Benefit ${idx + 1}`}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            benefits: (prev.benefits || []).filter((_, i) => i !== idx),
                                        }))
                                    }
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="secondary"
                            onClick={() => setDraft((prev) => ({ ...prev, benefits: [...(prev.benefits || []), ""] }))}
                        >
                            Add Benefit
                        </Button>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label>FAQs</Label>
                        {(draft.faqs || []).map((f, idx) => (
                            <div key={idx} className="grid md:grid-cols-2 gap-2">
                                <Input
                                    value={f?.q || ""}
                                    onChange={(e) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            faqs: (prev.faqs || []).map((x, i) => (i === idx ? { ...x, q: e.target.value } : x)),
                                        }))
                                    }
                                    placeholder={`Question ${idx + 1}`}
                                />
                                <Textarea
                                    value={f?.a || ""}
                                    onChange={(e) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            faqs: (prev.faqs || []).map((x, i) => (i === idx ? { ...x, a: e.target.value } : x)),
                                        }))
                                    }
                                    placeholder="Answer"
                                />
                                <div className="md:col-span-2 flex justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setDraft((prev) => ({
                                                ...prev,
                                                faqs: (prev.faqs || []).filter((_, i) => i !== idx),
                                            }))
                                        }
                                    >
                                        Remove FAQ
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button
                            variant="secondary"
                            onClick={() => setDraft((prev) => ({ ...prev, faqs: [...(prev.faqs || []), { q: "", a: "" }] }))}
                        >
                            Add FAQ
                        </Button>
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
