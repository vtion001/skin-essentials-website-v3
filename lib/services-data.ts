export interface ServiceFAQ {
  q: string
  a: string
}

export interface Service {
  name: string
  price: string
  description: string
  duration?: string
  results?: string
  sessions?: string
  includes?: string
  benefits?: string[]
  faqs?: ServiceFAQ[]
  originalPrice?: string
  badge?: string
  pricing?: string
  image?: string
}

export interface ServiceCategory {
  id: string
  category: string
  description: string
  image: string
  color: string
  services: Service[]
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "thread-lifts",
    category: "Thread Lifts & Face Contouring",
    description: "Non-surgical lifting and contouring using advanced PDO/PCL threads",
    image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766221339/zbuimximnplv1zcnm7id.jpg",
    color: "from-[#fbc6c5] to-[#d09d80]",
    services: [
      {
        name: "Hiko Nose Thread Lift",
        price: "₱9,999",
        description:
          "Instantly lifts and defines the nose bridge and tip using dissolvable PDO/PCL threads for a more refined profile.",
        duration: "~1 hour",
        results: "1-2 years",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220084/d5r31yajne1stprtmaan.jpg",
        includes: "Unlimited PCL threads, free consultation, and post-care kit",
        benefits: [
          "Immediate nose bridge enhancement",
          "No surgery or downtime required",
          "Natural-looking results",
          "Stimulates collagen production",
        ],
        faqs: [
          {
            q: "Does it hurt?",
            a: "A topical anesthetic is applied to ensure comfort. Most clients report feeling only minimal pressure during the procedure.",
          },
          {
            q: "How long do results last?",
            a: "Results typically last 1-2 years as the threads stimulate your own collagen production for lasting improvement.",
          },
        ],
      },
      {
        name: "Face Thread Lift",
        price: "₱1,000/thread",
        originalPrice: "₱1,500/thread",
        description:
          "Lifts and tightens sagging skin in the cheeks, jowls, and neck for a rejuvenated, V-shaped facial contour.",
        duration: "1-1.5 hours",
        results: "12-18 months",
        badge: "PROMO",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220084/uayo7iukwlgrikgtptrp.jpg",
        benefits: [
          "Immediate lifting effect",
          "V-shaped facial contouring",
          "Minimal downtime",
          "Natural collagen stimulation",
        ],
        faqs: [
          {
            q: "Can threads lift sagging cheeks and jawline?",
            a: "Yes, this is one of the primary functions of face thread lifts, providing an immediate lifting effect for sagging areas.",
          },
        ],
      },
      {
        name: "Eyebrow Thread Lift",
        price: "₱8,000",
        description:
          "Lifts and shapes eyebrows for a more youthful, alert appearance using specialized PDO threads.",
        duration: "45 minutes",
        results: "12-18 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220083/czrq8nym6sibfvtyjayw.jpg",
        benefits: [
          "Natural eyebrow lift",
          "Enhanced eye area",
          "No surgical scars",
          "Immediate results",
        ],
      },
      {
        name: "Neck Thread Lift",
        price: "₱12,000",
        description:
          "Tightens loose neck skin and reduces the appearance of neck bands for a more defined jawline.",
        duration: "1 hour",
        results: "12-18 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220084/vbc7ram9d7bpvj5zbosb.jpg",
        benefits: [
          "Neck skin tightening",
          "Improved jawline definition",
          "Reduced neck bands",
          "Non-surgical solution",
        ],
      },
    ],
  },
  {
    id: "thread-lifts-body",
    category: "Thread Lifts & Body Contouring",
    description: "Non-surgical lifting and firming for body contours",
    image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220390/zz9r5gruont1taftq7xq.jpg",
    color: "from-[#fbc6c5] to-[#d09d80]",
    services: [],
  },
  {
    id: "dermal-fillers",
    category: "Dermal Fillers & Volume Enhancement",
    description: "Premium hyaluronic acid fillers for natural volume enhancement",
    image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766221331/lhznpaoueostk08iabif.jpg",
    color: "from-[#d09d80] to-[#fbc6c5]",
    services: [
      {
        name: "Lip Fillers",
        price: "₱6,000/1mL",
        description:
          "Enhance lip volume and definition with premium hyaluronic acid fillers for naturally beautiful lips.",
        duration: "30-45 minutes",
        results: "6-12 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220404/jnasnv8r2imiid0oqg0h.jpg",
        benefits: [
          "Enhanced lip volume",
          "Improved lip definition",
          "Natural-looking results",
          "Customizable enhancement",
        ],
        faqs: [
          {
            q: "Will my lips look natural?",
            a: "Yes, our expert technique focuses on enhancing your natural lip shape for beautiful, proportionate results.",
          },
        ],
      },
      {
        name: "Cheek Fillers",
        price: "₱6,000/1mL",
        description: "Restore volume and create defined cheekbones for a youthful, sculpted appearance.",
        duration: "45 minutes",
        results: "12-18 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220403/mztdahbihbtqzfya5zct.jpg",
        benefits: [
          "Enhanced cheek volume",
          "Improved facial contours",
          "Youthful appearance",
          "Natural-looking results",
        ],
      },
      {
        name: "Under-Eye Fillers",
        price: "₱6,000/1mL",
        description:
          "Reduce dark circles and hollowing under the eyes for a refreshed, youthful look.",
        duration: "30 minutes",
        results: "12-15 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220403/jfhnlhtiri5uokk7rjbw.jpg",
        benefits: [
          "Reduced under-eye hollowing",
          "Diminished dark circles",
          "Refreshed appearance",
          "Minimal downtime",
        ],
      },
      {
        name: "Chin Fillers",
        price: "₱6,000/1mL",
        description:
          "Enhance chin projection and create better facial balance and profile definition.",
        duration: "30 minutes",
        results: "12-18 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220390/tt7n6vnp13xi4sfbnmeh.jpg",
        benefits: [
          "Improved facial balance",
          "Enhanced chin projection",
          "Better profile definition",
          "Non-surgical enhancement",
        ],
      },
      {
        name: "Jawline Fillers",
        price: "₱8,000/1mL",
        description:
          "Create a more defined, masculine or feminine jawline depending on your aesthetic goals.",
        duration: "45 minutes",
        results: "12-18 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220390/dlevvnk3loxhahnwqvcs.jpg",
        benefits: [
          "Enhanced jawline definition",
          "Improved facial structure",
          "Customizable results",
          "Immediate enhancement",
        ],
      },
      {
        name: "Body Fillers (BBL)",
        price: "₱27,000/500cc",
        description:
          "Injectable HA gels for buttocks and hip enhancement, creating beautiful curves and proportions.",
        duration: "1-2 hours",
        results: "12-24 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220390/zz9r5gruont1taftq7xq.jpg",
        benefits: [
          "Enhanced body curves",
          "Non-surgical enhancement",
          "Natural-feeling results",
          "Customizable volume",
        ],
        faqs: [
          {
            q: "Can I sit normally after butt filler injections?",
            a: "Avoid direct, prolonged pressure for the first 2-3 days to ensure optimal results and healing.",
          },
        ],
      },
    ],
  },
  {
    id: "botox-treatments",
    category: "Botox & Neuromodulators",
    description: "FDA-approved treatments to smooth wrinkles and prevent aging",
    image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766221331/yvqpfabiaciq5aitdpsl.jpg",
    color: "from-[#fbc6c5]/90 to-[#d09d80]/90",
    services: [
      {
        name: "Forehead Botox",
        price: "₱8,000",
        description: "Smooth horizontal forehead lines and prevent future wrinkle formation.",
        duration: "15-20 minutes",
        results: "3-6 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766217215/aj3icnakrvzrfan0ta9x.jpg",
        benefits: [
          "Smooth forehead lines",
          "Prevents new wrinkles",
          "Natural-looking results",
          "Quick treatment",
        ],
      },
      {
        name: "Crow's Feet Botox",
        price: "₱8,000",
        description: "Reduce fine lines around the eyes for a more youthful, refreshed appearance.",
        duration: "15 minutes",
        results: "3-6 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766217215/ee3sxqwk5vytvyfgq3ns.jpg",
        benefits: [
          "Reduced eye wrinkles",
          "Youthful eye area",
          "Prevents deepening lines",
          "Minimal discomfort",
        ],
      },
      {
        name: "Frown Lines Botox",
        price: "₱8,000",
        description:
          "Smooth the vertical lines between eyebrows for a more relaxed, approachable look.",
        duration: "10-15 minutes",
        results: "3-6 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766217215/aj3icnakrvzrfan0ta9x.jpg",
        benefits: [
          "Smooth frown lines",
          "More relaxed appearance",
          "Prevents line deepening",
          "Quick procedure",
        ],
      },
      {
        name: "Masseter Botox (Jaw Slimming)",
        price: "₱12,000",
        description:
          "Slim the jawline by relaxing the masseter muscles for a more V-shaped face.",
        duration: "20 minutes",
        results: "4-6 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766217215/cxyogk8wq0vepnzxemzz.jpg",
        benefits: [
          "Slimmer jawline",
          "V-shaped face",
          "Reduced teeth grinding",
          "Facial feminization",
        ],
      },
      {
        name: "Lip Flip Botox",
        price: "₱4,000",
        description:
          "Create the appearance of fuller lips by relaxing the muscles around the mouth.",
        duration: "10 minutes",
        results: "2-3 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766217215/al0uljsnj1epjtljg2ed.jpg",
        benefits: [
          "Fuller-looking lips",
          "Enhanced lip shape",
          "Subtle enhancement",
          "No added volume",
        ],
      },
    ],
  },
  {
    id: "laser-treatments",
    category: "Laser Treatments & Hair Removal",
    description: "Advanced laser technology for hair removal and skin rejuvenation",
    image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766221331/qrdmehe5kmeuzckzjtb2.jpg",
    color: "from-[#fbc6c5]/80 to-[#d09d80]/80",
    services: [
      {
        name: "Diode Laser Hair Removal - Underarms",
        price: "₱1,000",
        description: "Permanently reduces unwanted underarm hair using comfortable diode laser technology.",
        duration: "15 minutes",
        sessions: "6-8 sessions typically needed",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220673/u2pcni1tf1aqsepdqb9a.jpg",
        benefits: [
          "Permanent hair reduction",
          "Comfortable treatment",
          "Quick sessions",
          "Smooth underarms",
        ],
      },
      {
        name: "Diode Laser Hair Removal - Face",
        price: "₱2,500",
        description: "Remove unwanted facial hair for smooth, hair-free skin.",
        duration: "20-30 minutes",
        sessions: "6-8 sessions typically needed",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220672/tpdkwe2agkye0mqrrxx0.jpg",
        benefits: [
          "Smooth facial skin",
          "Precision treatment",
          "Safe for sensitive areas",
          "Long-lasting results",
        ],
      },
      {
        name: "Diode Laser Hair Removal - Arms",
        price: "₱3,000",
        description: "Full arm hair removal for smooth, hair-free arms.",
        duration: "30-45 minutes",
        sessions: "6-8 sessions typically needed",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220672/mcz6drbm0nqc2ghw9akw.jpg",
        benefits: [
          "Smooth arms",
          "Comfortable treatment",
          "Permanent reduction",
          "No more shaving",
        ],
      },
      {
        name: "Diode Laser Hair Removal - Legs",
        price: "₱5,000",
        description: "Full leg hair removal for permanently smooth legs.",
        duration: "45-60 minutes",
        sessions: "6-8 sessions typically needed",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220672/pkl3orci8atnwubnkawa.jpg",
        benefits: [
          "Smooth legs",
          "Permanent hair reduction",
          "No ingrown hairs",
          "Long-term savings",
        ],
      },
      {
        name: "Diode Laser Hair Removal - Bikini",
        price: "₱5,000",
        description: "Bikini area hair removal for confidence and comfort.",
        duration: "30 minutes",
        sessions: "6-8 sessions typically needed",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220672/t96bhriofdevpkzu7wkt.jpg",
        benefits: [
          "Smooth bikini area",
          "Reduced irritation",
          "Precision treatment",
          "Comfortable procedure",
        ],
      },
      {
        name: "Pico Laser",
        price: "₱1,000",
        description:
          "Advanced laser delivering ultra-short energy pulses to treat pigmentation and rejuvenate skin effectively.",
        duration: "30-45 minutes",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220672/qwr00xne9a2ouf45fw8h.jpg",
        benefits: [
          "Treats stubborn pigmentation",
          "Skin rejuvenation",
          "Minimal downtime",
          "Safe for all skin types",
        ],
        faqs: [
          {
            q: "Can it treat melasma and sunspots?",
            a: "Yes, Pico laser is highly effective for treating stubborn pigmentation issues including melasma and age spots.",
          },
        ],
      },
      {
        name: "Tattoo Removal",
        price: "₱4,000-₱15,000",
        description:
          "Advanced laser technology breaks down ink particles, allowing your body to naturally clear them away.",
        duration: "15-45 minutes per session",
        sessions: "5-15+ sessions (varies by tattoo)",
        image: "/images/services/tattoo-removal.jpg",
        benefits: [
          "Complete tattoo removal",
          "Minimal scarring",
          "All ink colors treatable",
          "Gradual fading process",
        ],
      },
    ],
  },
  {
    id: "skin-treatments",
    category: "Skin Rejuvenation & Facials",
    description: "Medical-grade treatments for youthful, radiant skin",
    image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766221331/hogur4vl78yem4fbl3e9.jpg",
    color: "from-[#d09d80]/70 to-[#fbc6c5]/70",
    services: [
      {
        name: "Vampire Facial (PRP + Microneedling)",
        price: "₱3,500",
        description:
          "Powerful anti-aging treatment combining microneedling with your own Platelet-Rich Plasma for natural skin regeneration.",
        duration: "~1 hour",
        sessions: "3-4 sessions recommended",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220913/uqprxlihpgnp5v7rxqza.jpg",
        benefits: ["Natural skin regeneration", "Improved skin texture", "Reduced fine lines", "Enhanced skin glow"],
        faqs: [
          {
            q: "Is there redness afterward?",
            a: "Mild redness similar to a sunburn is expected and typically subsides within 24-48 hours.",
          },
        ],
      },
      {
        name: "Thermage RF Skin Tightening",
        price: "₱3,500/area",
        description:
          "Non-invasive radiofrequency treatment that stimulates collagen production for smoother, tighter skin.",
        duration: "45-90 minutes",
        results: "Results develop over 3-6 months",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220912/cjjpcnd3z8sufsmegrx1.jpg",
        benefits: ["Skin tightening", "Collagen stimulation", "No downtime", "Long-lasting results"],
      },
      {
        name: "Stem Cell Boosters",
        price: "₱2,500-₱6,000",
        description:
          "Rejuvenating treatment infusing skin with growth factors to repair damage and boost natural collagen production.",
        duration: "~1 hour",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220912/thb2eqq1aq2eyfktr9pm.jpg",
        benefits: ["Cellular regeneration", "Improved skin quality", "Natural healing", "Anti-aging effects"],
        faqs: [
          {
            q: "How does it differ from traditional facials?",
            a: "Stem cell boosters work at a cellular level to regenerate and repair skin from within, providing deeper rejuvenation.",
          },
        ],
      },
      {
        name: "HydraFacial",
        price: "₱4,500",
        description:
          "Multi-step facial treatment that cleanses, exfoliates, extracts, and hydrates skin for immediate glow.",
        duration: "45 minutes",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220912/ra8hzttwr8tp2a7gzrxd.jpg",
        benefits: ["Instant skin glow", "Deep cleansing", "Hydration boost", "No downtime"],
      },
      {
        name: "Chemical Peel",
        price: "₱2,500-₱5,000",
        description:
          "Professional chemical exfoliation to improve skin texture, tone, and reduce signs of aging.",
        duration: "30-45 minutes",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220912/aoyzbvxshqetlhjxuenm.jpg",
        benefits: ["Improved skin texture", "Reduced pigmentation", "Smoother skin", "Enhanced radiance"],
      },
      {
        name: "Microneedling",
        price: "₱3,000",
        description:
          "Stimulates collagen production through controlled micro-injuries for improved skin texture and tone.",
        duration: "45 minutes",
        image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766220911/loyrbf1rakp7glrfdbhg.jpg",
        benefits: ["Collagen stimulation", "Improved texture", "Reduced scars", "Enhanced absorption"],
      },
    ],
  },
]

class ServicesDataService {
  private key = "services_data"
  private initialized = false
  private data: ServiceCategory[] = []
  private subscribers: ((data: ServiceCategory[]) => void)[] = []

  private load() {
    if (this.initialized) return
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(this.key)
        this.data = raw ? JSON.parse(raw) : serviceCategories
      } catch {
        this.data = serviceCategories
      }
    } else {
      this.data = serviceCategories
    }
    this.initialized = true
  }

  private save() {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(this.key, JSON.stringify(this.data))
        window.dispatchEvent(new CustomEvent("services_data_updated", { detail: { data: this.data } }))
      }
    } catch { }
    this.subscribers.forEach(cb => {
      try { cb([...this.data]) } catch { }
    })
  }

  subscribe(cb: (data: ServiceCategory[]) => void) {
    this.subscribers.push(cb)
    return () => {
      const i = this.subscribers.indexOf(cb)
      if (i > -1) this.subscribers.splice(i, 1)
    }
  }

  getAllCategories(): ServiceCategory[] {
    this.load()
    return [...this.data]
  }

  upsertCategory(cat: ServiceCategory) {
    this.load()
    const idx = this.data.findIndex(c => c.id === cat.id)
    if (idx >= 0) this.data[idx] = cat
    else this.data.push(cat)
    this.save()
    return cat
  }

  deleteCategory(id: string) {
    this.load()
    this.data = this.data.filter(c => c.id !== id)
    this.save()
    return true
  }

  addService(categoryId: string, svc: Service) {
    this.load()
    const cat = this.data.find(c => c.id === categoryId)
    if (!cat) return false
    cat.services.push(svc)
    this.save()
    return true
  }

  updateService(categoryId: string, name: string, updates: Partial<Service>) {
    this.load()
    const cat = this.data.find(c => c.id === categoryId)
    if (!cat) return false
    const idx = cat.services.findIndex(s => s.name === name)
    if (idx < 0) return false
    cat.services[idx] = { ...cat.services[idx], ...updates }
    this.save()
    return true
  }

  deleteService(categoryId: string, name: string) {
    this.load()
    const cat = this.data.find(c => c.id === categoryId)
    if (!cat) return false
    cat.services = cat.services.filter(s => s.name !== name)
    this.save()
    return true
  }
}

export const servicesDataService = new ServicesDataService()