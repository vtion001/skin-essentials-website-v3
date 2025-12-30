// Admin Services Barrel Export
// Re-exports all admin service instances and types for backward compatibility

// Types
export * from '@/lib/types/admin.types'

// Services
export { appointmentService } from './appointment.service'
export { paymentService } from './payment.service'
export { medicalRecordService } from './medical-record.service'
export { clientService } from './client.service'
export { staffService } from './staff.service'
export { influencerService } from './influencer.service'
export { socialMediaService } from './social-media.service'
