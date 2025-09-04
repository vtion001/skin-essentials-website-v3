export interface PortfolioItem {
  id: string
  title: string
  category: string
  beforeImage: string
  afterImage: string
  description: string
  treatment: string
  duration: string
  results: string
}

class PortfolioService {
  private items: PortfolioItem[] = []
  private initialized = false
  private subscribers: ((items: PortfolioItem[]) => void)[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("portfolio_data")
      if (stored) {
        this.items = JSON.parse(stored)
        console.log("Portfolio data loaded from localStorage:", this.items.length, "items")
      } else {
        this.items = this.getDefaultItems()
        this.saveToStorage()
        console.log("Default portfolio data initialized:", this.items.length, "items")
      }
      this.initialized = true
    } catch (error) {
      console.error("Error loading portfolio data from localStorage:", error)
      this.items = this.getDefaultItems()
      this.initialized = true
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem("portfolio_data", JSON.stringify(this.items))
      console.log("Portfolio data saved to localStorage:", this.items.length, "items")

      // Notify subscribers with custom event for same-tab updates
      this.notifySubscribers()

      // Dispatch custom event for cross-component communication
      window.dispatchEvent(
        new CustomEvent("portfolio_data_updated", {
          detail: { items: this.items },
        }),
      )
    } catch (error) {
      console.error("Error saving portfolio data to localStorage:", error)
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => {
      try {
        callback([...this.items])
      } catch (error) {
        console.error("Error notifying subscriber:", error)
      }
    })
  }

  subscribe(callback: (items: PortfolioItem[]) => void) {
    this.subscribers.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  getAllItems(): PortfolioItem[] {
    if (!this.initialized && typeof window !== "undefined") {
      this.loadFromStorage()
    }
    return [...this.items]
  }

  getItemById(id: string): PortfolioItem | undefined {
    return this.items.find((item) => item.id === id)
  }

  updateItem(id: string, updates: Partial<PortfolioItem>): boolean {
    const index = this.items.findIndex((item) => item.id === id)
    if (index === -1) return false

    this.items[index] = { ...this.items[index], ...updates }
    console.log("Updated portfolio item:", this.items[index].title)
    this.saveToStorage()
    return true
  }

  addItem(item: Omit<PortfolioItem, "id">): PortfolioItem {
    const newItem: PortfolioItem = {
      ...item,
      id: Date.now().toString(),
    }
    this.items.push(newItem)
    console.log("Added new portfolio item:", newItem.title)
    this.saveToStorage()
    return newItem
  }

  deleteItem(id: string): boolean {
    const index = this.items.findIndex((item) => item.id === id)
    if (index === -1) return false

    const deletedItem = this.items.splice(index, 1)[0]
    console.log("Deleted portfolio item:", deletedItem.title)
    this.saveToStorage()
    return true
  }

  private getDefaultItems(): PortfolioItem[] {
    return [
      {
        id: "1",
        title: "Nose Thread Lift Transformation",
        category: "Thread Lift",
        beforeImage: "/placeholder.svg?height=400&width=300&text=Before+Nose",
        afterImage: "/placeholder.svg?height=400&width=300&text=After+Nose",
        description: "Dramatic nose bridge enhancement using PDO threads for a more defined profile.",
        treatment: "Hiko Nose Thread Lift",
        duration: "1 hour",
        results: "1-2 years",
      },
      {
        id: "2",
        title: "Face Thread Lift Results",
        category: "Thread Lift",
        beforeImage: "/placeholder.svg?height=400&width=300&text=Before+Face",
        afterImage: "/placeholder.svg?height=400&width=300&text=After+Face",
        description: "V-shaped facial contouring achieved through strategic thread placement.",
        treatment: "Face Thread Lift",
        duration: "1.5 hours",
        results: "12-18 months",
      },
      {
        id: "3",
        title: "Lip Filler Enhancement",
        category: "Dermal Fillers",
        beforeImage: "/placeholder.svg?height=400&width=300&text=Before+Lips",
        afterImage: "/placeholder.svg?height=400&width=300&text=After+Lips",
        description: "Natural lip volume enhancement with hyaluronic acid fillers.",
        treatment: "Lip Fillers",
        duration: "45 minutes",
        results: "6-12 months",
      },
      {
        id: "4",
        title: "Cheek Augmentation",
        category: "Dermal Fillers",
        beforeImage: "/placeholder.svg?height=400&width=300&text=Before+Cheeks",
        afterImage: "/placeholder.svg?height=400&width=300&text=After+Cheeks",
        description: "Enhanced cheek definition and volume for a youthful appearance.",
        treatment: "Cheek Fillers",
        duration: "1 hour",
        results: "12-18 months",
      },
      {
        id: "5",
        title: "Vampire Facial Glow",
        category: "Skin Treatment",
        beforeImage: "/placeholder.svg?height=400&width=300&text=Before+Skin",
        afterImage: "/placeholder.svg?height=400&width=300&text=After+Skin",
        description: "Radiant skin transformation through PRP and microneedling treatment.",
        treatment: "Vampire Facial",
        duration: "1 hour",
        results: "3-6 months",
      },
      {
        id: "6",
        title: "Laser Hair Removal",
        category: "Laser Treatment",
        beforeImage: "/placeholder.svg?height=400&width=300&text=Before+Hair",
        afterImage: "/placeholder.svg?height=400&width=300&text=After+Hair",
        description: "Permanent hair reduction on underarms using diode laser technology.",
        treatment: "Diode Laser Hair Removal",
        duration: "30 minutes",
        results: "Permanent",
      },
      {
        id: "7",
        title: "Jawline Contouring",
        category: "Dermal Fillers",
        beforeImage: "/placeholder.svg?height=400&width=300&text=Before+Jaw",
        afterImage: "/placeholder.svg?height=400&width=300&text=After+Jaw",
        description: "Defined masculine jawline achieved with strategic filler placement.",
        treatment: "Jawline Fillers",
        duration: "1 hour",
        results: "12-18 months",
      },
      {
        id: "8",
        title: "Under Eye Treatment",
        category: "Dermal Fillers",
        beforeImage: "/placeholder.svg?height=400&width=300&text=Before+Eyes",
        afterImage: "/placeholder.svg?height=400&width=300&text=After+Eyes",
        description: "Reduced dark circles and bags with tear trough filler treatment.",
        treatment: "Under Eye Fillers",
        duration: "45 minutes",
        results: "9-12 months",
      },
      {
        id: "9",
        title: "Skin Tightening Results",
        category: "Skin Treatment",
        beforeImage: "/placeholder.svg?height=400&width=300&text=Before+Tight",
        afterImage: "/placeholder.svg?height=400&width=300&text=After+Tight",
        description: "Firmer, tighter skin achieved through Thermage RF treatment.",
        treatment: "Thermage",
        duration: "1.5 hours",
        results: "6-12 months",
      },
      {
        id: "10",
        title: "Pigmentation Removal",
        category: "Laser Treatment",
        beforeImage: "/placeholder.svg?height=400&width=300&text=Before+Pigment",
        afterImage: "/placeholder.svg?height=400&width=300&text=After+Pigment",
        description: "Clear, even skin tone achieved with Pico laser treatment.",
        treatment: "Pico Laser",
        duration: "45 minutes",
        results: "3-6 months",
      },
      {
        id: "11",
        title: "Neck Thread Lift",
        category: "Thread Lift",
        beforeImage: "/placeholder.svg?height=400&width=300&text=Before+Neck",
        afterImage: "/placeholder.svg?height=400&width=300&text=After+Neck",
        description: "Lifted and tightened neck area using PDO thread technology.",
        treatment: "Neck Thread Lift",
        duration: "1 hour",
        results: "12-18 months",
      },
      {
        id: "12",
        title: "Full Face Rejuvenation",
        category: "Combination",
        beforeImage: "/placeholder.svg?height=400&width=300&text=Before+Full",
        afterImage: "/placeholder.svg?height=400&width=300&text=After+Full",
        description: "Complete facial transformation combining multiple treatments.",
        treatment: "Thread Lift + Fillers + Botox",
        duration: "3 hours",
        results: "12-24 months",
      },
    ]
  }
}

export const portfolioService = new PortfolioService()
