"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Star, RefreshCw, Filter, Grid, List, Eye, EyeOff } from "lucide-react"
import { OptimizedImage } from "@/components/optimized-image"
import { portfolioService, type PortfolioItem } from "@/lib/portfolio-data"

export function PortfolioGallery() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({})

  const isSensitive = (item: PortfolioItem) => {
    const title = item.title.toLowerCase()
    return (
      title.includes("feminine") ||
      title.includes("intimate") ||
      title.includes("butt") ||
      title.includes("breast")
    )
  }

  const toggleReveal = (id: string) => {
    setRevealedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    // Load initial data
    const items = portfolioService.getAllItems()
    setPortfolioItems(items)
    setIsLoading(false)
    console.log("Portfolio gallery loaded:", items.length, "items")

    // Subscribe to updates
    const unsubscribe = portfolioService.subscribe((updatedItems) => {
      console.log("Portfolio gallery received update:", updatedItems.length, "items")
      setPortfolioItems(updatedItems)
    })

    // Listen for storage events (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "portfolio_data") {
        console.log("Portfolio gallery detected storage change")
        const items = portfolioService.getAllItems()
        setPortfolioItems(items)
      }
    }

    // Listen for custom events (same-tab updates)
    const handleCustomUpdate = (e: CustomEvent) => {
      console.log("Portfolio gallery received custom update event")
      setPortfolioItems(e.detail.items)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("portfolio_data_updated", handleCustomUpdate as EventListener)

    return () => {
      unsubscribe()
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("portfolio_data_updated", handleCustomUpdate as EventListener)
    }
  }, [])

  const categories = ["all", ...Array.from(new Set(portfolioItems.map((item) => item.category)))]

  const filteredItems =
    selectedCategory === "all" ? portfolioItems : portfolioItems.filter((item) => item.category === selectedCategory)

  const handleRefresh = () => {
    setIsLoading(true)
    const items = portfolioService.getAllItems()
    setPortfolioItems(items)
    setIsLoading(false)
    console.log("Portfolio gallery manually refreshed:", items.length, "items")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#d09d80] mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-6 mb-12">
        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-rose-100 to-pink-100 backdrop-blur-sm rounded-full border border-rose-200/50 shadow-sm">
          <Star className="w-5 h-5 text-rose-500 mr-3" />
          <span className="text-sm font-semibold text-rose-700">Verified Results Gallery</span>
        </div>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
          Real Client
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500">
            Transformations
          </span>
        </h2>

        <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Browse through our comprehensive collection of before-and-after photos showcasing the remarkable results achieved with our 
          <span className="font-semibold text-rose-600"> 28 specialized treatments</span> across 5 service categories.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
        <div className="w-full lg:w-auto">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-2 shadow-sm w-full lg:w-auto grid grid-cols-2 lg:flex lg:grid-cols-none gap-1">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50"
                >
                  {category === "all" ? "All Treatments" : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            className="border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-rose-50 hover:border-rose-300 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <div className="flex border border-gray-300 rounded-xl p-1 bg-white/80 backdrop-blur-sm">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`transition-all duration-300 ${
                viewMode === "grid" 
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm" 
                  : "hover:bg-gray-50"
              }`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`transition-all duration-300 ${
                viewMode === "list" 
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm" 
                  : "hover:bg-gray-50"
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
          <p className="text-gray-700 font-medium">
            Showing <span className="font-bold text-rose-600">{filteredItems.length}</span> 
            {filteredItems.length === 1 ? ' result' : ' results'}
            {selectedCategory !== "all" && (
              <span>
                {" "}in <span className="font-semibold text-pink-600">{selectedCategory}</span>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Gallery */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-gray-200 shadow-sm">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-3">No results found</h3>
            <p className="text-gray-500 leading-relaxed">Try selecting a different category or refresh the page to see all available treatments.</p>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8" 
              : "space-y-6"
          }
        >
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-3xl overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-lg ${
                viewMode === "list" ? "flex flex-col md:flex-row" : ""
              }`}
              onClick={() => setSelectedItem(item)}
            >
              <div className={`relative overflow-hidden ${viewMode === "list" ? "md:w-1/2" : ""}`}>
                <div className="grid grid-cols-2 h-64 lg:h-72">
                  <div className="relative">
                    <OptimizedImage
                      src={item.beforeImage || "/placeholder.svg"}
                      alt={`Before ${item.title}`}
                      fill
                      className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                        isSensitive(item) && !revealedMap[item.id] ? "filter blur-xl" : ""
                      }`}
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 shadow-lg">
                        Before
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <OptimizedImage
                      src={item.afterImage || "/placeholder.svg"}
                      alt={`After ${item.title}`}
                      fill
                      className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                        isSensitive(item) && !revealedMap[item.id] ? "filter blur-xl" : ""
                      }`}
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 shadow-lg">
                        After
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-between">
                  <p className="text-sm font-medium">Click to view details</p>
                  {isSensitive(item) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/80 text-gray-900 backdrop-blur-sm hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleReveal(item.id)
                      }}
                      aria-label={revealedMap[item.id] ? "Hide sensitive content" : "Reveal sensitive content"}
                    >
                      {revealedMap[item.id] ? (
                        <span className="flex items-center gap-2"><EyeOff className="w-4 h-4" /> Hide</span>
                      ) : (
                        <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> View</span>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <CardContent className={`p-6 lg:p-8 ${viewMode === "list" ? "md:w-1/2 flex flex-col justify-center" : ""}`}>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 text-xs font-semibold shadow-sm">
                    {item.category}
                  </Badge>
                </div>

                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors duration-300 leading-tight">
                  {item.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed text-sm lg:text-base line-clamp-3">{item.description}</p>

                <div className="space-y-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-3 text-rose-500 flex-shrink-0" />
                    <span className="font-medium">{item.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-3 text-rose-500 flex-shrink-0" />
                    <span className="font-medium">Results: {item.results}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl">
          {selectedItem && (
            <>
              <DialogHeader className="pb-6">
                <DialogTitle className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{selectedItem.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 text-sm font-semibold shadow-sm">
                    {selectedItem.category}
                  </Badge>
                  <span className="text-lg font-semibold text-rose-600">{selectedItem.treatment}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-lg">Before</h4>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                      <OptimizedImage
                        src={selectedItem.beforeImage || "/placeholder.svg"}
                        alt={`Before ${selectedItem.title}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 text-xs font-semibold shadow-lg">
                          Before
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-lg">After</h4>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                      <OptimizedImage
                        src={selectedItem.afterImage || "/placeholder.svg"}
                        alt={`After ${selectedItem.title}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 text-xs font-semibold shadow-lg">
                          After
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200/50">
                  <h4 className="font-bold text-gray-900 mb-6 text-xl">Treatment Details</h4>
                  <p className="text-gray-600 mb-8 leading-relaxed text-lg">{selectedItem.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                      <div className="bg-rose-100 p-3 rounded-xl w-fit mx-auto mb-4">
                        <Clock className="w-6 h-6 text-rose-600" />
                      </div>
                      <div className="font-bold text-gray-900 text-lg mb-2">Duration</div>
                      <div className="text-gray-600 font-medium">{selectedItem.duration}</div>
                    </div>
                    <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                      <div className="bg-rose-100 p-3 rounded-xl w-fit mx-auto mb-4">
                        <Star className="w-6 h-6 text-rose-600" />
                      </div>
                      <div className="font-bold text-gray-900 text-lg mb-2">Results Last</div>
                      <div className="text-gray-600 font-medium">{selectedItem.results}</div>
                    </div>
                    <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                      <div className="bg-rose-100 p-3 rounded-xl w-fit mx-auto mb-4">
                        <Star className="w-6 h-6 text-rose-600" />
                      </div>
                      <div className="font-bold text-gray-900 text-lg mb-2">Treatment</div>
                      <div className="text-gray-600 font-medium">{selectedItem.treatment}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-center text-gray-500 text-sm leading-relaxed">
                    Individual results may vary. Consult with our specialists for personalized treatment plans.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
