import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      images:product_images(*)
    `)
    .order('created_at', { ascending: false })
    .limit(4)

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data
}

async function getBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching brands:', error)
    return []
  }
  return data
}

export default async function Home() {
  const products = await getProducts()
  const brands = await getBrands()

  return (
    <main className="min-h-screen bg-cream">
      <Header />

      {/* Hero Section */}
       <section className="relative h-screen flex items-center justify-center overflow-hidden bg-cream">
        <div className="relative z-10 text-center text-charcoal px-6">
          <p className="text-sm tracking-[6px] uppercase mb-6 text-warm-gray">Curated Luxury</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light mb-6 leading-tight">
            The Art of<br />Understated Elegance
          </h1>
          <p className="text-lg md:text-xl font-light max-w-2xl mx-auto mb-10 text-warm-gray">
            Discover exceptional pieces from the world&apos;s finest Italian houses, 
            both new and from distinguished private collections.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/collections"
              className="px-10 py-4 bg-charcoal text-white text-xs tracking-[2px] uppercase hover:bg-charcoal/80 transition-colors"
            >
              Shop Collection
            </Link>
            <Link 
              href="/sell"
              className="px-10 py-4 border border-charcoal text-charcoal text-xs tracking-[2px] uppercase hover:bg-charcoal hover:text-white transition-colors"
            >
              Sell With Us
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Houses */}
      <section className="py-24 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[4px] uppercase text-warm-gray mb-4">Our Houses</p>
            <h2 className="font-serif text-4xl">The Finest Italian Craftsmanship</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {brands.map((brand) => (
              <Link 
                key={brand.id}
                href="/collections"
                className="group text-center"
              >
                <div className="aspect-square bg-white border border-light-gray flex items-center justify-center p-8 mb-4 group-hover:border-charcoal transition-colors">
                  <span className="font-serif text-2xl text-charcoal">{brand.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 px-12 bg-light-gray">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-sm tracking-[4px] uppercase text-warm-gray mb-4">New Arrivals</p>
              <h2 className="font-serif text-4xl">Recently Added</h2>
            </div>
            <Link 
              href="/collections"
              className="text-xs tracking-[2px] uppercase border-b border-charcoal pb-1 hover:opacity-60 transition-opacity"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]
              
              return (
                <Link 
                  key={product.id} 
                  href={`/product/${product.sku}`}
                  className="group"
                >
                  <div className="aspect-[3/4] bg-white overflow-hidden mb-4">
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
                  <p className="text-charcoal">
                    ${product.retail_price?.toLocaleString()}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sell CTA */}
      <section className="py-24 px-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm tracking-[4px] uppercase text-warm-gray mb-4">Private Collections</p>
          <h2 className="font-serif text-4xl mb-6">Sell Your Pieces</h2>
          <p className="text-lg text-warm-gray mb-10 max-w-2xl mx-auto">
            Join our community of discerning collectors. List your authenticated luxury pieces 
            and connect with buyers who appreciate exceptional craftsmanship.
          </p>
          <Link 
            href="/sell"
            className="inline-block px-12 py-4 bg-charcoal text-white text-xs tracking-[2px] uppercase hover:bg-charcoal/90 transition-colors"
          >
            Start Selling
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-20 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div>
              <Link href="/" className="font-serif text-2xl font-light tracking-[6px] uppercase">La Scala</Link>
              <p className="text-white/60 mt-4 text-sm leading-relaxed">
                Curated luxury from the world&apos;s finest Italian houses.
              </p>
            </div>
            <div>
              <h4 className="text-xs tracking-[2px] uppercase mb-6">Shop</h4>
              <ul className="space-y-3">
                {['New Arrivals', 'Collections', 'Private Collections', 'Houses'].map(item => (
                  <li key={item}>
                    <Link href="/collections" className="text-sm text-white/60 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs tracking-[2px] uppercase mb-6">About</h4>
              <ul className="space-y-3">
                {['Our Story', 'Authentication', 'Sell With Us', 'Journal'].map(item => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs tracking-[2px] uppercase mb-6">Support</h4>
              <ul className="space-y-3">
                {['Contact', 'Shipping', 'Returns', 'FAQ'].map(item => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/20 flex justify-between items-center">
            <p className="text-sm text-white/40">© 2025 La Scala. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}