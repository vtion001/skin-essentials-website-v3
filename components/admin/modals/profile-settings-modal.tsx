"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Bell, Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileSettingsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ProfileSettingsModal({ open, onOpenChange }: ProfileSettingsModalProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border-stone-100 shadow-2xl p-0 gap-0 overflow-hidden">
                <div className="flex h-[500px]">
                    {/* Sidebar */}
                    <div className="w-[200px] bg-stone-50/50 border-r border-stone-100 p-6">
                        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6">Settings</h2>
                        <Tabs defaultValue="account" orientation="vertical" className="flex flex-col h-full">
                            <TabsList className="flex flex-col h-auto bg-transparent gap-1 p-0 items-start w-full">
                                <TabsTrigger value="account" className="w-full justify-start gap-3 px-3 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-stone-900 text-stone-500 rounded-lg transition-all">
                                    <User className="w-4 h-4" />
                                    Account
                                </TabsTrigger>
                                <TabsTrigger value="security" className="w-full justify-start gap-3 px-3 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-stone-900 text-stone-500 rounded-lg transition-all">
                                    <Lock className="w-4 h-4" />
                                    Security
                                </TabsTrigger>
                                <TabsTrigger value="notifications" className="w-full justify-start gap-3 px-3 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-stone-900 text-stone-500 rounded-lg transition-all">
                                    <Bell className="w-4 h-4" />
                                    Notifications
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                        <div className="p-6 flex-1 overflow-y-auto">
                            <Tabs defaultValue="account" className="w-full">
                                <TabsContent value="account" className="space-y-6 mt-0">
                                    <div className="flex items-center gap-4 mb-8">
                                        <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>AD</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-bold text-stone-900">Admin User</h3>
                                            <p className="text-xs text-stone-500">admin@skinessentials.clinic</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="ml-auto text-xs">Change Avatar</Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name" className="text-xs font-bold uppercase text-stone-500">Full Name</Label>
                                            <Input id="name" defaultValue="Admin User" className="bg-white" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className="text-xs font-bold uppercase text-stone-500">Email Address</Label>
                                            <Input id="email" defaultValue="admin@skinessentials.clinic" className="bg-white" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="role" className="text-xs font-bold uppercase text-stone-500">Role</Label>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-md border border-stone-100">
                                                <Shield className="w-4 h-4 text-[#d09d80]" />
                                                <span className="text-sm font-medium text-stone-900">Super Administrator</span>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="security" className="space-y-6 mt-0">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-stone-900">Change Password</h3>
                                        <div className="grid gap-2">
                                            <Label htmlFor="current" className="text-xs font-bold uppercase text-stone-500">Current Password</Label>
                                            <Input id="current" type="password" className="bg-white" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="new" className="text-xs font-bold uppercase text-stone-500">New Password</Label>
                                            <Input id="new" type="password" className="bg-white" />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="notifications" className="space-y-6 mt-0">
                                    <h3 className="text-lg font-bold text-stone-900">Preferences</h3>
                                    <div className="space-y-4">
                                        {/* Notification toggles would go here */}
                                        <p className="text-sm text-stone-500">Manage how you receive alerts and updates.</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        
                        <div className="p-6 border-t border-stone-100 bg-stone-50/30 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button className="bg-stone-900 text-white hover:bg-stone-800" onClick={handleSave} disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
