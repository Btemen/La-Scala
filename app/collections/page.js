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

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data
}

export default async function CollectionsPage() {
  const products = await getProducts()

  return (
    <main className="min-h-screen bg-cream">
      <Header />

      <section className="pt-32 pb-20 px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-5xl font-light mb-4">Collections</h1>
          <p className="text-warm-gray text-lg">{products.length} pieces from the world&apos;s finest houses</p>
        </div>
      </section>

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

      <footer className="bg-charcoal text-white py-16 px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-serif text-xl font-light tracking-[6px] uppercase">La Scala</Link>
          <p className="text-sm text-white/40">© 2025 La Scala. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}