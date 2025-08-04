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

// Default portfolio data that will be used if localStorage is empty
const defaultPortfolioData: PortfolioItem[] = [
  {
    id: "1",
    title: "Nose Thread Lift Transformation",
    category: "Thread Lifts",
    subcategory: "Nose Enhancement",
    beforeImage: "/placeholder.svg?height=400&width=400",
    afterImage: "/placeholder.svg?height=400&width=400",
    description: "Complete nose reshaping using PDO threads for natural-looking enhancement",
    duration: "1 hour",
    price: "₱9,999",
    date: "2024-01-15",
    rating: 5,
    tags: ["Non-surgical", "Instant results", "Natural looking"],
    clientAge: "28",
    results: ["Higher nose bridge", "Defined tip", "Improved profile"],
    testimonial: "I'm absolutely amazed by the results! My nose looks so much better and natural.",
    clientInitials: "M.S.",
    status: "published",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Face Thread Lift - V-Shape Contour",
    category: "Thread Lifts",
    subcategory: "Face Contouring",
    beforeImage: "/placeholder.svg?height=400&width=400",
    afterImage: "/placeholder.svg?height=400&width=400",
    description: "Dramatic face lifting and contouring for youthful V-shaped jawline",
    duration: "1.5 hours",
    price: "₱15,000",
    date: "2024-01-10",
    rating: 5,
    tags: ["Anti-aging", "Lifting", "Contouring"],
    clientAge: "35",
    results: ["Lifted cheeks", "Defined jawline", "Reduced sagging"],
    testimonial: "The lifting effect is incredible! I look 10 years younger.",
    clientInitials: "A.R.",
    status: "published",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "3",
    title: "Lip Filler Enhancement",
    category: "Dermal Fillers",
    subcategory: "Lip Enhancement",
    beforeImage: "/placeholder.svg?height=400&width=400",
    afterImage: "/placeholder.svg?height=400&width=400",
    description: "Natural lip volume enhancement with hyaluronic acid fillers",
    duration: "45 minutes",
    price: "₱8,000",
    date: "2024-01-08",
    rating: 5,
    tags: ["Volume", "Natural", "Hydrating"],
    clientAge: "26",
    results: ["Fuller lips", "Better definition", "Natural shape"],
    testimonial: "My lips look so natural and beautiful! Everyone asks what I did.",
    clientInitials: "L.M.",
    status: "published",
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-08T10:00:00Z",
  },
  {
    id: "4",
    title: "Cheek Filler Contouring",
    category: "Dermal Fillers",
    subcategory: "Cheek Enhancement",
    beforeImage: "/placeholder.svg?height=400&width=400",
    afterImage: "/placeholder.svg?height=400&width=400",
    description: "Enhanced cheek definition and volume for youthful appearance",
    duration: "1 hour",
    price: "₱12,000",
    date: "2024-01-05",
    rating: 5,
    tags: ["Contouring", "Volume", "Anti-aging"],
    clientAge: "32",
    results: ["Higher cheekbones", "Better facial balance", "Youthful glow"],
    testimonial: "The contouring is perfect! My face looks so much more defined.",
    clientInitials: "S.T.",
    status: "published",
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
  },
  {
    id: "5",
    title: "Eyebrow Thread Lift",
    category: "Thread Lifts",
    subcategory: "Eyebrow Lift",
    beforeImage: "/placeholder.svg?height=400&width=400",
    afterImage: "/placeholder.svg?height=400&width=400",
    description: "Subtle eyebrow lifting for more youthful and alert appearance",
    duration: "45 minutes",
    price: "₱7,500",
    date: "2024-01-03",
    rating: 5,
    tags: ["Lifting", "Natural", "Quick recovery"],
    clientAge: "29",
    results: ["Lifted brows", "Open eyes", "Refreshed look"],
    testimonial: "Such a subtle but amazing difference! I look more awake and youthful.",
    clientInitials: "R.K.",
    status: "published",
    createdAt: "2024-01-03T10:00:00Z",
    updatedAt: "2024-01-03T10:00:00Z",
  },
  {
    id: "6",
    title: "Anti-Aging Skin Treatment",
    category: "Skin Treatments",
    subcategory: "Anti-Aging",
    beforeImage: "/placeholder.svg?height=400&width=400",
    afterImage: "/placeholder.svg?height=400&width=400",
    description: "Comprehensive anti-aging treatment for smoother, younger-looking skin",
    duration: "2 hours",
    price: "₱6,500",
    date: "2024-01-01",
    rating: 5,
    tags: ["Anti-aging", "Glowing skin", "Rejuvenation"],
    clientAge: "38",
    results: ["Smoother skin", "Reduced fine lines", "Brighter complexion"],
    testimonial: "My skin has never looked better! The glow is incredible.",
    clientInitials: "M.D.",
    status: "published",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "7",
    title: "Botox Wrinkle Reduction",
    category: "Botox",
    subcategory: "Wrinkle Reduction",
    beforeImage: "/placeholder.svg?height=400&width=400",
    afterImage: "/placeholder.svg?height=400&width=400",
    description: "Targeted Botox treatment for forehead lines and crow's feet",
    duration: "30 minutes",
    price: "₱5,500",
    date: "2023-12-28",
    rating: 5,
    tags: ["Botox", "Wrinkle reduction", "Quick treatment"],
    clientAge: "41",
    results: ["Smooth forehead", "Reduced crow's feet", "Natural expression"],
    testimonial: "Perfect results! I still look like me, just younger and refreshed.",
    clientInitials: "A.B.",
    status: "published",
    createdAt: "2023-12-28T10:00:00Z",
    updatedAt: "2023-12-28T10:00:00Z",
  },
  {
    id: "8",
    title: "Laser Hair Removal - Legs",
    category: "Laser Treatments",
    subcategory: "Hair Removal",
    beforeImage: "/placeholder.svg?height=400&width=400",
    afterImage: "/placeholder.svg?height=400&width=400",
    description: "Complete laser hair removal treatment for smooth, hair-free legs",
    duration: "1.5 hours",
    price: "₱4,500",
    date: "2023-12-25",
    rating: 5,
    tags: ["Laser", "Hair removal", "Long-lasting"],
    clientAge: "27",
    results: ["Hair-free legs", "Smooth skin", "Long-lasting results"],
    testimonial: "Finally! No more shaving. My legs are perfectly smooth.",
    clientInitials: "J.L.",
    status: "published",
    createdAt: "2023-12-25T10:00:00Z",
    updatedAt: "2023-12-25T10:00:00Z",
  },
  {
    id: "9",
    title: "Acne Treatment Program",
    category: "Skin Treatments",
    subcategory: "Acne Treatment",
    beforeImage: "/placeholder.svg?height=400&width=400",
    afterImage: "/placeholder.svg?height=400&width=400",
    description: "Comprehensive acne treatment program for clear, healthy skin",
    duration: "3 months program",
    price: "₱8,500",
    date: "2023-12-20",
    rating: 5,
    tags: ["Acne treatment", "Clear skin", "Confidence boost"],
    clientAge: "24",
    results: ["Clear skin", "Reduced scarring", "Improved confidence"],
    testimonial: "Life-changing! My skin is finally clear and I feel so confident.",
    clientInitials: "K.P.",
    status: "published",
    createdAt: "2023-12-20T10:00:00Z",
    updatedAt: "2023-12-20T10:00:00Z",
  },
  {
    id: "10",
    title: "Hair Growth Treatment",
    category: "Specialized Treatments",
    subcategory: "Hair Growth",
    beforeImage: "/placeholder.svg?height=400&width=400",
    afterImage: "/placeholder.svg?height=400&width=400",
    description: "Advanced hair growth treatment for thicker, fuller hair",
    duration: "6 months program",
    price: "₱15,500",
    date: "2023-12-15",
    rating: 5,
    tags: ["Hair growth", "Fuller hair", "Confidence"],
    clientAge: "35",
    results: ["Thicker hair", "Reduced hair loss", "Fuller coverage"],
    testimonial: "Amazing results! My hair is so much thicker and healthier now.",
    clientInitials: "D.R.",
    status: "published",
    createdAt: "2023-12-15T10:00:00Z",
    updatedAt: "2023-12-15T10:00:00Z",
  },
  {
    id: "11",
    title: "Body Contouring - Waist",
    category: "Dermal Fillers",
    subcategory: "Body Contouring",
    beforeImage: "/placeholder.svg?height=400&width=400",
    afterImage: "/placeholder.svg?height=400&width=400",
    description: "Non-surgical body contouring for a more defined waistline",
    duration: "2 hours",
    price: "₱18,000",
    date: "2023-12-10",
    rating: 5,
    tags: ["Body contouring", "Non-surgical", "Confidence boost"],
    clientAge: "30",
    results: ["Slimmer waist", "Better curves", "Improved confidence"],
    testimonial: "I love my new silhouette! The results are exactly what I wanted.",
    clientInitials: "N.V.",
    status: "published",
    createdAt: "2023-12-10T10:00:00Z",
    updatedAt: "2023-12-10T10:00:00Z",
  },
  {
    id: "12",
    title: "Pigmentation Treatment",
    category: "Skin Treatments",
    subcategory: "Pigmentation",
    beforeImage: "/placeholder.svg?height=400&width=400",
    afterImage: "/placeholder.svg?height=400&width=400",
    description: "Advanced pigmentation treatment for even, radiant skin tone",
    duration: "4 sessions",
    price: "₱9,500",
    date: "2023-12-05",
    rating: 5,
    tags: ["Pigmentation", "Even skin tone", "Radiant skin"],
    clientAge: "33",
    results: ["Even skin tone", "Reduced dark spots", "Radiant complexion"],
    testimonial: "My skin tone is so much more even now. I barely need makeup!",
    clientInitials: "C.H.",
    status: "published",
    createdAt: "2023-12-05T10:00:00Z",
    updatedAt: "2023-12-05T10:00:00Z",
  },
]

// Portfolio service class for managing data with localStorage persistence
export class PortfolioService {
  private static readonly STORAGE_KEY = "skin_essentials_portfolio_data"
  private static readonly UPDATE_EVENT = "portfolio_data_updated"
  private static data: PortfolioItem[] = []
  private static initialized = false

  // Initialize data from localStorage or use defaults
  private static initialize() {
    if (this.initialized) return

    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (stored) {
          this.data = JSON.parse(stored)
          console.log("Portfolio data loaded from localStorage:", this.data.length, "items")
        } else {
          // First time - use default data and save to localStorage
          this.data = [...defaultPortfolioData]
          this.saveToStorage()
          console.log("Portfolio data initialized with defaults:", this.data.length, "items")
        }
      } else {
        // Server-side - use default data
        this.data = [...defaultPortfolioData]
      }
    } catch (error) {
      console.error("Error loading portfolio data from localStorage:", error)
      // Fallback to default data
      this.data = [...defaultPortfolioData]
    }

    this.initialized = true
  }

  // Save data to localStorage
  private static saveToStorage() {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data))
        console.log("Portfolio data saved to localStorage:", this.data.length, "items")

        // Trigger custom event for cross-component communication
        window.dispatchEvent(
          new CustomEvent(this.UPDATE_EVENT, {
            detail: { data: this.data },
          }),
        )
      }
    } catch (error) {
      console.error("Error saving portfolio data to localStorage:", error)
    }
  }

  // Get all portfolio items
  static getAllItems(): PortfolioItem[] {
    this.initialize()
    return [...this.data]
  }

  // Get published items only (for public portfolio)
  static getPublishedItems(): PortfolioItem[] {
    this.initialize()
    return this.data.filter((item) => item.status === "published")
  }

  // Get item by ID
  static getItemById(id: string): PortfolioItem | undefined {
    this.initialize()
    return this.data.find((item) => item.id === id)
  }

  // Add new item
  static addItem(item: Omit<PortfolioItem, "id" | "createdAt" | "updatedAt">): PortfolioItem {
    this.initialize()
    const newItem: PortfolioItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.data.push(newItem)
    this.saveToStorage()
    console.log("Added new portfolio item:", newItem.title)
    return newItem
  }

  // Update item
  static updateItem(id: string, updates: Partial<PortfolioItem>): PortfolioItem | null {
    this.initialize()
    const index = this.data.findIndex((item) => item.id === id)
    if (index === -1) return null

    this.data[index] = {
      ...this.data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.saveToStorage()
    console.log("Updated portfolio item:", this.data[index].title)
    return this.data[index]
  }

  // Delete item
  static deleteItem(id: string): boolean {
    this.initialize()
    const index = this.data.findIndex((item) => item.id === id)
    if (index === -1) return false

    const deletedItem = this.data[index]
    this.data.splice(index, 1)
    this.saveToStorage()
    console.log("Deleted portfolio item:", deletedItem.title)
    return true
  }

  // Filter items
  static filterItems(filters: {
    category?: string
    status?: string
    search?: string
  }): PortfolioItem[] {
    this.initialize()
    let filtered = [...this.data]

    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((item) => item.category === filters.category)
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((item) => item.status === filters.status)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    return filtered
  }

  // Get statistics
  static getStats() {
    this.initialize()
    const total = this.data.length
    const published = this.data.filter((item) => item.status === "published").length
    const draft = this.data.filter((item) => item.status === "draft").length
    const archived = this.data.filter((item) => item.status === "archived").length

    return { total, published, draft, archived }
  }

  // Reset to default data (useful for testing)
  static resetToDefaults() {
    this.data = [...defaultPortfolioData]
    this.saveToStorage()
    console.log("Portfolio data reset to defaults")
  }

  // Clear all data
  static clearAll() {
    this.data = []
    this.saveToStorage()
    console.log("Portfolio data cleared")
  }

  // Export data as JSON
  static exportData(): string {
    this.initialize()
    return JSON.stringify(this.data, null, 2)
  }

  // Import data from JSON
  static importData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData) as PortfolioItem[]
      if (Array.isArray(imported)) {
        this.data = imported
        this.saveToStorage()
        console.log("Portfolio data imported:", imported.length, "items")
        return true
      }
      return false
    } catch (error) {
      console.error("Error importing data:", error)
      return false
    }
  }

  // Force refresh from localStorage (useful for debugging)
  static forceRefresh() {
    this.initialized = false
    this.initialize()
    console.log("Portfolio data force refreshed")
  }

  // Subscribe to data updates
  static onUpdate(callback: (data: PortfolioItem[]) => void) {
    if (typeof window !== "undefined") {
      const handler = (event: CustomEvent) => {
        callback(event.detail.data)
      }
      window.addEventListener(this.UPDATE_EVENT, handler as EventListener)

      // Return cleanup function
      return () => {
        window.removeEventListener(this.UPDATE_EVENT, handler as EventListener)
      }
    }
    return () => {}
  }
}
