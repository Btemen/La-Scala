'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

export default function ProductClient({ product, images, inventoryBySize, listings }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [sizeFilter, setSizeFilter] = useState('all')
  const listingsRef = useRef(null)

  const sizes = Object.keys(inventoryBySize)
  
  // Determine size availability type
  const getSizeType = (size) => {
    const sizeData = inventoryBySize[size]
    const hasRetail = sizeData?.retail
    const hasPreowned = sizeData?.preowned?.length > 0
    
    if (hasRetail && hasPreowned) return 'retail_and_preowned'
    if (hasRetail) return 'retail'
    if (hasPreowned) return 'preowned_only'
    return 'unavailable'
  }

  // Check if size has preowned
  const sizeHasPreowned = (size) => {
    const sizeData = inventoryBySize[size]
    return sizeData?.preowned?.length > 0
  }

  // Get the current inventory source for selected size
  const currentInventory = selectedSize ? inventoryBySize[selectedSize]?.retail : null

  // Scroll to listings and filter
  const scrollToListings = (size) => {
    setSizeFilter(size)
    listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Filter listings
  const filteredListings = sizeFilter === 'all' 
    ? listings 
    : listings.filter(l => l.size === sizeFilter)

  // Get available sizes for filter buttons
  const sizesWithListings = [...new Set(listings.map(l => l.size))]

  return (
    <>
      {/* Main Product Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-[1600px] mx-auto px-12 py-8">
        {/* Gallery */}
        <div className="flex gap-4 lg:sticky lg:top-28 self-start">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(idx)}
                className={`w-20 h-24 overflow-hidden border transition-all ${
                  selectedImage === idx ? 'border-charcoal' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img 
                  src={img.url} 
                  alt={img.alt_text || `View ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          
          {/* Main Image */}
          <div className="flex-1 aspect-[3/4] bg-light-gray overflow-hidden">
            {images[selectedImage] && (
              <img 
                src={images[selectedImage].url}
                alt={images[selectedImage].alt_text || product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="pt-4">
          <Link href="#" className="text-[11px] tracking-[3px] uppercase text-warm-gray hover:text-charcoal transition-colors">
            {product.brand?.name}
          </Link>
          <h1 className="font-serif text-4xl font-normal mt-3 mb-2">{product.name}</h1>
          <p className="text-sm text-warm-gray font-mono mb-6">SKU: {product.sku} · {product.color}</p>
          <p className="text-2xl mb-8">${product.retail_price?.toLocaleString()}</p>
          
          <p className="text-[15px] leading-relaxed text-warm-gray mb-8 max-w-lg">
            {product.description}
          </p>

          {/* Purchase Section */}
          <div className="bg-white border border-light-gray p-8 mb-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <span className="text-[11px] tracking-[2px] uppercase text-warm-gray">Purchase</span>
                {currentInventory && (
                  <span className={`text-[10px] tracking-[1.5px] uppercase px-3 py-1.5 ${
                    currentInventory.source.source_type === 'owned' 
                      ? 'bg-soft-green text-green' 
                      : currentInventory.source.source_type === 'dropship'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {currentInventory.source.name}
                  </span>
                )}
              </div>
              {currentInventory && (
                <div className="flex items-center gap-1.5 text-sm text-green">
                  <span className="w-1.5 h-1.5 bg-green rounded-full"></span>
                  In Stock
                </div>
              )}
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Size</span>
                <button className="text-[11px] text-warm-gray underline">Size Guide</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {sizes.map(size => {
                  const type = getSizeType(size)
                  const isSelected = selectedSize === size
                  const hasPreowned = sizeHasPreowned(size)
                  const isPreownedOnly = type === 'preowned_only'
                  
                  return (
                    <button
                      key={size}
                      onClick={() => type !== 'unavailable' && setSelectedSize(size)}
                      disabled={type === 'unavailable'}
                      className={`w-14 h-11 border text-sm transition-all relative ${
                        isSelected
                          ? isPreownedOnly
                            ? 'bg-gold border-gold text-white'
                            : 'bg-charcoal border-charcoal text-white'
                          : type === 'unavailable'
                          ? 'border-light-gray text-warm-gray/40 cursor-not-allowed line-through'
                          : isPreownedOnly
                          ? 'border-gold bg-amber-50/50 hover:border-gold'
                          : 'border-light-gray hover:border-charcoal'
                      }`}
                    >
                      {size}
                      {hasPreowned && !isSelected && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-gold rounded-full"></span>
                      )}
                      {hasPreowned && isSelected && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></span>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-4 mt-3 text-[10px] text-warm-gray">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-charcoal rounded-full"></span>
                  Retail
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full"></span>
                  Pre-Owned Available
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border border-gold rounded-sm"></span>
                  Pre-Owned Only
                </div>
              </div>
            </div>

            {/* CTA Button */}
            {!selectedSize ? (
              <button 
                disabled
                className="w-full py-4 bg-light-gray text-warm-gray text-xs tracking-[2px] uppercase"
              >
                Select a Size
              </button>
            ) : getSizeType(selectedSize) === 'retail' || getSizeType(selectedSize) === 'retail_and_preowned' ? (
              <>
                <button className="w-full py-4 bg-charcoal text-white text-xs tracking-[2px] uppercase hover:bg-charcoal/90 transition-colors">
                  Add to Cart
                </button>
                <p className="text-[11px] text-warm-gray mt-4 pt-4 border-t border-light-gray">
                  {currentInventory?.source.source_type === 'owned' 
                    ? 'Ships from La Scala · Free shipping over $500 · Free returns'
                    : currentInventory?.source.source_type === 'dropship'
                    ? 'Fulfilled by authorized partner · 3-5 day shipping · Free returns'
                    : 'You will be redirected to complete your purchase'}
                  {getSizeType(selectedSize) === 'retail_and_preowned' && inventoryBySize[selectedSize]?.preowned?.length > 0 && (
                    <span className="block mt-2 text-gold cursor-pointer hover:underline" onClick={() => scrollToListings(selectedSize)}>
                      Also available pre-owned from ${Math.min(...inventoryBySize[selectedSize].preowned.map(l => l.price)).toLocaleString()}
                    </span>
                  )}
                </p>
              </>
            ) : getSizeType(selectedSize) === 'preowned_only' ? (
              <>
                <button 
                  onClick={() => scrollToListings(selectedSize)}
                  className="w-full py-4 bg-gold text-white text-xs tracking-[2px] uppercase hover:bg-gold/90 transition-colors"
                >
                  View Pre-Owned in Size {selectedSize}
                </button>
                <p className="text-[11px] text-warm-gray mt-4 pt-4 border-t border-light-gray">
                  {inventoryBySize[selectedSize]?.preowned?.length} listing{inventoryBySize[selectedSize]?.preowned?.length !== 1 ? 's' : ''} available from our community
                </p>
              </>
            ) : null}
          </div>

          {/* Product Details Accordion */}
          <div className="border-t border-light-gray">
            <ProductDetail title="Details" defaultOpen>
              <p className="text-sm text-warm-gray leading-relaxed">
                • {product.materials}<br/>
                • Made in {product.origin_country || 'Italy'}
              </p>
            </ProductDetail>
            <ProductDetail title="Care">
              <p className="text-sm text-warm-gray leading-relaxed">
                {product.care_instructions || 'Professional dry clean recommended.'}
              </p>
            </ProductDetail>
          </div>
        </div>
      </section>

      {/* Pre-Owned Marketplace */}
      <section ref={listingsRef} className="max-w-[1600px] mx-auto px-12 py-16 border-t border-light-gray">
        <div className="flex justify-between items-end mb-10 flex-wrap gap-6">
          <div>
            <h2 className="font-serif text-3xl font-normal">Pre-Owned Marketplace</h2>
            <p className="text-sm text-warm-gray mt-2">Authenticated listings from our community</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] tracking-wide uppercase text-warm-gray">Filter:</span>
              <button
                onClick={() => setSizeFilter('all')}
                className={`px-3 py-2 text-xs border transition-all ${
                  sizeFilter === 'all' ? 'bg-charcoal text-white border-charcoal' : 'border-light-gray hover:border-charcoal'
                }`}
              >
                All Sizes
              </button>
              {sizesWithListings.map(size => (
                <button
                  key={size}
                  onClick={() => setSizeFilter(size)}
                  className={`px-3 py-2 text-xs border transition-all ${
                    sizeFilter === size ? 'bg-charcoal text-white border-charcoal' : 'border-light-gray hover:border-charcoal'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <button className="px-6 py-3 border border-charcoal text-[11px] tracking-[2px] uppercase hover:bg-charcoal hover:text-white transition-all">
              + List Yours
            </button>
          </div>
        </div>

        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredListings.map(listing => {
              const savingsPercent = Math.round((1 - listing.price / product.retail_price) * 100)
              return (
                <div key={listing.id} className="bg-white border border-light-gray hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-light-gray">
                    <img 
                      src={images[0]?.url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[10px] tracking-wide uppercase px-2 py-1 ${
                        listing.condition === 'like_new' || listing.condition === 'excellent'
                          ? 'bg-soft-green text-green'
                          : listing.condition === 'good'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {listing.condition.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-warm-gray">Size {listing.size}</span>
                    </div>
                    <p className="text-lg font-medium mb-1">${listing.price.toLocaleString()}</p>
                    <p className="text-xs text-green mb-4">{savingsPercent}% below retail</p>
                    
                    <div className="flex items-center gap-2 pt-4 border-t border-light-gray mb-4">
                      <div className="w-7 h-7 rounded-full bg-light-gray"></div>
                      <div>
                        <p className="text-xs font-medium">Verified Seller</p>
                        <p className="text-[11px] text-warm-gray">
                          ★★★★★ · Authenticated
                        </p>
                      </div>
                    </div>
                    
                    <button className="w-full py-3 bg-charcoal text-white text-[11px] tracking-[1.5px] uppercase hover:bg-charcoal/90 transition-colors">
                      Buy Now
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-dashed border-light-gray">
            <h3 className="font-serif text-2xl mb-3">No listings yet</h3>
            <p className="text-warm-gray mb-6">Be the first to list this item</p>
            <button className="px-8 py-3 bg-charcoal text-white text-[11px] tracking-[2px] uppercase hover:bg-charcoal/90 transition-colors">
              + List Yours
            </button>
          </div>
        )}
      </section>
    </>
  )
}

function ProductDetail({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border-b border-light-gray">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-5 text-xs tracking-wide uppercase hover:text-warm-gray transition-colors"
      >
        {title}
        <span className={`text-lg transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
      </button>
      {isOpen && (
        <div className="pb-5">
          {children}
        </div>
      )}
    </div>
  )
}