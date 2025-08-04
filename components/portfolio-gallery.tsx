"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  Star,
  Calendar,
  Clock,
  User,
  Quote,
  X,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  RefreshCw,
} from "lucide-react"
import Image from "next/image"
import { PortfolioService, type PortfolioItem } from "@/lib/portfolio-data"

const categories = [
  "Thread Lifts",
  "Dermal Fillers",
  "Skin Treatments",
  "Laser Treatments",
  "Botox",
  "Specialized Treatments",
]

export function PortfolioGallery() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadItems = () => {
    setIsLoading(true)
    try {
      // Force refresh from localStorage to ensure we have the latest data
      PortfolioService.forceRefresh()
      const publishedItems = PortfolioService.getPublishedItems()
      console.log("Loading portfolio items:", publishedItems.length)
      setPortfolioItems(publishedItems)
      setFilteredItems(publishedItems)
    } catch (error) {
      console.error("Error loading portfolio items:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load portfolio items on component mount and set up subscriptions
  useEffect(() => {
    loadItems()

    // Subscribe to data updates from the shared service
    const unsubscribe = PortfolioService.onUpdate((data) => {
      console.log("Portfolio data updated, reloading gallery...")
      const publishedItems = data.filter((item) => item.status === "published")
      setPortfolioItems(publishedItems)
      setFilteredItems(publishedItems) // Also update filteredItems immediately
    })

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "skin_essentials_portfolio_data") {
        console.log("Portfolio data changed in another tab, reloading...")
        loadItems()
      }
    }

    // Listen for focus events to reload data when returning to tab
    const handleFocus = () => {
      console.log("Window focused, reloading portfolio data...")
      loadItems()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      unsubscribe()
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Filter items based on category and search
  useEffect(() => {
    let filtered = portfolioItems

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          item.category.toLowerCase().includes(query),
      )
    }

    setFilteredItems(filtered)
  }, [portfolioItems, selectedCategory, searchQuery])

  const openModal = (item: PortfolioItem) => {
    setSelectedItem(item)
    setCurrentImageIndex(0)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
    setCurrentImageIndex(0)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? 1 : 0))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 1 ? 0 : 1))
  }

  // Force refresh and update state
  const handleRefresh = () => {
    setIsRefreshing(true)
    PortfolioService.forceRefresh()
    // The onUpdate subscription should handle the data update and re-render
    // We'll let the subscription trigger loadItems or directly update state
    // For immediate feedback, we can call loadItems here as well, but the subscription is the primary mechanism.
    // Let's rely on the subscription for now to avoid duplicate operations.
    // If subscription logic is delayed, uncommenting loadItems() might be useful.
    // loadItems()
  }

  // Reload data when the tab becomes visible again
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      console.log("Tab became visible, checking for updates...")
      loadItems()
    }
  }

  if (isLoading && !isRefreshing) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d09d80]"></div>
        <span className="ml-3 text-gray-600">Loading portfolio...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Portfolio</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the amazing transformations we've achieved for our clients. Each result tells a story of confidence,
          beauty, and satisfaction.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search treatments, results, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#fbc6c5]/30 focus:border-[#d09d80] focus:ring-[#d09d80]/20"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 border-[#fbc6c5]/30">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="border-[#fbc6c5]/30 text-gray-700 hover:bg-[#fbc6c5]/10 bg-transparent"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={
              viewMode === "grid"
                ? "bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white"
                : "border-[#fbc6c5]/30 text-gray-600 hover:bg-[#fbc6c5]/10"
            }
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={
              viewMode === "list"
                ? "bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white"
                : "border-[#fbc6c5]/30 text-gray-600 hover:bg-[#fbc6c5]/10"
            }
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-[#d09d80]">{filteredItems.length}</span> result
          {filteredItems.length !== 1 ? "s" : ""}
          {selectedCategory !== "all" && (
            <>
              {" "}
              in <span className="font-semibold">{selectedCategory}</span>
            </>
          )}
        </p>
        {(selectedCategory !== "all" || searchQuery) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory("all")
              setSearchQuery("")
            }}
            className="border-[#fbc6c5]/30 text-gray-600 hover:bg-[#fbc6c5]/10"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Portfolio Grid/List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#fbc6c5]/20 to-[#d09d80]/20 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-[#d09d80]/60" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">No results found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedCategory !== "all"
              ? "Try adjusting your search criteria or browse all categories"
              : "Our portfolio is being updated. Please check back soon!"}
          </p>
          <Button
            onClick={() => {
              setSelectedCategory("all")
              setSearchQuery("")
            }}
            className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white"
          >
            View All Treatments
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-6"
          }
        >
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`group cursor-pointer bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden ${
                viewMode === "list" ? "flex flex-col md:flex-row" : ""
              }`}
              onClick={() => openModal(item)}
            >
              <div
                className={`relative overflow-hidden ${
                  viewMode === "list" ? "md:w-80 aspect-[4/3] md:aspect-auto" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={item.afterImage || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-gray-800 hover:bg-white">{item.category}</Badge>
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs font-medium text-gray-800">{item.rating}</span>
                </div>
              </div>

              <CardContent className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-[#d09d80] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {item.duration}
                    </span>
                    <span className="font-semibold text-[#d09d80] text-lg">{item.price}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Age {item.clientAge}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-[#fbc6c5]/20 text-gray-600">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">
                        +{item.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#fffaff]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-gray-900 pr-8">{selectedItem?.title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-8">
              {/* Before/After Images */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                    <Image
                      src={
                        currentImageIndex === 0
                          ? selectedItem.beforeImage || "/placeholder.svg"
                          : selectedItem.afterImage || "/placeholder.svg"
                      }
                      alt={currentImageIndex === 0 ? "Before" : "After"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-between p-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={prevImage}
                        className="bg-white/80 hover:bg-white rounded-full w-10 h-10 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={nextImage}
                        className="bg-white/80 hover:bg-white rounded-full w-10 h-10 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-white/90 text-gray-800">
                        {currentImageIndex === 0 ? "Before" : "After"}
                      </Badge>
                    </div>
                  </div>

                  {/* Image Navigation */}
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant={currentImageIndex === 0 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentImageIndex(0)}
                      className={
                        currentImageIndex === 0
                          ? "bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white"
                          : "border-[#fbc6c5]/30"
                      }
                    >
                      Before
                    </Button>
                    <Button
                      variant={currentImageIndex === 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentImageIndex(1)}
                      className={
                        currentImageIndex === 1
                          ? "bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white"
                          : "border-[#fbc6c5]/30"
                      }
                    >
                      After
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Category</Label>
                      <p className="text-lg font-semibold text-gray-900">{selectedItem.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Subcategory</Label>
                      <p className="text-lg font-semibold text-gray-900">{selectedItem.subcategory}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <p className="text-gray-900 leading-relaxed">{selectedItem.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Duration</Label>
                      <p className="text-lg font-semibold text-gray-900">{selectedItem.duration}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Investment</Label>
                      <p className="text-2xl font-bold text-[#d09d80]">{selectedItem.price}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Treatment Date</Label>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(selectedItem.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Client Age</Label>
                      <p className="text-lg font-semibold text-gray-900">{selectedItem.clientAge} years</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Rating</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < selectedItem.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-gray-900">({selectedItem.rating}/5)</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Treatment Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedItem.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#fbc6c5]/20 text-gray-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div>
                <Label className="text-lg font-semibold text-gray-900 mb-3 block">Treatment Results</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedItem.results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span className="text-green-800 font-medium">{result}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              {selectedItem.testimonial && (
                <div className="bg-gradient-to-r from-[#fbc6c5]/10 to-[#d09d80]/10 rounded-2xl p-6 border border-[#fbc6c5]/20">
                  <div className="flex items-start gap-4">
                    <Quote className="w-8 h-8 text-[#d09d80] flex-shrink-0 mt-1" />
                    <div>
                      <blockquote className="text-lg text-gray-800 italic leading-relaxed mb-3">
                        "{selectedItem.testimonial}"
                      </blockquote>
                      {selectedItem.clientInitials && (
                        <cite className="text-sm font-semibold text-[#d09d80] not-italic">
                          — {selectedItem.clientInitials}
                        </cite>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}