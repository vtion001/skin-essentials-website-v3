// Payment Service
// Extracted from lib/admin-services.ts following SRP

import type { Payment } from '@/lib/types/admin.types'

class PaymentService {
    private payments: Payment[] = []
    private initialized = false

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadFromStorage()
        }
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem('payments_data')
            if (stored) {
                this.payments = JSON.parse(stored)
            } else {
                this.payments = this.getDefaultPayments()
                this.saveToStorage()
            }
            this.initialized = true
        } catch (error) {
            console.error('Error loading payments:', error)
            this.payments = this.getDefaultPayments()
            this.initialized = true
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem('payments_data', JSON.stringify(this.payments))
        } catch (error) {
            console.error('Error saving payments:', error)
        }
    }

    private getDefaultPayments(): Payment[] {
        return [
            {
                id: '1',
                appointmentId: '1',
                clientId: 'client1',
                amount: 500,
                method: 'gcash',
                status: 'completed',
                transactionId: 'GC123456789',
                uploadedFiles: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]
    }

    getAllPayments(): Payment[] {
        if (!this.initialized) this.loadFromStorage()
        return [...this.payments]
    }

    addPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment {
        const newPayment: Payment = {
            ...payment,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        this.payments.push(newPayment)
        this.saveToStorage()
        return newPayment
    }

    updatePayment(id: string, updates: Partial<Payment>): boolean {
        const index = this.payments.findIndex((payment) => payment.id === id)
        if (index === -1) return false

        this.payments[index] = {
            ...this.payments[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        }
        this.saveToStorage()
        return true
    }
}

export const paymentService = new PaymentService()
