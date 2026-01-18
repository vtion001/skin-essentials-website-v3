"use client"

import { useCallback, useState } from "react"
import type { Client } from "@/lib/types/admin.types"
import { clientService, socialMediaService } from "@/lib/services/admin"

interface UseClientHandlersProps {
    clients: Client[]
    setClients: (clients: Client[]) => void
    setIsClientModalOpen: (open: boolean) => void
    setClientForm: (form: Partial<Client> | ((prev: Partial<Client>) => Partial<Client>)) => void
    setSelectedClient: (client: Client | null) => void
    showNotification: (type: "success" | "error" | "info", message: string) => void
    setIsLoading: (loading: boolean) => void
}

interface UseClientHandlersReturn {
    handleClientSubmit: (
        e: React.FormEvent,
        selectedClient: Client | null,
        clientForm: Partial<Client>
    ) => Promise<void>
    openClientModal: (client?: Client) => void
    closeClientModal: () => void
    deleteClient: (clientId: string) => Promise<void>
    clientDuplicateWarning: string | null
    setClientDuplicateWarning: (warning: string | null) => void
}

/**
 * Hook for managing client operations
 * Extracted from AdminDashboard to follow SRP
 */
export function useClientHandlers({
    clients,
    setClients,
    setIsClientModalOpen,
    setClientForm,
    setSelectedClient,
    showNotification,
    setIsLoading,
}: UseClientHandlersProps): UseClientHandlersReturn {
    const [clientDuplicateWarning, setClientDuplicateWarning] = useState<string | null>(null)

    const handleClientSubmit = useCallback(async (
        e: React.FormEvent,
        selectedClient: Client | null,
        clientForm: Partial<Client>
    ) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formEl = e.currentTarget as HTMLFormElement
            const fd = new FormData(formEl)

            const firstName = String(fd.get("firstName") || "")
            const lastName = String(fd.get("lastName") || "")
            const emailVal = String(fd.get("email") || "")
            const phoneVal = String(fd.get("phone") || "")
            const addressVal = String(fd.get("address") || "")
            const dobVal = String(fd.get("dateOfBirth") || "")
            const emergencyRaw = String(fd.get("emergencyContact") || "")

            // Validation
            const emailOk = !emailVal || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)
            const phoneOk = !phoneVal || /\+?\d[\d\s-]{6,}$/.test(phoneVal)

            if (!emailOk || !phoneOk) {
                showNotification("error", "Please enter valid email and phone")
                setIsLoading(false)
                return
            }

            setClientDuplicateWarning(null)

            // Duplicate check
            const isEditing = Boolean(selectedClient?.id)
            const norm = (s: unknown) => String(s || "").trim().toLowerCase()
            const email = norm(emailVal)
            const phone = norm(phoneVal)
            const nameKey = `${norm(firstName)} ${norm(lastName)}`.trim()

            const duplicate = clients.find((c) => {
                if (isEditing && c.id === selectedClient!.id) return false
                const cEmail = norm(c.email)
                const cPhone = norm(c.phone)
                const cNameKey = `${norm(c.firstName)} ${norm(c.lastName)}`.trim()
                return (
                    (email && cEmail && email === cEmail) ||
                    (phone && cPhone && phone === cPhone) ||
                    (!email && !phone && nameKey && cNameKey && cNameKey === nameKey)
                )
            })

            if (duplicate) {
                const basis = email ? "email" : phone ? "phone" : "name"
                setClientDuplicateWarning(`A client with the same ${basis} already exists.`)
                showNotification("error", "Duplicate contact detected")
                setIsLoading(false)
                return
            }

            // Parse emergency contact
            const [ecName, ecPhoneRaw] = emergencyRaw.split("(")
            const emergencyName = String(ecName || "").trim()
            const emergencyPhone = String((ecPhoneRaw || "").replace(")", "")).trim()

            const overrides = {
                firstName,
                lastName,
                email: emailVal,
                phone: phoneVal,
                address: addressVal,
                dateOfBirth: dobVal,
                emergencyContact: emergencyName || emergencyPhone
                    ? { name: emergencyName, phone: emergencyPhone, relationship: "family" }
                    : clientForm.emergencyContact,
                preferences: clientForm.preferences,
            }

            const method = selectedClient ? "PATCH" : "POST"
            const payload = selectedClient
                ? { id: selectedClient.id, ...clientForm, ...overrides }
                : { ...clientForm, ...overrides }

            const res = await fetch("/api/admin/clients", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error("Failed to save client")

            // Refresh clients
            await clientService.fetchFromSupabase?.()
            setClients(clientService.getAllClients())

            // Log Activity
            const { logActivity } = await import('@/lib/audit-logger')
            await logActivity(
                selectedClient ? 'UPDATE_CLIENT' : 'CREATE_CLIENT',
                'Client Management',
                { 
                    id: selectedClient?.id || 'new', 
                    name: `${firstName} ${lastName}`,
                    email: emailVal
                }
            )

            // Handle conversation linking for new clients
            const link = typeof window !== "undefined"
                ? localStorage.getItem("potential_conversation_id")
                : null

            if (!selectedClient && link) {
                const all = clientService.getAllClients()
                const created = all[0]
                socialMediaService.setConversationClient(link, created.id)
                try {
                    localStorage.removeItem("potential_client_draft")
                    localStorage.removeItem("potential_conversation_id")
                } catch { }
            }

            showNotification(
                "success",
                selectedClient ? "Client updated successfully!" : "Client added successfully!"
            )

            setIsClientModalOpen(false)
            setClientForm({})
            setSelectedClient(null)
        } catch (error) {
            const { reportError } = await import('@/lib/client-logger')
            reportError(error, { 
                context: 'admin_client_submit_error', 
                meta: { selectedClient, clientForm } 
            })
            showNotification("error", "Failed to save client")
        } finally {
            setIsLoading(false)
        }
    }, [clients, setClients, setIsClientModalOpen, setClientForm, setSelectedClient, showNotification, setIsLoading])

    const openClientModal = useCallback((client?: Client) => {
        setClientDuplicateWarning(null)
        if (client) {
            setSelectedClient(client)
            setClientForm(client)
        } else {
            setSelectedClient(null)
            setClientForm({})
        }
        setIsClientModalOpen(true)
    }, [setSelectedClient, setClientForm, setIsClientModalOpen])

    const closeClientModal = useCallback(() => {
        setIsClientModalOpen(false)
        setClientForm({})
        setSelectedClient(null)
        setClientDuplicateWarning(null)
    }, [setIsClientModalOpen, setClientForm, setSelectedClient])

    const deleteClient = useCallback(async (clientId: string) => {
        setIsLoading(true)

        try {
            const res = await fetch("/api/admin/clients", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: clientId }),
            })

            if (!res.ok) throw new Error("Failed to delete client")

            await clientService.fetchFromSupabase?.()
            setClients(clientService.getAllClients())

            // Log Activity
            const { logActivity } = await import('@/lib/audit-logger')
            await logActivity('DELETE_CLIENT', 'Client Management', { id: clientId })

            showNotification("success", "Client deleted successfully!")
        } catch (error) {
            const { reportError } = await import('@/lib/client-logger')
            reportError(error, { 
                context: 'admin_client_delete_error', 
                meta: { clientId } 
            })
            showNotification("error", "Failed to delete client")
        } finally {
            setIsLoading(false)
        }
    }, [setClients, showNotification, setIsLoading])

    return {
        handleClientSubmit,
        openClientModal,
        closeClientModal,
        deleteClient,
        clientDuplicateWarning,
        setClientDuplicateWarning,
    }
}
