'use client'

import { useState } from 'react'
import Link from 'next/link'

const SIZES = [
  { label: 'XXS', value: '44' },
  { label: 'XS', value: '46' },
  { label: 'S', value: '48' },
  { label: 'M', value: '50' },
  { label: 'L', value: '52' },
  { label: 'XL', value: '54' },
  { label: 'XXL', value: '56' },
]

const ITEMS_PER_PAGE = 12

export default function CollectionsClient({ products, categories }) {
  const [selectedGender, setSelectedGender] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  // Filter products
  let filteredProducts = products.filter(product => {
    if (selectedGender && product.gender !== selectedGender) return false
    if (selectedCategory && product.category_id !== selectedCategory) return false
    return true
  })

  // Sort by highest price descending
  filteredProducts = [...filteredProducts].sort((a, b) => {
    return (b.current_price || b.retail_price) - (a.current_price || a.retail_price)
  })

  const visibleProducts = filteredProducts.slice(0, visibleCount)
  const hasMore = visibleCount < filteredProducts.length

  const clearFilters = () => {
    setSelectedGender(null)
    setSelectedSize(null)
    setSelectedCategory(null)
    setVisibleCount(ITEMS_PER_PAGE)
  }

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE)
  }

  const hasFilters = selectedGender || selectedSize || selectedCategory

  return (
    <>
      {/* Secondary Filter Header */}
      <div className="sticky top-[73px] z-40 bg-cream/95 backdrop-blur-md border-b border-light-gray">
        <div className="max-w-7xl mx-auto px-12 py-4">
          <div className="flex items-center justify-between gap-8">
            
            {/* Left: Filters */}
            <div className="flex items-center gap-6">
              
              {/* Gender */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[2px] uppercase text-warm-gray">Gender</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSelectedGender(selectedGender === 'M' ? null : 'M')}
                    className={`px-3 py-1.5 text-[10px] tracking-wide border transition-all ${
                      selectedGender === 'M' 
                        ? 'bg-charcoal text-white border-charcoal' 
                        : 'border-light-gray hover:border-charcoal'
                    }`}
                  >
                    Men
                  </button>
                  <button
                    onClick={() => setSelectedGender(selectedGender === 'W' ? null : 'W')}
                    className={`px-3 py-1.5 text-[10px] tracking-wide border transition-all ${
                      selectedGender === 'W' 
                        ? 'bg-charcoal text-white border-charcoal' 
                        : 'border-light-gray hover:border-charcoal'
                    }`}
                  >
                    Women
                  </button>
                </div>
              </div>

              <div className="w-px h-6 bg-light-gray" />

              {/* Size */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[2px] uppercase text-warm-gray">Size</span>
                <div className="flex gap-1">
                  {SIZES.map(size => (
                    <button
                      key={size.value}
                      onClick={() => setSelectedSize(selectedSize === size.value ? null : size.value)}
                      className={`w-8 h-8 text-[10px] border transition-all ${
                        selectedSize === size.value 
                          ? 'bg-charcoal text-white border-charcoal' 
                          : 'border-light-gray hover:border-charcoal'
                      }`}
                      title={`${size.label} (${size.value})`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-px h-6 bg-light-gray" />

              {/* Category Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[2px] uppercase text-warm-gray">Category</span>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="px-3 py-1.5 text-[10px] tracking-wide border border-light-gray bg-transparent focus:border-charcoal outline-none min-w-[120px]"
                >
                  <option value="">All</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: Count & Clear */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] tracking-[2px] uppercase text-warm-gray">
                {filteredProducts.length} pieces
              </span>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] tracking-wide text-warm-gray underline hover:text-charcoal"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {visibleProducts.map((product) => {
              const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]
              const price = product.current_price || product.retail_price
              const isOnSale = product.current_price && product.current_price < product.retail_price
              
              return (
                <Link 
                  key={product.id} 
                  href={`/product/${product.sku}`}
                  className="group"
                >
                  <div className="aspect-[3/4] bg-light-gray overflow-hidden mb-4">
                    {primaryImage && (
                      <img 
                        src={primaryImage.url}
                        alt={primaryImage.alt_text || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <p className="text-xs tracking-[2px] uppercase text-warm-gray mb-2">
                    {product.brand?.name}
                  </p>
                  <h3 className="font-serif text-lg mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    {isOnSale && (
                      <span className="text-warm-gray line-through text-sm">${product.retail_price?.toLocaleString()}</span>
                    )}
                    <span className={`${isOnSale ? 'text-red-600' : 'text-charcoal'}`}>
                      ${price?.toLocaleString()}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Load More / Pagination */}
          {hasMore && (
            <div className="mt-16 text-center">
              <div className="mb-4">
                <span className="text-sm text-warm-gray">
                  Showing {visibleCount} of {filteredProducts.length}
                </span>
              </div>
              <button
                onClick={loadMore}
                className="px-12 py-4 border border-charcoal text-xs tracking-[2px] uppercase hover:bg-charcoal hover:text-white transition-all"
              >
                Load More
              </button>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-warm-gray mb-4">No products match your filters</p>
              <button
                onClick={clearFilters}
                className="text-sm underline hover:no-underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}