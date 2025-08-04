"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  Save,
  X,
  ImageIcon,
  Star,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react"
import Image from "next/image"
import { SharedHeader } from "@/components/shared-header"
import { useRouter } from "next/navigation"
import { PortfolioService, type PortfolioItem } from "@/lib/portfolio-data"

const categories = [
  "Thread Lifts",
  "Dermal Fillers",
  "Skin Treatments",
  "Laser Treatments",
  "Botox",
  "Specialized Treatments",
]

const subcategories = {
  "Thread Lifts": ["Nose Enhancement", "Face Contouring", "Eyebrow Lift"],
  "Dermal Fillers": ["Lip Enhancement", "Cheek Enhancement", "Body Contouring"],
  "Skin Treatments": ["Anti-Aging", "Acne Treatment", "Pigmentation"],
  "Laser Treatments": ["Hair Removal", "Skin Resurfacing", "Tattoo Removal"],
  Botox: ["Wrinkle Reduction", "Facial Contouring"],
  "Specialized Treatments": ["Hair Growth", "Body Enhancement", "Wellness"],
}

export default function AdminPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const router = useRouter()

  // Add authentication check
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_token="))
      ?.split("=")[1]

    if (!token || token !== "authenticated") {
      router.push("/admin/login")
    }
  }, [router])

  // Add logout function
  const handleLogout = () => {
    // Clear cookie
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    // Clear localStorage
    localStorage.removeItem("admin_token")
    // Redirect to login
    router.push("/admin/login")
  }

  // Form state for add/edit
  const [formData, setFormData] = useState<Partial<PortfolioItem>>({
    title: "",
    category: "",
    subcategory: "",
    beforeImage: "",
    afterImage: "",
    description: "",
    duration: "",
    price: "",
    date: new Date().toISOString().split("T")[0],
    rating: 5,
    tags: [],
    clientAge: "",
    results: [],
    testimonial: "",
    clientInitials: "",
    status: "draft",
  })

  // Image upload states
  const [beforeImageFile, setBeforeImageFile] = useState<File | null>(null)
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null)
  const [beforeImagePreview, setBeforeImagePreview] = useState<string>("")
  const [afterImagePreview, setAfterImagePreview] = useState<string>("")

  // Load portfolio items using shared service
  useEffect(() => {
    loadPortfolioItems()

    // Subscribe to data updates
    const unsubscribe = PortfolioService.onUpdate((data) => {
      console.log("Admin: Portfolio data updated, reloading...")
      setPortfolioItems(data)
    })

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "skin_essentials_portfolio_data") {
        console.log("Admin: Portfolio data changed in another tab, reloading...")
        loadPortfolioItems()
      }
    }

    // Listen for focus events to reload data when returning to tab
    const handleFocus = () => {
      console.log("Admin: Window focused, reloading portfolio data...")
      loadPortfolioItems()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      unsubscribe()
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  const loadPortfolioItems = async () => {
    setIsLoading(true)
    try {
      // Force refresh from localStorage to ensure we have the latest data
      PortfolioService.forceRefresh()
      const items = PortfolioService.getAllItems()
      setPortfolioItems(items)
    } catch (error) {
      showNotification("error", "Failed to load portfolio items")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle image file selection
  const handleImageUpload = (file: File, type: "before" | "after") => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (type === "before") {
          setBeforeImageFile(file)
          setBeforeImagePreview(result)
          setFormData((prev) => ({ ...prev, beforeImage: result }))
        } else {
          setAfterImageFile(file)
          setAfterImagePreview(result)
          setFormData((prev) => ({ ...prev, afterImage: result }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Process tags and results
      const processedData = {
        ...formData,
        tags:
          typeof formData.tags === "string" ? formData.tags.split(",").map((tag) => tag.trim()) : formData.tags || [],
        results:
          typeof formData.results === "string"
            ? formData.results.split(",").map((result) => result.trim())
            : formData.results || [],
      }

      if (selectedItem) {
        // Update existing item using shared service
        const updatedItem = PortfolioService.updateItem(selectedItem.id, processedData)
        if (updatedItem) {
          setPortfolioItems(PortfolioService.getAllItems())
          showNotification("success", "Portfolio item updated successfully!")
        } else {
          throw new Error("Failed to update item")
        }
      } else {
        // Add new item using shared service
        const newItem = PortfolioService.addItem(processedData as Omit<PortfolioItem, "id" | "createdAt" | "updatedAt">)
        setPortfolioItems(PortfolioService.getAllItems())
        showNotification("success", "Portfolio item added successfully!")
      }

      resetForm()
      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
    } catch (error) {
      showNotification("error", "Failed to save portfolio item. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this portfolio item?")) {
      setIsLoading(true)
      try {
        const success = PortfolioService.deleteItem(id)
        if (success) {
          setPortfolioItems(PortfolioService.getAllItems())
          showNotification("success", "Portfolio item deleted successfully!")
        } else {
          throw new Error("Failed to delete item")
        }
      } catch (error) {
        showNotification("error", "Failed to delete portfolio item.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      subcategory: "",
      beforeImage: "",
      afterImage: "",
      description: "",
      duration: "",
      price: "",
      date: new Date().toISOString().split("T")[0],
      rating: 5,
      tags: [],
      clientAge: "",
      results: [],
      testimonial: "",
      clientInitials: "",
      status: "draft",
    })
    setBeforeImageFile(null)
    setAfterImageFile(null)
    setBeforeImagePreview("")
    setAfterImagePreview("")
    setSelectedItem(null)
  }

  // Show notification
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Open edit modal
  const openEditModal = (item: PortfolioItem) => {
    setSelectedItem(item)
    setFormData(item)
    setBeforeImagePreview(item.beforeImage)
    setAfterImagePreview(item.afterImage)
    setIsEditModalOpen(true)
  }

  // Open view modal
  const openViewModal = (item: PortfolioItem) => {
    setSelectedItem(item)
    setIsViewModalOpen(true)
  }

  // Filter items using shared service
  const filteredItems = PortfolioService.filterItems({
    category: filterCategory,
    status: filterStatus,
    search: searchQuery,
  })

  // Get stats using shared service
  const stats = PortfolioService.getStats()

  return (
    <div className="min-h-screen bg-[#fffaff] relative">
      {/* Header */}
      <SharedHeader showBackButton={true} backHref="/" />

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-24 right-4 z-50 p-4 rounded-xl shadow-lg border ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          } animate-slideInRight`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Portfolio Management</h1>
                <p className="text-gray-600">Manage your portfolio images and case studies</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                >
                  Logout
                </Button>
                <Button
                  onClick={loadPortfolioItems}
                  variant="outline"
                  className="border-[#fbc6c5]/30 text-gray-700 hover:bg-[#fbc6c5]/10 bg-transparent"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Item
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#fbc6c5] to-[#d09d80] rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Published</p>
                      <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Drafts</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Archived</p>
                      <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search portfolio items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-[#fbc6c5]/30 focus:border-[#d09d80] focus:ring-[#d09d80]/20"
                />
              </div>

              <div className="flex items-center gap-4">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48 border-[#fbc6c5]/30">
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

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 border-[#fbc6c5]/30">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Portfolio Items Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-[#d09d80]" />
              <span className="ml-3 text-gray-600">Loading portfolio items...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {item.afterImage ? (
                      <Image
                        src={item.afterImage || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={`${
                          item.status === "published"
                            ? "bg-green-500"
                            : item.status === "draft"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                        } text-white`}
                      >
                        {item.status}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openViewModal(item)}
                        className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditModal(item)}
                        className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                        className="w-8 h-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      <span className="font-semibold text-[#d09d80]">{item.price}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs bg-[#fbc6c5]/20 text-gray-600">
                        {item.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < item.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredItems.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No portfolio items found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterCategory !== "all" || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first portfolio item"}
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Portfolio Item
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog
        open={isAddModalOpen || isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false)
            setIsEditModalOpen(false)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#fffaff]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {selectedItem ? "Edit Portfolio Item" : "Add New Portfolio Item"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Nose Thread Lift Transformation"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value, subcategory: "" }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategory: value }))}
                      disabled={!formData.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.category &&
                          subcategories[formData.category as keyof typeof subcategories]?.map((sub) => (
                            <SelectItem key={sub} value={sub}>
                              {sub}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the treatment and results..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 1 hour"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g., ₱9,999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientAge">Client Age</Label>
                    <Input
                      id="clientAge"
                      value={formData.clientAge}
                      onChange={(e) => setFormData((prev) => ({ ...prev, clientAge: e.target.value }))}
                      placeholder="e.g., 28"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Select
                    value={formData.rating?.toString()}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, rating: Number.parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Star{rating !== 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value as "published" | "draft" | "archived" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Column - Images and Additional Info */}
              <div className="space-y-4">
                {/* Before Image Upload */}
                <div>
                  <Label>Before Image</Label>
                  <div className="border-2 border-dashed border-[#fbc6c5]/30 rounded-xl p-4 text-center hover:border-[#fbc6c5]/50 transition-colors">
                    {beforeImagePreview ? (
                      <div className="relative">
                        <Image
                          src={beforeImagePreview || "/placeholder.svg"}
                          alt="Before preview"
                          width={200}
                          height={150}
                          className="mx-auto rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setBeforeImagePreview("")
                            setBeforeImageFile(null)
                            setFormData((prev) => ({ ...prev, beforeImage: "" }))
                          }}
                          className="absolute top-2 right-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload before image</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, "before")
                          }}
                          className="hidden"
                          id="before-image"
                        />
                        <Label
                          htmlFor="before-image"
                          className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#fbc6c5] text-white rounded-lg hover:bg-[#d09d80] transition-colors"
                        >
                          Choose File
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                {/* After Image Upload */}
                <div>
                  <Label>After Image</Label>
                  <div className="border-2 border-dashed border-[#fbc6c5]/30 rounded-xl p-4 text-center hover:border-[#fbc6c5]/50 transition-colors">
                    {afterImagePreview ? (
                      <div className="relative">
                        <Image
                          src={afterImagePreview || "/placeholder.svg"}
                          alt="After preview"
                          width={200}
                          height={150}
                          className="mx-auto rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setAfterImagePreview("")
                            setAfterImageFile(null)
                            setFormData((prev) => ({ ...prev, afterImage: "" }))
                          }}
                          className="absolute top-2 right-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload after image</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, "after")
                          }}
                          className="hidden"
                          id="after-image"
                        />
                        <Label
                          htmlFor="after-image"
                          className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#fbc6c5] text-white rounded-lg hover:bg-[#d09d80] transition-colors"
                        >
                          Choose File
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={Array.isArray(formData.tags) ? formData.tags.join(", ") : formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., Non-surgical, Instant results, Natural looking"
                  />
                </div>

                <div>
                  <Label htmlFor="results">Results (comma-separated)</Label>
                  <Textarea
                    id="results"
                    value={Array.isArray(formData.results) ? formData.results.join(", ") : formData.results}
                    onChange={(e) => setFormData((prev) => ({ ...prev, results: e.target.value }))}
                    placeholder="e.g., Higher nose bridge, Defined tip, Improved profile"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="testimonial">Client Testimonial</Label>
                  <Textarea
                    id="testimonial"
                    value={formData.testimonial}
                    onChange={(e) => setFormData((prev) => ({ ...prev, testimonial: e.target.value }))}
                    placeholder="Client's feedback about the treatment..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="clientInitials">Client Initials</Label>
                  <Input
                    id="clientInitials"
                    value={formData.clientInitials}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientInitials: e.target.value }))}
                    placeholder="e.g., M.S."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setIsEditModalOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {selectedItem ? "Update Item" : "Save Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#fffaff]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">{selectedItem?.title}</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Images */}
                <div className="space-y-4">
                  {selectedItem.beforeImage && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Before Image</Label>
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                        <Image
                          src={selectedItem.beforeImage || "/placeholder.svg"}
                          alt="Before"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {selectedItem.afterImage && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">After Image</Label>
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                        <Image
                          src={selectedItem.afterImage || "/placeholder.svg"}
                          alt="After"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Category</Label>
                      <p className="text-gray-900">{selectedItem.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Subcategory</Label>
                      <p className="text-gray-900">{selectedItem.subcategory}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <p className="text-gray-900">{selectedItem.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Duration</Label>
                      <p className="text-gray-900">{selectedItem.duration}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Price</Label>
                      <p className="text-gray-900 font-semibold text-[#d09d80]">{selectedItem.price}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Date</Label>
                      <p className="text-gray-900">{new Date(selectedItem.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Client Age</Label>
                      <p className="text-gray-900">{selectedItem.clientAge} years</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Rating</Label>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < selectedItem.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({selectedItem.rating}/5)</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Badge
                      className={`${
                        selectedItem.status === "published"
                          ? "bg-green-500"
                          : selectedItem.status === "draft"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                      } text-white`}
                    >
                      {selectedItem.status}
                    </Badge>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedItem.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#fbc6c5]/20 text-gray-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Results</Label>
                    <ul className="list-disc list-inside text-gray-900 space-y-1">
                      {selectedItem.results.map((result, index) => (
                        <li key={index}>{result}</li>
                      ))}
                    </ul>
                  </div>

                  {selectedItem.testimonial && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Client Testimonial</Label>
                      <blockquote className="text-gray-900 italic border-l-4 border-[#fbc6c5] pl-4">
                        "{selectedItem.testimonial}"
                        {selectedItem.clientInitials && (
                          <cite className="block text-sm text-gray-600 mt-2">- {selectedItem.clientInitials}</cite>
                        )}
                      </blockquote>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    openEditModal(selectedItem)
                  }}
                  className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Item
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
