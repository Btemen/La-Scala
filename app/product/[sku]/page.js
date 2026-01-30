import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ProductClient from './ProductClient'

export const dynamic = 'force-dynamic'

async function getProduct(sku) {
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      images:product_images(*),
      sizes:product_sizes(*)
    `)
    .eq('sku', sku)
    .single()

  if (error || !product) {
    return null
  }

  const { data: inventory } = await supabase
    .from('inventory')
    .select(`
      *,
      source:inventory_sources(*)
    `)
    .eq('product_id', product.id)
    .gt('quantity', 0)

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('product_id', product.id)
    .eq('status', 'active')
    .order('price', { ascending: true })

  return {
    ...product,
    inventory: inventory || [],
    listings: listings || []
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.sku)

  if (!product) {
    notFound()
  }

  const inventoryBySize = {}
  product.sizes?.forEach(s => {
    inventoryBySize[s.size] = {
      size: s.size,
      retail: null,
      preowned: []
    }
  })

  product.inventory?.forEach(inv => {
    if (inventoryBySize[inv.size]) {
      if (!inventoryBySize[inv.size].retail || inv.source.priority < inventoryBySize[inv.size].retail.source.priority) {
        inventoryBySize[inv.size].retail = inv
      }
    }
  })

  product.listings?.forEach(listing => {
    if (inventoryBySize[listing.size]) {
      inventoryBySize[listing.size].preowned.push(listing)
    }
  })

  const sortedImages = [...(product.images || [])].sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return a.position - b.position
  })

  return (
    <main className="min-h-screen bg-cream">
      <Header />

      <div className="pt-24 px-12 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-2 text-[11px] tracking-wide">
          <Link href="/" className="text-warm-gray hover:text-charcoal transition-colors">Home</Link>
          <span className="text-light-gray">/</span>
          <Link href="/collections" className="text-warm-gray hover:text-charcoal transition-colors">{product.brand?.name}</Link>
          <span className="text-light-gray">/</span>
          <span className="text-warm-gray">{product.name}</span>
        </div>
      </div>

      <ProductClient 
        product={product}
        images={sortedImages}
        inventoryBySize={inventoryBySize}
        listings={product.listings || []}
      />

      <footer className="bg-charcoal text-white py-16 px-12 mt-20">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <Link href="/" className="font-serif text-xl font-light tracking-[6px] uppercase">La Scala</Link>
          <div className="flex gap-8">
            {['About', 'Contact', 'Sell With Us', 'Authentication', 'Terms'].map(item => (
              <Link key={item} href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  )
}