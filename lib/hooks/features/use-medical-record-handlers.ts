"use client"

import { useCallback } from "react"
import type { MedicalRecord } from "@/lib/types/admin.types"
import { staffService } from "@/lib/services/admin"

interface MedicalRecordFormState {
    chiefComplaintText: string
    medicalHistoryText: string
    allergiesText: string
    currentMedicationsText: string
    treatmentPlanText: string
    notesText: string
}

interface UseMedicalRecordHandlersProps {
    setMedicalRecords?: (records: MedicalRecord[]) => void
    refreshMedicalRecords: () => Promise<void>
    setStaff: (staff: any[]) => void
    setIsMedicalRecordModalOpen: (open: boolean) => void
    setMedicalRecordForm: (form: Partial<MedicalRecord> | ((prev: Partial<MedicalRecord>) => Partial<MedicalRecord>)) => void
    setSelectedMedicalRecord: (record: MedicalRecord | null) => void
    showNotification: (type: "success" | "error" | "info", message: string) => void
    setIsLoading: (loading: boolean) => void
    resetFormTexts: () => void
}

interface UseMedicalRecordHandlersReturn {
    handleMedicalRecordSubmit: (
        e: React.FormEvent,
        selectedMedicalRecord: MedicalRecord | null,
        medicalRecordForm: Partial<MedicalRecord>
    ) => Promise<void>
    openMedicalRecordModal: (record?: MedicalRecord) => void
    closeMedicalRecordModal: () => void
    deleteMedicalRecord: (recordId: string) => Promise<void>
}

/**
 * Hook for managing medical record operations
 * Extracted from AdminDashboard to follow SRP
 */
export function useMedicalRecordHandlers({
    refreshMedicalRecords,
    setStaff,
    setIsMedicalRecordModalOpen,
    setMedicalRecordForm,
    setSelectedMedicalRecord,
    showNotification,
    setIsLoading,
    resetFormTexts,
}: UseMedicalRecordHandlersProps): UseMedicalRecordHandlersReturn {

    const handleMedicalRecordSubmit = useCallback(async (
        e: React.FormEvent,
        selectedMedicalRecord: MedicalRecord | null,
        medicalRecordForm: Partial<MedicalRecord>
    ) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const method = selectedMedicalRecord ? "PATCH" : "POST"
            const formEl = e.currentTarget as HTMLFormElement
            const fd = new FormData(formEl)

            const chiefComplaint = String(fd.get("chiefComplaint") || "")
            const treatmentPlan = String(fd.get("treatmentPlan") || "")
            const notes = String(fd.get("notes") || "")
            const medicalHistoryRaw = String(fd.get("medicalHistory") || "")
            const allergiesRaw = String(fd.get("allergies") || "")
            const currentMedicationsRaw = String(fd.get("currentMedications") || "")

            const payloadBase = selectedMedicalRecord
                ? { id: selectedMedicalRecord.id, ...medicalRecordForm }
                : medicalRecordForm

            const payload = {
                ...payloadBase,
                chiefComplaint,
                treatmentPlan,
                notes,
                medicalHistory: medicalHistoryRaw.split("\n").filter((item) => item.trim()),
                allergies: allergiesRaw.split("\n").filter((item) => item.trim()),
                currentMedications: currentMedicationsRaw.split("\n").filter((item) => item.trim()),
            }

            // Get CSRF token
            const csrf = typeof document !== "undefined"
                ? (document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] || "")
                : ""

            const res = await fetch("/api/admin/medical-records", {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrf,
                },
                credentials: "include",
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error("Failed to save medical record")

            // Handle treatments sync
            try {
                const json = await res.json()
                const recordId = json?.record?.id || selectedMedicalRecord?.id
                const treatments = Array.isArray(medicalRecordForm.treatments)
                    ? medicalRecordForm.treatments
                    : []

                if (recordId && treatments.length > 0) {
                    const csrf2 = typeof document !== "undefined"
                        ? (document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] || "")
                        : ""

                    await fetch("/api/admin/treatments", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-csrf-token": csrf2,
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            medicalRecordId: recordId,
                            clientId: medicalRecordForm.clientId,
                            treatments,
                        }),
                    })
                }
            } catch (err) {
                console.error("Treatment sync error:", err)
            }

            // Refresh data
            await refreshMedicalRecords()
            await staffService.fetchFromSupabase?.()
            setStaff(staffService.getAllStaff())

            showNotification(
                "success",
                selectedMedicalRecord
                    ? "Medical record updated successfully!"
                    : "Medical record created successfully!"
            )

            // Log Activity
            const { logActivity } = await import('@/lib/audit-logger')
            await logActivity(
                selectedMedicalRecord ? 'UPDATE_MEDICAL_RECORD' : 'CREATE_MEDICAL_RECORD',
                'Medical Records',
                { 
                    id: selectedMedicalRecord?.id || 'new', 
                    clientId: medicalRecordForm.clientId,
                    date: medicalRecordForm.date
                }
            )

            // Reset form state
            setIsMedicalRecordModalOpen(false)
            setMedicalRecordForm({})
            resetFormTexts()
            setSelectedMedicalRecord(null)
        } catch (error) {
            const { reportError } = await import('@/lib/client-logger')
            reportError(error, { 
                context: 'admin_medical_record_submit_error', 
                meta: { selectedMedicalRecord, medicalRecordForm } 
            })
            showNotification("error", "Failed to save medical record")
        } finally {
            setIsLoading(false)
        }
    }, [
        refreshMedicalRecords,
        setStaff,
        setIsMedicalRecordModalOpen,
        setMedicalRecordForm,
        setSelectedMedicalRecord,
        showNotification,
        setIsLoading,
        resetFormTexts,
    ])

    const openMedicalRecordModal = useCallback((record?: MedicalRecord) => {
        if (record) {
            setSelectedMedicalRecord(record)
            setMedicalRecordForm(record)
        } else {
            setSelectedMedicalRecord(null)
            setMedicalRecordForm({})
        }
        setIsMedicalRecordModalOpen(true)
    }, [setSelectedMedicalRecord, setMedicalRecordForm, setIsMedicalRecordModalOpen])

    const closeMedicalRecordModal = useCallback(() => {
        setIsMedicalRecordModalOpen(false)
        setMedicalRecordForm({})
        resetFormTexts()
        setSelectedMedicalRecord(null)
    }, [setIsMedicalRecordModalOpen, setMedicalRecordForm, resetFormTexts, setSelectedMedicalRecord])

    const deleteMedicalRecord = useCallback(async (recordId: string) => {
        setIsLoading(true)

        try {
            const csrf = typeof document !== "undefined"
                ? (document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] || "")
                : ""

            const res = await fetch("/api/admin/medical-records", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrf,
                },
                credentials: "include",
                body: JSON.stringify({ id: recordId }),
            })

            if (!res.ok) throw new Error("Failed to delete medical record")

            await refreshMedicalRecords()
            showNotification("success", "Medical record deleted successfully!")

            // Log Activity
            const { logActivity } = await import('@/lib/audit-logger')
            await logActivity('DELETE_MEDICAL_RECORD', 'Medical Records', { id: recordId })
        } catch (error) {
            const { reportError } = await import('@/lib/client-logger')
            reportError(error, { 
                context: 'admin_medical_record_delete_error', 
                meta: { recordId } 
            })
            showNotification("error", "Failed to delete medical record")
        } finally {
            setIsLoading(false)
        }
    }, [refreshMedicalRecords, showNotification, setIsLoading])

    return {
        handleMedicalRecordSubmit,
        openMedicalRecordModal,
        closeMedicalRecordModal,
        deleteMedicalRecord,
    }
}
