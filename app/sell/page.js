'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function SellPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [step, setStep] = useState(1)
  
  const [size, setSize] = useState('')
  const [condition, setCondition] = useState('')
  const [conditionNotes, setConditionNotes] = useState('')
  const [price, setPrice] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 2) {
        setProducts([])
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(*),
          sizes:product_sizes(*),
          images:product_images(*)
        `)
        .or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`)
        .limit(10)

      if (error) {
        console.error('Search error:', error)
      }
      setProducts(data || [])
    }

    const debounce = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleSelectProduct = (product) => {
    setSelectedProduct(product)
    setSearchQuery('')
    setProducts([])
    setStep(2)
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    if (images.length + files.length > 6) {
      alert('Maximum 6 images allowed')
      return
    }

    setUploading(true)

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file)

      if (error) {
        console.error('Upload error:', error)
        alert('Error uploading image')
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName)
        
        setImages(prev => [...prev, { path: fileName, url: publicUrl }])
      }
    }

    setUploading(false)
  }

  const removeImage = async (index) => {
    const image = images[index]
    
    await supabase.storage
      .from('listing-images')
      .remove([image.path])
    
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    console.log('User ID:', user.id)
    console.log('User:', user)

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        product_id: selectedProduct.id,
        seller_id: user.id,
        size,
        condition,
        condition_notes: conditionNotes,
        price: parseFloat(price),
        status: 'pending_review',
        authentication_status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating listing:', error)
      alert('Error creating listing. Please try again.')
      setSubmitting(false)
      return
    }

    if (images.length > 0) {
      const imageRecords = images.map((img, index) => ({
        listing_id: listing.id,
        url: img.url,
        position: index,
      }))

      const { error: imgError } = await supabase
        .from('listing_images')
        .insert(imageRecords)

      if (imgError) {
        console.error('Error saving images:', imgError)
      }
    }

    setSuccess(true)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <Header />
        <div className="pt-32 px-12 text-center">Loading...</div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  if (success) {
    return (
      <main className="min-h-screen bg-cream">
        <Header />
        <div className="pt-32 px-12 max-w-2xl mx-auto text-center">
          <div className="bg-white border border-light-gray p-12">
            <div className="w-20 h-20 bg-soft-green rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-green text-3xl">✓</span>
            </div>
            <h1 className="font-serif text-3xl mb-4">Listing Submitted</h1>
            <p className="text-warm-gray mb-8">
              Your {selectedProduct.brand?.name} {selectedProduct.name} has been submitted for review. 
              We&apos;ll notify you once it&apos;s been authenticated and listed.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => {
                  setSuccess(false)
                  setSelectedProduct(null)
                  setStep(1)
                  setSize('')
                  setCondition('')
                  setConditionNotes('')
                  setPrice('')
                  setImages([])
                }}
                className="px-8 py-3 border border-charcoal text-xs tracking-[2px] uppercase hover:bg-charcoal hover:text-white transition-colors"
              >
                List Another
              </button>
              <Link 
                href="/"
                className="px-8 py-3 bg-charcoal text-white text-xs tracking-[2px] uppercase hover:bg-charcoal/90 transition-colors"
              >
                Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream">
      <Header />
      
      <div className="pt-32 pb-20 px-12 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl mb-2">Sell an Item</h1>
        <p className="text-warm-gray mb-10">List a piece from your collection</p>

        <div className="flex items-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                step >= s ? 'bg-charcoal text-white' : 'bg-light-gray text-warm-gray'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-16 h-px ${step > s ? 'bg-charcoal' : 'bg-light-gray'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="bg-white border border-light-gray p-8">
            <h2 className="font-serif text-2xl mb-6">What are you selling?</h2>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name or SKU..."
                className="w-full px-4 py-4 border border-light-gray focus:border-charcoal outline-none transition-colors text-lg"
              />
              
              {products.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-light-gray border-t-0 shadow-lg max-h-96 overflow-y-auto z-10">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="w-full px-4 py-4 flex items-center gap-4 hover:bg-cream transition-colors text-left"
                    >
                      <div className="w-16 h-20 bg-light-gray overflow-hidden">
                        {product.images?.[0] && (
                          <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-warm-gray tracking-wide uppercase">{product.brand?.name}</p>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-warm-gray">SKU: {product.sku}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-sm text-warm-gray mt-4">
              Can&apos;t find your item? <Link href="/contact" className="underline">Contact us</Link> to add it.
            </p>
          </div>
        )}

        {step === 2 && selectedProduct && (
          <div className="bg-white border border-light-gray p-8">
            <div className="flex items-center gap-4 pb-6 mb-6 border-b border-light-gray">
              <div className="w-20 h-24 bg-light-gray overflow-hidden">
                {selectedProduct.images?.[0] && (
                  <img src={selectedProduct.images[0].url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <p className="text-xs text-warm-gray tracking-wide uppercase">{selectedProduct.brand?.name}</p>
                <p className="font-serif text-xl">{selectedProduct.name}</p>
                <button 
                  onClick={() => { setSelectedProduct(null); setStep(1); }}
                  className="text-sm text-warm-gray underline mt-1"
                >
                  Change
                </button>
              </div>
            </div>

            <h2 className="font-serif text-2xl mb-6">Item Details</h2>
            
            <div className="mb-6">
              <label className="block text-xs tracking-wide uppercase text-warm-gray mb-3">Size</label>
              <div className="flex gap-2 flex-wrap">
                {selectedProduct.sizes?.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSize(s.size)}
                    className={`w-14 h-11 border text-sm transition-all ${
                      size === s.size
                        ? 'bg-charcoal border-charcoal text-white'
                        : 'border-light-gray hover:border-charcoal'
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs tracking-wide uppercase text-warm-gray mb-3">Condition</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'new_with_tags', label: 'New with Tags', desc: 'Unworn, tags attached' },
                  { value: 'like_new', label: 'Like New', desc: 'Worn once or twice, no signs of wear' },
                  { value: 'excellent', label: 'Excellent', desc: 'Gently used, minimal signs of wear' },
                  { value: 'good', label: 'Good', desc: 'Used with some visible wear' },
                ].map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCondition(c.value)}
                    className={`p-4 border text-left transition-all ${
                      condition === c.value
                        ? 'border-charcoal bg-cream'
                        : 'border-light-gray hover:border-charcoal'
                    }`}
                  >
                    <p className="font-medium text-sm">{c.label}</p>
                    <p className="text-xs text-warm-gray mt-1">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs tracking-wide uppercase text-warm-gray mb-2">
                Condition Notes (Optional)
              </label>
              <textarea
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                placeholder="Describe any flaws, repairs, or notable details..."
                rows={3}
                className="w-full px-4 py-3 border border-light-gray focus:border-charcoal outline-none transition-colors resize-none"
              />
            </div>

            <div className="mb-8">
              <label className="block text-xs tracking-wide uppercase text-warm-gray mb-3">
                Photos ({images.length}/6)
              </label>
              
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square bg-light-gray">
                    <img 
                      src={img.url} 
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-charcoal hover:bg-red-500 hover:text-white transition-colors"
                    >
                      ×
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 text-[10px] bg-charcoal text-white px-2 py-1">
                        MAIN
                      </span>
                    )}
                  </div>
                ))}
                
                {images.length < 6 && (
                  <label className={`aspect-square border-2 border-dashed border-light-gray flex flex-col items-center justify-center cursor-pointer hover:border-charcoal transition-colors ${uploading ? 'opacity-50' : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    {uploading ? (
                      <span className="text-sm text-warm-gray">Uploading...</span>
                    ) : (
                      <>
                        <span className="text-2xl text-warm-gray mb-1">+</span>
                        <span className="text-xs text-warm-gray">Add Photos</span>
                      </>
                    )}
                  </label>
                )}
              </div>
              
              <p className="text-xs text-warm-gray mt-2">
                First photo will be the main image. Add up to 6 photos showing front, back, labels, and any flaws.
              </p>
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!size || !condition || images.length === 0}
              className="w-full py-4 bg-charcoal text-white text-xs tracking-[2px] uppercase hover:bg-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Pricing
            </button>
          </div>
        )}

        {step === 3 && selectedProduct && (
          <form onSubmit={handleSubmit} className="bg-white border border-light-gray p-8">
            <div className="flex items-center gap-4 pb-6 mb-6 border-b border-light-gray">
              <div className="w-20 h-24 bg-light-gray overflow-hidden">
                {images[0] && (
                  <img src={images[0].url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <p className="text-xs text-warm-gray tracking-wide uppercase">{selectedProduct.brand?.name}</p>
                <p className="font-serif text-xl">{selectedProduct.name}</p>
                <p className="text-sm text-warm-gray">Size {size} · {condition.replace(/_/g, ' ')}</p>
              </div>
            </div>

            <h2 className="font-serif text-2xl mb-6">Set Your Price</h2>

            <div className="mb-6">
              <label className="block text-xs tracking-wide uppercase text-warm-gray mb-2">
                Your Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray">$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  min="1"
                  className="w-full pl-8 pr-4 py-4 border border-light-gray focus:border-charcoal outline-none transition-colors text-2xl"
                />
              </div>
            </div>

            <div className="bg-cream p-4 mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-warm-gray">Retail Price</span>
                <span>${selectedProduct.retail_price?.toLocaleString()}</span>
              </div>
              {price && (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-warm-gray">Your Price</span>
                    <span>${parseFloat(price).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-warm-gray">La Scala Fee (20%)</span>
                    <span>-${(parseFloat(price) * 0.2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t border-light-gray">
                    <span>You Earn</span>
                    <span className="text-green">${(parseFloat(price) * 0.8).toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-4 border border-charcoal text-xs tracking-[2px] uppercase hover:bg-charcoal hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!price || submitting}
                className="flex-1 py-4 bg-charcoal text-white text-xs tracking-[2px] uppercase hover:bg-charcoal/90 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Listing'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}