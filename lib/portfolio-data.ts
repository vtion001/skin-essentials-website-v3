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

  resetToDefaults(): void {
    try {
      localStorage.removeItem("portfolio_data")
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
    ]
  }
}

export const portfolioService = new PortfolioService()
