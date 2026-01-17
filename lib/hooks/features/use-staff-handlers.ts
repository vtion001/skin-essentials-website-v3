"use client"

import { useCallback } from "react"
import type { Staff } from "@/lib/types/admin.types"
import { staffService } from "@/lib/services/admin"

interface UseStaffHandlersProps {
    setStaff: (staff: Staff[]) => void
    setIsStaffModalOpen: (open: boolean) => void
    setStaffForm: (form: Partial<Staff> | ((prev: Partial<Staff>) => Partial<Staff>)) => void
    setSelectedStaff: (staff: Staff | null) => void
    showNotification: (type: "success" | "error" | "info", message: string) => void
    setIsLoading: (loading: boolean) => void
}

interface UseStaffHandlersReturn {
    handleStaffSubmit: (
        e: React.FormEvent,
        selectedStaff: Staff | null,
        staffForm: Partial<Staff>
    ) => Promise<void>
    openStaffModal: (staff?: Staff) => void
    closeStaffModal: () => void
    deleteStaff: (staffId: string) => Promise<void>
    parseStaffFormData: (fd: FormData) => StaffFormData
    isValidContact: (email: string, phone: string) => boolean
    buildStaffPayload: (
        selectedStaff: { id: string } | null,
        staffForm: Record<string, unknown>,
        overrides: Record<string, unknown>
    ) => Record<string, unknown>
}

interface StaffFormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    department: string
    licenseNumber: string
    hireDate: string
    specialties: string[]
    notes: string
}

/**
 * Hook for managing staff operations
 * Extracted from AdminDashboard to follow SRP
 */
export function useStaffHandlers({
    setStaff,
    setIsStaffModalOpen,
    setStaffForm,
    setSelectedStaff,
    showNotification,
    setIsLoading,
}: UseStaffHandlersProps): UseStaffHandlersReturn {

    const parseStaffFormData = useCallback((fd: FormData): StaffFormData => {
        const firstName = String(fd.get("staffFirstName") || "")
        const lastName = String(fd.get("staffLastName") || "")
        const email = String(fd.get("staffEmail") || "")
        const phone = String(fd.get("staffPhone") || "")
        const department = String(fd.get("staffDepartment") || "")
        const licenseNumber = String(fd.get("licenseNumber") || "")
        const hireDate = String(fd.get("hireDate") || "")
        const specialtiesRaw = String(fd.get("specialties") || "")
        const notes = String(fd.get("staffNotes") || "")
        return {
            firstName,
            lastName,
            email,
            phone,
            department,
            licenseNumber,
            hireDate,
            specialties: specialtiesRaw.split("\n").filter((i) => i.trim()),
            notes,
        }
    }, [])

    const isValidContact = useCallback((email: string, phone: string): boolean => {
        const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        const phoneOk = !phone || /\+?\d[\d\s-]{6,}$/.test(phone)
        return emailOk && phoneOk
    }, [])

    const buildStaffPayload = useCallback((
        selectedStaff: { id: string } | null,
        staffForm: Record<string, unknown>,
        overrides: Record<string, unknown>
    ): Record<string, unknown> => {
        return selectedStaff
            ? { id: selectedStaff.id, ...staffForm, ...overrides }
            : { ...staffForm, ...overrides }
    }, [])

    const handleStaffSubmit = useCallback(async (
        e: React.FormEvent,
        selectedStaff: Staff | null,
        staffForm: Partial<Staff>
    ) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formEl = e.currentTarget as HTMLFormElement
            const fd = new FormData(formEl)
            const parsed = parseStaffFormData(fd)

            if (!isValidContact(parsed.email, parsed.phone)) {
                showNotification("error", "Please enter valid email and phone")
                setIsLoading(false)
                return
            }

            const method = selectedStaff ? "PATCH" : "POST"
            const payload = buildStaffPayload(selectedStaff, staffForm as Record<string, unknown>, parsed as unknown as Record<string, unknown>)

            const res = await fetch("/api/admin/staff", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error("Failed to save staff")

            // Update treatments if needed
            try {
                const json = await res.json()
                if (method === "POST" && json?.staff?.id) {
                    staffService.updateStaff(json.staff.id, { treatments: staffForm.treatments || [] })
                }
                if (method === "PATCH" && selectedStaff?.id) {
                    staffService.updateStaff(selectedStaff.id, { treatments: staffForm.treatments || [] })
                }
            } catch { }

            // Refresh staff list
            await staffService.fetchFromSupabase?.()
            setStaff(staffService.getAllStaff())

            showNotification(
                "success",
                selectedStaff ? "Staff updated successfully!" : "Staff added successfully!"
            )

            setIsStaffModalOpen(false)
            setStaffForm({})
            setSelectedStaff(null)
        } catch (error) {
            const { reportError } = await import('@/lib/client-logger')
            reportError(error, { 
                context: 'admin_staff_submit_error', 
                meta: { selectedStaff, staffForm } 
            })
            showNotification("error", "Failed to save staff")
        } finally {
            setIsLoading(false)
        }
    }, [
        setStaff,
        setIsStaffModalOpen,
        setStaffForm,
        setSelectedStaff,
        showNotification,
        setIsLoading,
        parseStaffFormData,
        isValidContact,
        buildStaffPayload,
    ])

    const openStaffModal = useCallback((staff?: Staff) => {
        if (staff) {
            setSelectedStaff(staff)
            setStaffForm(staff)
        } else {
            setSelectedStaff(null)
            setStaffForm({})
        }
        setIsStaffModalOpen(true)
    }, [setSelectedStaff, setStaffForm, setIsStaffModalOpen])

    const closeStaffModal = useCallback(() => {
        setIsStaffModalOpen(false)
        setStaffForm({})
        setSelectedStaff(null)
    }, [setIsStaffModalOpen, setStaffForm, setSelectedStaff])

    const deleteStaff = useCallback(async (staffId: string) => {
        setIsLoading(true)

        try {
            const res = await fetch("/api/admin/staff", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: staffId }),
            })

            if (!res.ok) throw new Error("Failed to delete staff")

            await staffService.fetchFromSupabase?.()
            setStaff(staffService.getAllStaff())
            showNotification("success", "Staff deleted successfully!")
        } catch (error) {
            const { reportError } = await import('@/lib/client-logger')
            reportError(error, { 
                context: 'admin_staff_delete_error', 
                meta: { staffId } 
            })
            showNotification("error", "Failed to delete staff")
        } finally {
            setIsLoading(false)
        }
    }, [setStaff, showNotification, setIsLoading])

    return {
        handleStaffSubmit,
        openStaffModal,
        closeStaffModal,
        deleteStaff,
        parseStaffFormData,
        isValidContact,
        buildStaffPayload,
    }
}
