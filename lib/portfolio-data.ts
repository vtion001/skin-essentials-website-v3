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

const PORTFOLIO_DATA_VERSION = 2

class PortfolioService {
  private items: PortfolioItem[] = []
  private initialized = false
  private subscribers: ((items: PortfolioItem[]) => void)[] = []
  private storageKey = "portfolio_data"
  private versionKey = "portfolio_data_version"

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const storedVersion = localStorage.getItem(this.versionKey)
      const stored = localStorage.getItem(this.storageKey)

      const versionMismatch = storedVersion !== String(PORTFOLIO_DATA_VERSION)

      if (stored && !versionMismatch) {
        this.items = JSON.parse(stored)
        console.log("Portfolio data loaded from localStorage:", this.items.length, "items")
      } else {
        // Initialize defaults when first load or version changes
        this.items = this.getDefaultItems()
        this.saveToStorage()
        console.log(
          versionMismatch
            ? "Portfolio data version changed; defaults reinitialized"
            : "Default portfolio data initialized:",
          this.items.length,
          "items",
        )
      }
      // Ensure IDs are unique to avoid React key collisions
      this.ensureUniqueIds()
      this.initialized = true
    } catch (error) {
      console.error("Error loading portfolio data from localStorage:", error)
      this.items = this.getDefaultItems()
      this.ensureUniqueIds()
      this.initialized = true
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items))
      localStorage.setItem(this.versionKey, String(PORTFOLIO_DATA_VERSION))
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

  // Deduplicate IDs to prevent React key warnings
  private ensureUniqueIds() {
    const seen = new Set<string>()
    let changed = false
    this.items = this.items.map((item) => {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        return item
      }
      // Reassign a unique ID for duplicates
      const newId = `${item.id}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2,6)}`
      seen.add(newId)
      changed = true
      return { ...item, id: newId }
    })

    if (changed) {
      console.warn("Duplicate portfolio IDs detected; reassigned to ensure uniqueness.")
      // Persist the corrected IDs
      try {
        localStorage.setItem("portfolio_data", JSON.stringify(this.items))
      } catch (e) {
        console.error("Failed to persist deduplicated portfolio data:", e)
      }
    }
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

  resetToDefaults(): void {
    try {
      localStorage.removeItem(this.storageKey)
      localStorage.setItem(this.versionKey, String(PORTFOLIO_DATA_VERSION))
      this.items = this.getDefaultItems()
      this.saveToStorage()
      console.log("Portfolio data reset to defaults:", this.items.length, "items")
    } catch (error) {
      console.error("Error resetting portfolio data:", error)
    }
  }

  private getDefaultItems(): PortfolioItem[] {
    return [
      // Thread Lifts & Face Contouring
      {
        id: "1",
        title: "Hiko Nose Thread Lift Transformation",
        category: "Thread Lifts & Face Contouring",
        beforeImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758858520/thgaptaukyvwweysmawt.jpg",
        afterImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758858517/rymvbcmiq248mvbilmcj.jpg",
        description: "Instantly lifts and defines the nose bridge and tip using dissolvable PDO/PCL threads for a more refined profile.",
        treatment: "Hiko Nose Thread Lift",
        duration: "1 hour",
        results: "1-2 years",
      },
      {
        id: "2",
        title: "Collagen Biostem V-Shape Contouring",
        category: "Thread Lifts & Face Contouring",
        beforeImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758863762/gohyu5q20gye3wd4dutl.jpg",
        afterImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758863763/ygmomz8uqexehwkuhohk.jpg",
        description: "Stimulates natural collagen production to lift and tighten sagging skin in the cheeks, jowls, and neck for a rejuvenated, V-shaped facial contour.",
        treatment: "Collagen Biostem",
        duration: "1-1.5 hours",
        results: "12-18 months",
      },
      {
        id: "3",
        title: "Dimpleplasty Creation",
        category: "Thread Lifts & Face Contouring",
        beforeImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758863446/hetyofv58v3dabc6hktt.jpg",
        afterImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758863447/vzjicf7rkpw5ogvbrgc5.jpg",
        description: "Creates natural-looking dimples on the cheeks through a minimally invasive procedure for a charming smile.",
        treatment: "Dimpleplasty",
        duration: "30 minutes",
        results: "Permanent",
      },
      {
        id: "4",
        title: "Non-Surgical Breast Lift",
        category: "Thread Lifts & Body Contouring",
        beforeImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758863739/yykngt3pibrggnitiuo7.jpg",
        afterImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758863740/t48wqd7cxwp32r2vqpej.jpg",
        description: "Lifts and firms the breasts using absorbable PDO/PCL threads for a perkier, more youthful contour without surgery.",
        treatment: "Non-Surgical Breast Lift",
        duration: "1 hour",
        results: "12-18 months",
      },
      {
        id: "7",
        title: "COG Thread Lift Treatment",
        category: "Thread Lifts & Face Contouring",
        beforeImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758864652/z4xspmz3jhlhpazgzvil.jpg",
        afterImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758864653/m7bqz312yv5himdfnq9v.jpg",
        description: "Lifts and tightens sagging skin using barbed PDO threads for immediate, long-lasting facial rejuvenation.",
        treatment: "COG Thread Lift",
        duration: "45 minutes",
        results: "1-2 years",
      },

      // Dermal Fillers & Volume Enhancement
      { 
        id: "5",
        title: "Lip Filler Volume Enhancement",
        category: "Dermal Fillers & Volume Enhancement",
        beforeImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758858460/mymzqypfbmtki7ij5rnp.jpg",
        afterImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758858460/vdlacukmdqok37zahmsa.jpg",
        description: "Enhance lip volume and definition with premium hyaluronic acid fillers for naturally beautiful lips.",
        treatment: "Lip Fillers",
        duration: "30-45 minutes",
        results: "6-12 months",
      },
      {
        id: "6",
        title: "Non-Surgical Butt Lift",
        category: "Dermal Fillers & Volume Enhancement",
        beforeImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758858581/bjgvl5arzzcxwufveevj.jpg",
        afterImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758858581/mobqu7qaiwmnlkh6jtfl.jpg",
        description: "Enhance and lift the buttocks using injectable fillers for a fuller, more contoured shape without surgery.",
        treatment: "Non-Surgical Butt Lift",
        duration: "1 hour",
        results: "12-24 months",
      },
           {
        id: "8",
        title: "Non-Surgical Feminine Area Rejuvenation ",
        category: "Dermal Fillers & Volume Enhancement",
        beforeImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1761623294/upzjclrlkc6xiunxltry.jpg",
        afterImage: "https://res.cloudinary.com/dbviya1rj/image/upload/v1761623294/trbj5pt5g9h324dsuxax.jpg",
        description: "Rejuvenates and enhances the feminine area using non-surgical injectable fillers for improved appearance, comfort, and confidence.",
        treatment: "Non-Surgical Feminine Area Rejuvenation",
        duration: "1 hour",
        results: "12-24 months",
      },
    ]
  }
}

export const portfolioService = new PortfolioService()
