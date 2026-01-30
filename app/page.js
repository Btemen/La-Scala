import Link from 'next/link'
import { supabase } from '@/lib/supabase'

async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      images:product_images(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data
}

export default async function Home() {
  const products = await getProducts()

  return (
    <main className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-12 py-6 bg-cream/95 backdrop-blur-md border-b border-light-gray">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-serif text-2xl font-light tracking-[6px] uppercase text-charcoal">
            La Scala
          </Link>
          <ul className="flex gap-10">
            {['Collections', 'Houses', 'Pre-Owned', 'Journal'].map((item) => (
              <li key={item}>
                <Link 
                  href="#" 
                  className="text-xs font-normal tracking-[1.5px] uppercase text-charcoal hover:opacity-60 transition-opacity"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-5xl font-light mb-4">Our Collection</h1>
          <p className="text-warm-gray text-lg">{products.length} pieces from the world's finest houses</p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-12 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]
            
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
                <p className="text-charcoal">
                  ${product.retail_price?.toLocaleString()}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-16 px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-serif text-xl font-light tracking-[6px] uppercase">La Scala</span>
          <p className="text-sm text-white/40">© 2025 La Scala. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
