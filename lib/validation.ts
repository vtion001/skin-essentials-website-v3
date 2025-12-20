import { z } from 'zod'

export const ServiceFAQSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
})

export const ServiceSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  description: z.string().min(1),
  duration: z.string().optional(),
  results: z.string().optional(),
  sessions: z.string().optional(),
  includes: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  faqs: z.array(ServiceFAQSchema).optional(),
  originalPrice: z.string().optional(),
  badge: z.string().optional(),
  pricing: z.string().optional(),
  image: z.string().optional(),
})

export const ServiceCategorySchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  image: z.string().optional(),
  color: z.string().optional(),
  services: z.array(ServiceSchema),
})

