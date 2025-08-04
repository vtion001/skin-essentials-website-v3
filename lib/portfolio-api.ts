// Portfolio API utilities for handling image uploads and data management

export interface PortfolioItem {
  id: string
  title: string
  category: string
  subcategory: string
  beforeImage: string
  afterImage: string
  description: string
  duration: string
  price: string
  date: string
  rating: number
  tags: string[]
  clientAge: string
  results: string[]
  testimonial?: string
  clientInitials?: string
  status: "published" | "draft" | "archived"
  createdAt: string
  updatedAt: string
}

export class PortfolioAPI {
  private static baseUrl = "/api/portfolio"

  // Upload image to server/CDN
  static async uploadImage(file: File, type: "before" | "after"): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Image upload error:", error)
      throw new Error("Failed to upload image")
    }
  }

  // Get all portfolio items
  static async getPortfolioItems(): Promise<PortfolioItem[]> {
    try {
      const response = await fetch(this.baseUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio items")
      }
      return await response.json()
    } catch (error) {
      console.error("Fetch portfolio items error:", error)
      throw error
    }
  }

  // Get single portfolio item
  static async getPortfolioItem(id: string): Promise<PortfolioItem> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio item")
      }
      return await response.json()
    } catch (error) {
      console.error("Fetch portfolio item error:", error)
      throw error
    }
  }

  // Create new portfolio item
  static async createPortfolioItem(
    item: Omit<PortfolioItem, "id" | "createdAt" | "updatedAt">,
  ): Promise<PortfolioItem> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      })

      if (!response.ok) {
        throw new Error("Failed to create portfolio item")
      }

      return await response.json()
    } catch (error) {
      console.error("Create portfolio item error:", error)
      throw error
    }
  }

  // Update portfolio item
  static async updatePortfolioItem(id: string, item: Partial<PortfolioItem>): Promise<PortfolioItem> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      })

      if (!response.ok) {
        throw new Error("Failed to update portfolio item")
      }

      return await response.json()
    } catch (error) {
      console.error("Update portfolio item error:", error)
      throw error
    }
  }

  // Delete portfolio item
  static async deletePortfolioItem(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete portfolio item")
      }
    } catch (error) {
      console.error("Delete portfolio item error:", error)
      throw error
    }
  }

  // Bulk operations
  static async bulkUpdateStatus(ids: string[], status: PortfolioItem["status"]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/bulk-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids, status }),
      })

      if (!response.ok) {
        throw new Error("Failed to bulk update items")
      }
    } catch (error) {
      console.error("Bulk update error:", error)
      throw error
    }
  }

  // Export portfolio data
  static async exportPortfolio(format: "json" | "csv" = "json"): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/export?format=${format}`)
      if (!response.ok) {
        throw new Error("Failed to export portfolio")
      }
      return await response.blob()
    } catch (error) {
      console.error("Export portfolio error:", error)
      throw error
    }
  }

  // Image optimization utilities
  static optimizeImageUrl(url: string, width?: number, height?: number, quality?: number): string {
    if (!url) return url

    const params = new URLSearchParams()
    if (width) params.append("w", width.toString())
    if (height) params.append("h", height.toString())
    if (quality) params.append("q", quality.toString())

    const separator = url.includes("?") ? "&" : "?"
    return params.toString() ? `${url}${separator}${params.toString()}` : url
  }

  // Generate thumbnail
  static getThumbnailUrl(url: string): string {
    return this.optimizeImageUrl(url, 300, 200, 80)
  }

  // Validate image file
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Invalid file type. Please upload JPEG, PNG, or WebP images." }
    }

    if (file.size > maxSize) {
      return { valid: false, error: "File size too large. Please upload images smaller than 10MB." }
    }

    return { valid: true }
  }
}
