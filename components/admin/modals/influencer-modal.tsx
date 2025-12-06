import React, { useState, useEffect, memo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Influencer } from "@/lib/admin-services"

interface InfluencerModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  selectedInfluencer: Influencer | null
  influencerForm: Partial<Influencer>
  setInfluencerForm: (updater: (prev: Partial<Influencer>) => Partial<Influencer>) => void
  privacyMode: boolean
  isLoading: boolean
  handleSubmit: (e: React.FormEvent) => void
}

export const InfluencerModal = memo(({ 
  open,
  onOpenChange,
  selectedInfluencer,
  influencerForm,
  setInfluencerForm,
  privacyMode,
  isLoading,
  handleSubmit,
}: InfluencerModalProps) => {
  const [form, setForm] = useState<Partial<Influencer>>({})
  const [reveal, setReveal] = useState<{ referralCode: boolean; email: boolean; phone: boolean }>({ referralCode: true, email: true, phone: true })
  
  useEffect(() => {
    if (open) {
      if (selectedInfluencer) setForm(selectedInfluencer)
      else setForm({ name: '', handle: '', platform: 'instagram', email: '', phone: '', referralCode: '', commissionRate: 0.10, status: 'active', notes: '' })
      setReveal({ referralCode: true, email: true, phone: true })
    }
  }, [open, selectedInfluencer])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] [contain:layout_paint]">
        <DialogHeader>
          <DialogTitle>{selectedInfluencer ? 'Edit Influencer' : 'Add New Influencer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); setInfluencerForm(() => form); handleSubmit(e) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="infName">Name</Label>
              <Input id="infName" value={form.name || ''} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="infHandle">Handle</Label>
              <Input id="infHandle" value={form.handle || ''} onChange={(e) => setForm(prev => ({ ...prev, handle: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="infPlatform">Platform</Label>
              <Select value={form.platform || ''} onValueChange={(v) => setForm(prev => ({ ...prev, platform: v as Influencer['platform'] }))}>
                <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="infReferralCode">Referral Code</Label>
              <div className="flex items-center gap-2">
                <Input id="infReferralCode" value={form.referralCode || ''} onChange={(e) => setForm(prev => ({ ...prev, referralCode: e.target.value }))} type={privacyMode && !reveal.referralCode ? 'password' : 'text'} readOnly={privacyMode && !reveal.referralCode} />
                <Button type="button" variant="outline" className="h-9 px-2" onClick={() => setReveal(prev => ({ ...prev, referralCode: !prev.referralCode }))}>{reveal.referralCode ? 'Hide' : 'Reveal'}</Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="infEmail">Email</Label>
              <div className="flex items-center gap-2">
                <Input id="infEmail" value={form.email || ''} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} type={privacyMode && !reveal.email ? 'password' : 'email'} readOnly={privacyMode && !reveal.email} />
                <Button type="button" variant="outline" className="h-9 px-2" onClick={() => setReveal(prev => ({ ...prev, email: !prev.email }))}>{reveal.email ? 'Hide' : 'Reveal'}</Button>
              </div>
            </div>
            <div>
              <Label htmlFor="infPhone">Phone</Label>
              <div className="flex items-center gap-2">
                <Input id="infPhone" value={form.phone || ''} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} type={privacyMode && !reveal.phone ? 'password' : 'text'} readOnly={privacyMode && !reveal.phone} />
                <Button type="button" variant="outline" className="h-9 px-2" onClick={() => setReveal(prev => ({ ...prev, phone: !prev.phone }))}>{reveal.phone ? 'Hide' : 'Reveal'}</Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="infRate">Commission Rate (%)</Label>
              <Input id="infRate" type="number" step="1" value={Math.round((form.commissionRate || 0.10) * 100)} onChange={(e) => setForm(prev => ({ ...prev, commissionRate: Math.max(0, Math.min(100, Number(e.target.value))) / 100 }))} />
            </div>
            <div>
              <Label htmlFor="infStatus">Status</Label>
              <Select value={form.status || ''} onValueChange={(v) => setForm(prev => ({ ...prev, status: v as Influencer['status'] }))}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="infNotes">Notes</Label>
            <Textarea id="infNotes" rows={3} value={form.notes || ''} onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Influencer'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
})

InfluencerModal.displayName = 'InfluencerModal'
