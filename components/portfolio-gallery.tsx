"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Star, RefreshCw, Filter, Grid, List } from "lucide-react"
import Image from "next/image"
import { portfolioService, type PortfolioItem } from "@/lib/portfolio-data"

export function PortfolioGallery() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)

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
      <div className="text-center space-y-6">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#fbc6c5]/20 to-[#d09d80]/20 backdrop-blur-sm rounded-full border border-[#fbc6c5]/30">
          <Star className="w-4 h-4 text-[#d09d80] mr-2" />
          <span className="text-sm font-medium text-gray-700">Real Results</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
            Before & After
          </span>
          <br />
          <span className="bg-gradient-to-r from-[#fbc6c5] via-[#d09d80] to-[#fbc6c5] bg-clip-text text-transparent">
            Gallery
          </span>
        </h1>

        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Discover the transformative results our clients have achieved with our expert treatments and
          <span className="font-semibold text-[#d09d80]"> FDA-approved materials</span>.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
            <TabsList className="bg-white border border-gray-200 rounded-xl p-1">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#fbc6c5] data-[state=active]:to-[#d09d80] data-[state=active]:text-white"
                >
                  {category === "all" ? "All" : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="border-gray-300 bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <div className="flex border border-gray-300 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-[#fbc6c5] text-white" : ""}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-[#fbc6c5] text-white" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-[#d09d80]">{filteredItems.length}</span> results
          {selectedCategory !== "all" && (
            <span>
              {" "}
              in <span className="font-semibold">{selectedCategory}</span>
            </span>
          )}
        </p>
      </div>

      {/* Gallery */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
          <p className="text-gray-500">Try selecting a different category or refresh the page.</p>
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
              className={`group cursor-pointer hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden border-0 bg-white ${
                viewMode === "list" ? "flex flex-col md:flex-row" : ""
              }`}
              onClick={() => setSelectedItem(item)}
            >
              <div className={`relative overflow-hidden ${viewMode === "list" ? "md:w-1/2" : ""}`}>
                <div className="grid grid-cols-2 h-64">
                  <div className="relative">
                    <Image
                      src={item.beforeImage || "/placeholder.svg"}
                      alt={`Before ${item.title}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 text-white text-xs">Before</Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <Image
                      src={item.afterImage || "/placeholder.svg"}
                      alt={`After ${item.title}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white text-xs">After</Badge>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <CardContent className={`p-6 ${viewMode === "list" ? "md:w-1/2 flex flex-col justify-center" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white">{item.category}</Badge>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#d09d80] transition-colors duration-300">
                  {item.title}
                </h3>

                <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">{item.description}</p>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-[#d09d80]" />
                    {item.duration}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2 text-[#d09d80]" />
                    Results: {item.results}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">{selectedItem.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white px-4 py-2">
                    {selectedItem.category}
                  </Badge>
                  <span className="text-lg font-semibold text-[#d09d80]">{selectedItem.treatment}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900">Before</h4>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                      <Image
                        src={selectedItem.beforeImage || "/placeholder.svg"}
                        alt={`Before ${selectedItem.title}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900">After</h4>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                      <Image
                        src={selectedItem.afterImage || "/placeholder.svg"}
                        alt={`After ${selectedItem.title}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Treatment Details</h4>
                  <p className="text-gray-600 mb-6 leading-relaxed">{selectedItem.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-xl">
                      <Clock className="w-6 h-6 text-[#d09d80] mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Duration</div>
                      <div className="text-sm text-gray-600">{selectedItem.duration}</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl">
                      <Star className="w-6 h-6 text-[#d09d80] mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Results Last</div>
                      <div className="text-sm text-gray-600">{selectedItem.results}</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl">
                      <Badge className="w-6 h-6 text-[#d09d80] mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Treatment</div>
                      <div className="text-sm text-gray-600">{selectedItem.treatment}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
