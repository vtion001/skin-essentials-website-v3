"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Star,
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Eye,
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
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Load portfolio items on component mount
  useEffect(() => {
    const loadItems = () => {
      setIsLoading(true)
      // Get only published items for public portfolio
      const items = PortfolioService.getPublishedItems()
      setPortfolioItems(items)
      setFilteredItems(items)
      setIsLoading(false)
    }

    loadItems()
  }, [])

  // Filter items based on search and category
  useEffect(() => {
    const filtered = PortfolioService.filterItems({
      category: selectedCategory,
      status: "published", // Only show published items
      search: searchQuery,
    })
    setFilteredItems(filtered)
  }, [searchQuery, selectedCategory, portfolioItems])

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
    if (selectedItem) {
      setCurrentImageIndex(currentImageIndex === 0 ? 1 : 0)
    }
  }

  const prevImage = () => {
    if (selectedItem) {
      setCurrentImageIndex(currentImageIndex === 0 ? 1 : 0)
    }
  }

  const getCurrentImage = () => {
    if (!selectedItem) return ""
    return currentImageIndex === 0 ? selectedItem.beforeImage : selectedItem.afterImage
  }

  const getCurrentImageLabel = () => {
    return currentImageIndex === 0 ? "Before" : "After"
  }

  if (isLoading) {
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
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Our{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbc6c5] to-[#d09d80]">Portfolio</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover the amazing transformations of our satisfied clients. Each result tells a story of confidence,
          beauty, and excellence.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search treatments, results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#fbc6c5]/30 focus:border-[#d09d80] focus:ring-[#d09d80]/20 bg-white/80 backdrop-blur-sm"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-64 border-[#fbc6c5]/30 bg-white/80 backdrop-blur-sm">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
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

      {/* Results Count */}
      <div className="text-center">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-[#d09d80]">{filteredItems.length}</span> amazing transformations
        </p>
      </div>

      {/* Portfolio Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="group cursor-pointer bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden"
              onClick={() => openModal(item)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.afterImage || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* View Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button size="sm" className="bg-white/90 text-gray-900 hover:bg-white">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-[#fbc6c5]/90 text-white backdrop-blur-sm">{item.category}</Badge>
                </div>

                {/* Rating */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs font-medium">{item.rating}</span>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#d09d80] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-[#d09d80]">{item.price}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{item.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{item.clientAge}y</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-[#fbc6c5]/20 to-[#d09d80]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">No results found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search terms or filter criteria to find what you're looking for.
          </p>
          <Button
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("all")
            }}
            className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#fffaff]">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">{selectedItem.title}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="space-y-4">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={getCurrentImage() || "/placeholder.svg"}
                      alt={`${selectedItem.title} - ${getCurrentImageLabel()}`}
                      fill
                      className="object-cover"
                    />

                    {/* Image Navigation */}
                    <div className="absolute inset-0 flex items-center justify-between p-4">
                      <Button variant="secondary" size="sm" onClick={prevImage} className="bg-white/80 hover:bg-white">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={nextImage} className="bg-white/80 hover:bg-white">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Image Label */}
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-black/70 text-white">{getCurrentImageLabel()}</Badge>
                    </div>
                  </div>

                  {/* Image Thumbnails */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentImageIndex(0)}
                      className={`relative aspect-[4/3] w-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImageIndex === 0 ? "border-[#d09d80]" : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={selectedItem.beforeImage || "/placeholder.svg"}
                        alt="Before"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="text-xs text-white font-medium">Before</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(1)}
                      className={`relative aspect-[4/3] w-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImageIndex === 1 ? "border-[#d09d80]" : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={selectedItem.afterImage || "/placeholder.svg"}
                        alt="After"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="text-xs text-white font-medium">After</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className="bg-[#fbc6c5]/20 text-gray-700">{selectedItem.category}</Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < selectedItem.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm text-gray-600">({selectedItem.rating}/5)</span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{selectedItem.description}</p>
                  </div>

                  {/* Treatment Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-[#d09d80]" />
                        <span className="font-medium text-gray-700">Duration</span>
                      </div>
                      <p className="text-gray-900">{selectedItem.duration}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-4 h-4 text-[#d09d80] font-bold">₱</span>
                        <span className="font-medium text-gray-700">Investment</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{selectedItem.price}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-[#d09d80]" />
                        <span className="font-medium text-gray-700">Date</span>
                      </div>
                      <p className="text-gray-900">{new Date(selectedItem.date).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-[#d09d80]" />
                        <span className="font-medium text-gray-700">Client Age</span>
                      </div>
                      <p className="text-gray-900">{selectedItem.clientAge} years</p>
                    </div>
                  </div>

                  {/* Results */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Treatment Results</h4>
                    <ul className="space-y-2">
                      {selectedItem.results.map((result, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#d09d80] rounded-full" />
                          <span className="text-gray-700">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Treatment Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#fbc6c5]/20 text-gray-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Testimonial */}
                  {selectedItem.testimonial && (
                    <div className="bg-gradient-to-r from-[#fbc6c5]/10 to-[#d09d80]/10 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Client Testimonial</h4>
                      <blockquote className="text-gray-700 italic">"{selectedItem.testimonial}"</blockquote>
                      {selectedItem.clientInitials && (
                        <cite className="block text-sm text-gray-600 mt-3 not-italic">
                          - {selectedItem.clientInitials}
                        </cite>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
