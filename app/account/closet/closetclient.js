'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CONDITIONS = [
  { value: 'new_with_tags', label: 'New with Tags', multiplier: 0.85 },
  { value: 'like_new', label: 'Like New', multiplier: 0.75 },
  { value: 'excellent', label: 'Excellent', multiplier: 0.65 },
  { value: 'good', label: 'Good', multiplier: 0.50 },
]

export default function ClosetClient({ products }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [closetItems, setClosetItems] = useState([])
  const [wtbMatches, setWtbMatches] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [notes, setNotes] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [openToOffers, setOpenToOffers] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchClosetItems()
      fetchWtbMatches()
    }
  }, [user])

  const fetchClosetItems = async () => {
    const { data, error } = await supabase
      .from('closet_items')
      .select(`
        *,
        product:products(
          *,
          brand:brands(*),
          images:product_images(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) {
      setClosetItems(data || [])
    }
  }

  const fetchWtbMatches = async () => {
    // Get WTB offers that match items in user's closet
    const { data: closet } = await supabase
      .from('closet_items')
      .select('product_id, size')
      .eq('user_id', user.id)

    if (closet && closet.length > 0) {
      const { data: wtb } = await supabase
        .from('wtb_offers')
        .select(`
          *,
          product:products(name, brand:brands(name)),
          buyer:profiles(display_name)
        `)
        .eq('status', 'active')
        .neq('user_id', user.id)

      // Filter to matches
      const matches = wtb?.filter(offer => 
        closet.some(item => 
          item.product_id === offer.product_id && item.size === offer.size
        )
      ) || []
      
      setWtbMatches(matches)
    }
  }

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = products.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.manufacturer_sku?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, products])

  const handleSelectProduct = (product) => {
    setSelectedProduct(product)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleAddItem = async () => {
    if (!selectedProduct || !selectedSize || !selectedCondition) return
    
    setSubmitting(true)
    
    const { error } = await supabase
      .from('closet_items')
      .insert({
        user_id: user.id,
        product_id: selectedProduct.id,
        size: selectedSize,
        condition: selectedCondition,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
        notes,
        is_public: isPublic,
        open_to_offers: openToOffers,
      })

    if (!error) {
      setShowAddModal(false)
      setSelectedProduct(null)
      setSelectedSize('')
      setSelectedCondition('')
      setPurchasePrice('')
      setNotes('')
      setIsPublic(false)
      setOpenToOffers(false)
      fetchClosetItems()
      fetchWtbMatches()
    }
    
    setSubmitting(false)
  }

  const togglePublic = async (itemId, currentValue) => {
    await supabase
      .from('closet_items')
      .update({ is_public: !currentValue })
      .eq('id', itemId)
    fetchClosetItems()
  }

  const toggleOpenToOffers = async (itemId, currentValue) => {
    await supabase
      .from('closet_items')
      .update({ open_to_offers: !currentValue })
      .eq('id', itemId)
    fetchClosetItems()
  }

  const removeItem = async (itemId) => {
    if (confirm('Remove this item from your closet?')) {
      await supabase
        .from('closet_items')
        .delete()
        .eq('id', itemId)
      fetchClosetItems()
    }
  }

  // Calculate closet values
  const retailValue = closetItems.reduce((sum, item) => {
    return sum + (item.product?.retail_price || 0)
  }, 0)

  const estimatedResale = closetItems.reduce((sum, item) => {
    const condition = CONDITIONS.find(c => c.value === item.condition)
    const multiplier = condition?.multiplier || 0.5
    return sum + ((item.product?.retail_price || 0) * multiplier)
  }, 0)

  const totalPurchasePrice = closetItems.reduce((sum, item) => {
    return sum + (item.purchase_price || 0)
  }, 0)

  if (loading || !user) {
    return (
      <div className="pt-32 px-12 text-center">
        <p className="text-warm-gray">Loading...</p>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-20 px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="font-serif text-4xl mb-2">My Closet</h1>
            <p className="text-warm-gray">{closetItems.length} pieces in your collection</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-charcoal text-white text-xs tracking-[2px] uppercase hover:bg-charcoal/90 transition-colors"
          >
            + Add Item
          </button>
        </div>

        {/* Value Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white border border-light-gray p-6">
            <p className="text-xs tracking-[2px] uppercase text-warm-gray mb-2">Total Pieces</p>
            <p className="font-serif text-3xl">{closetItems.length}</p>
          </div>
          <div className="bg-white border border-light-gray p-6">
            <p className="text-xs tracking-[2px] uppercase text-warm-gray mb-2">Retail Value</p>
            <p className="font-serif text-3xl">${retailValue.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-light-gray p-6">
            <p className="text-xs tracking-[2px] uppercase text-warm-gray mb-2">Est. Resale Value</p>
            <p className="font-serif text-3xl text-green">${estimatedResale.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-light-gray p-6">
            <p className="text-xs tracking-[2px] uppercase text-warm-gray mb-2">Your Investment</p>
            <p className="font-serif text-3xl">${totalPurchasePrice.toLocaleString()}</p>
          </div>
        </div>

        {/* WTB Matches Alert */}
        {wtbMatches.length > 0 && (
          <div className="bg-gold/10 border border-gold p-6 mb-12">
            <h3 className="font-serif text-xl mb-4">
              🔥 {wtbMatches.length} Buyer{wtbMatches.length > 1 ? 's' : ''} Looking for Your Items
            </h3>
            <div className="space-y-3">
              {wtbMatches.map(offer => (
                <div key={offer.id} className="flex justify-between items-center bg-white p-4">
                  <div>
                    <p className="font-medium">{offer.product?.brand?.name} {offer.product?.name}</p>
                    <p className="text-sm text-warm-gray">Size {offer.size} · {offer.condition_minimum?.replace(/_/g, ' ')} or better</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-green">Up to ${offer.max_price?.toLocaleString()}</p>
                    <p className="text-xs text-warm-gray">from {offer.buyer?.display_name || 'Anonymous'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Closet Items */}
        {closetItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {closetItems.map(item => {
              const primaryImage = item.product?.images?.find(img => img.is_primary) || item.product?.images?.[0]
              const condition = CONDITIONS.find(c => c.value === item.condition)
              const resaleValue = (item.product?.retail_price || 0) * (condition?.multiplier || 0.5)
              
              return (
                <div key={item.id} className="bg-white border border-light-gray">
                  <div className="aspect-[4/3] bg-light-gray overflow-hidden">
                    {primaryImage && (
                      <img 
                        src={primaryImage.url} 
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs tracking-[2px] uppercase text-warm-gray mb-1">
                      {item.product?.brand?.name}
                    </p>
                    <h3 className="font-serif text-lg mb-2">{item.product?.name}</h3>
                    <div className="flex gap-3 text-sm text-warm-gray mb-4">
                      <span>Size {item.size}</span>
                      <span>·</span>
                      <span>{condition?.label}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-warm-gray">Retail: ${item.product?.retail_price?.toLocaleString()}</span>
                      <span className="text-green">Resale: ~${resaleValue.toLocaleString()}</span>
                    </div>

                    {/* Toggles */}
                    <div className="flex gap-4 mb-4 pt-4 border-t border-light-gray">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.is_public}
                          onChange={() => togglePublic(item.id, item.is_public)}
                          className="w-4 h-4"
                        />
                        <span className="text-xs">Public</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.open_to_offers}
                          onChange={() => toggleOpenToOffers(item.id, item.open_to_offers)}
                          className="w-4 h-4"
                        />
                        <span className="text-xs">Open to Offers</span>
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/product/${item.product?.sku}`}
                        className="flex-1 py-2 text-center text-xs tracking-wide border border-light-gray hover:border-charcoal transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="px-4 py-2 text-xs text-red-600 border border-light-gray hover:border-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-dashed border-light-gray">
            <h3 className="font-serif text-2xl mb-3">Your closet is empty</h3>
            <p className="text-warm-gray mb-6">Add items to track your collection and see offers from buyers</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-charcoal text-white text-xs tracking-[2px] uppercase hover:bg-charcoal/90 transition-colors"
            >
              + Add Your First Item
            </button>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-cream w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-serif text-2xl">Add to Closet</h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      setSelectedProduct(null)
                      setSearchQuery('')
                    }}
                    className="text-2xl text-warm-gray hover:text-charcoal"
                  >
                    ×
                  </button>
                </div>

                {!selectedProduct ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by product name or SKU..."
                      className="w-full px-4 py-4 border border-light-gray focus:border-charcoal outline-none"
                    />
                    
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-light-gray border-t-0 shadow-lg max-h-64 overflow-y-auto z-10">
                        {searchResults.map(product => (
                          <button
                            key={product.id}
                            onClick={() => handleSelectProduct(product)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-cream transition-colors text-left"
                          >
                            <div className="w-12 h-14 bg-light-gray overflow-hidden">
                              {product.images?.[0] && (
                                <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-warm-gray">{product.brand?.name}</p>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-warm-gray">SKU: {product.sku}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Selected Product */}
                    <div className="flex items-center gap-4 pb-6 mb-6 border-b border-light-gray">
                      <div className="w-16 h-20 bg-light-gray overflow-hidden">
                        {selectedProduct.images?.[0] && (
                          <img src={selectedProduct.images[0].url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-warm-gray">{selectedProduct.brand?.name}</p>
                        <p className="font-serif text-lg">{selectedProduct.name}</p>
                        <button
                          onClick={() => setSelectedProduct(null)}
                          className="text-xs text-warm-gray underline"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    {/* Size */}
                    <div className="mb-6">
                      <label className="block text-xs tracking-[2px] uppercase text-warm-gray mb-3">Size</label>
                      <div className="flex gap-2 flex-wrap">
                        {selectedProduct.sizes?.map(s => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedSize(s.size)}
                            className={`w-14 h-11 border text-sm transition-all ${
                              selectedSize === s.size
                                ? 'bg-charcoal border-charcoal text-white'
                                : 'border-light-gray hover:border-charcoal'
                            }`}
                          >
                            {s.size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Condition */}
                    <div className="mb-6">
                      <label className="block text-xs tracking-[2px] uppercase text-warm-gray mb-3">Condition</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CONDITIONS.map(c => (
                          <button
                            key={c.value}
                            onClick={() => setSelectedCondition(c.value)}
                            className={`p-3 border text-left transition-all ${
                              selectedCondition === c.value
                                ? 'border-charcoal bg-white'
                                : 'border-light-gray hover:border-charcoal'
                            }`}
                          >
                            <p className="text-sm font-medium">{c.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Purchase Price */}
                    <div className="mb-6">
                      <label className="block text-xs tracking-[2px] uppercase text-warm-gray mb-2">
                        Purchase Price (Optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray">$</span>
                        <input
                          type="number"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(e.target.value)}
                          placeholder="What did you pay?"
                          className="w-full pl-8 pr-4 py-3 border border-light-gray focus:border-charcoal outline-none"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                      <label className="block text-xs tracking-[2px] uppercase text-warm-gray mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any details about this piece..."
                        rows={2}
                        className="w-full px-4 py-3 border border-light-gray focus:border-charcoal outline-none resize-none"
                      />
                    </div>

                    {/* Toggles */}
                    <div className="flex gap-6 mb-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Show in public profile</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={openToOffers}
                          onChange={(e) => setOpenToOffers(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Open to offers</span>
                      </label>
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleAddItem}
                      disabled={!selectedSize || !selectedCondition || submitting}
                      className="w-full py-4 bg-charcoal text-white text-xs tracking-[2px] uppercase hover:bg-charcoal/90 transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Adding...' : 'Add to Closet'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}