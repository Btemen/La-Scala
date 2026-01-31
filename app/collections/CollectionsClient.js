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

export default function CollectionsClient({ products, categories }) {
  const [selectedGender, setSelectedGender] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [sortBy, setSortBy] = useState('price_asc')

  // Filter products
  let filteredProducts = products.filter(product => {
    if (selectedGender && product.gender !== selectedGender) return false
    if (selectedCategory && product.category_id !== selectedCategory) return false
    return true
  })

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return (a.current_price || a.retail_price) - (b.current_price || b.retail_price)
      case 'price_desc':
        return (b.current_price || b.retail_price) - (a.current_price || a.retail_price)
      case 'name_asc':
        return a.name.localeCompare(b.name)
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at)
      default:
        return 0
    }
  })

  const clearFilters = () => {
    setSelectedGender(null)
    setSelectedSize(null)
    setSelectedCategory(null)
  }

  const hasFilters = selectedGender || selectedSize || selectedCategory

  return (
    <section className="px-12 pb-20">
      <div className="max-w-7xl mx-auto flex gap-12">
        
        {/* Filters Sidebar */}
        <div className="w-48 flex-shrink-0">
          
          {/* Gender */}
          <div className="mb-8">
            <h3 className="text-xs tracking-[2px] uppercase text-warm-gray mb-4">Gender</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedGender(selectedGender === 'M' ? null : 'M')}
                className={`px-4 py-2 text-xs tracking-wide border transition-all ${
                  selectedGender === 'M' 
                    ? 'bg-charcoal text-white border-charcoal' 
                    : 'border-light-gray hover:border-charcoal'
                }`}
              >
                Men
              </button>
              <button
                onClick={() => setSelectedGender(selectedGender === 'W' ? null : 'W')}
                className={`px-4 py-2 text-xs tracking-wide border transition-all ${
                  selectedGender === 'W' 
                    ? 'bg-charcoal text-white border-charcoal' 
                    : 'border-light-gray hover:border-charcoal'
                }`}
              >
                Women
              </button>
            </div>
          </div>

          {/* Size */}
          <div className="mb-8">
            <h3 className="text-xs tracking-[2px] uppercase text-warm-gray mb-4">Size</h3>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(size => (
                <button
                  key={size.value}
                  onClick={() => setSelectedSize(selectedSize === size.value ? null : size.value)}
                  className={`w-10 h-10 text-xs border transition-all ${
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

          {/* Category */}
          <div className="mb-8">
            <h3 className="text-xs tracking-[2px] uppercase text-warm-gray mb-4">Category</h3>
            <div className="flex flex-col gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`px-3 py-2 text-xs text-left tracking-wide border transition-all ${
                    selectedCategory === cat.id 
                      ? 'bg-charcoal text-white border-charcoal' 
                      : 'border-light-gray hover:border-charcoal'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-warm-gray underline hover:text-charcoal"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          
          {/* Sort & Count */}
          <div className="flex justify-between items-center mb-8">
            <p className="text-sm text-warm-gray">{filteredProducts.length} products</p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 text-sm border border-light-gray bg-white focus:border-charcoal outline-none"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
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
                  <h3 className="font-serif text-xl mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    {isOnSale && (
                      <span className="text-warm-gray line-through">${product.retail_price?.toLocaleString()}</span>
                    )}
                    <span className={isOnSale ? 'text-red-600' : 'text-charcoal'}>
                      ${price?.toLocaleString()}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-warm-gray">No products match your filters</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-sm underline hover:no-underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}