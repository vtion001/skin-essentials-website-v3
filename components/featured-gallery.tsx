'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Eye, Star, Clock, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface FeaturedItem {
  id: string
  title: string
  category: string
  beforeImage: string
  afterImage: string
  description: string
  treatment: string
  duration: string
  results: string
  featured?: boolean
}

interface FeaturedGalleryProps {
  items: FeaturedItem[]
  title?: string
  subtitle?: string
  maxItems?: number
  layout?: 'grid' | 'masonry' | 'carousel'
  onViewAll?: () => void
  className?: string
}

export function FeaturedGallery({
  items,
  title = "Featured Transformations",
  subtitle = "Discover our most remarkable before-and-after results",
  maxItems = 6,
  layout = 'masonry',
  onViewAll,
  className = ''
}: FeaturedGalleryProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  
  // Filter and limit items
  const displayItems = items
    .filter(item => item.featured !== false)
    .slice(0, maxItems)

  if (!displayItems || displayItems.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-gray-200 shadow-sm">
          <Eye className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-600 mb-3">No featured transformations</h3>
          <p className="text-gray-500 leading-relaxed">Check back soon for amazing before-and-after results.</p>
        </div>
      </div>
    )
  }

  const getGridClasses = () => {
    switch (layout) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      case 'masonry':
        return 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6'
      case 'carousel':
        return 'flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory'
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    }
  }

  const getItemClasses = (index: number) => {
    if (layout === 'carousel') {
      return 'flex-shrink-0 w-80 snap-start'
    }
    if (layout === 'masonry') {
      return 'break-inside-avoid mb-6'
    }
    return ''
  }

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full text-rose-600 font-medium text-sm mb-6">
            <Star className="w-4 h-4 mr-2" />
            Featured Results
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Gallery */}
        <div className={getGridClasses()}>
          {displayItems.map((item, index) => (
            <Card
              key={item.id}
              className={`group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-3xl overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-lg ${getItemClasses(index)}`}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Before & After Images */}
              <div className="relative overflow-hidden">
                <div className={`grid grid-cols-2 ${layout === 'masonry' && index % 3 === 1 ? 'h-80' : 'h-64'} lg:h-72`}>
                  {/* Before Image */}
                  <div className="relative">
                    <Image
                      src={item.beforeImage || "/placeholder.svg"}
                      alt={`Before ${item.title}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 shadow-lg">
                        Before
                      </Badge>
                    </div>
                  </div>

                  {/* After Image */}
                  <div className="relative">
                    <Image
                      src={item.afterImage || "/placeholder.svg"}
                      alt={`After ${item.title}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 shadow-lg">
                        After
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${
                  hoveredItem === item.id ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-sm font-medium mb-2">Click to view details</p>
                    <div className="flex items-center text-xs space-x-4">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.duration}
                      </span>
                      <span className="flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {item.results}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 text-xs font-semibold shadow-sm">
                    {item.category}
                  </Badge>
                  {item.featured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 text-xs font-semibold">
                      Featured
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors duration-300 leading-tight">
                  {item.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed text-sm lg:text-base line-clamp-3">
                  {item.description}
                </p>

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

        {/* View All Button */}
        {onViewAll && (
          <div className="text-center mt-12">
            <Button
              onClick={onViewAll}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              View All Transformations
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-rose-500">{displayItems.length}+</div>
            <div className="text-gray-600 text-sm md:text-base">Featured Results</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-pink-500">
              {new Set(displayItems.map(item => item.category)).size}
            </div>
            <div className="text-gray-600 text-sm md:text-base">Treatment Types</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-purple-500">100%</div>
            <div className="text-gray-600 text-sm md:text-base">Satisfaction</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-rose-500">Real</div>
            <div className="text-gray-600 text-sm md:text-base">Results</div>
          </div>
        </div>
      </div>
    </section>
  )
}