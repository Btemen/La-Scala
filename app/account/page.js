import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import ClosetClient from './ClosetClient'

export const dynamic = 'force-dynamic'

async function getProducts() {
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      images:product_images(*),
      sizes:product_sizes(*)
    `)
    .order('name')
  return data || []
}

export default async function ClosetPage() {
  const products = await getProducts()

  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <ClosetClient products={products} />
    </main>
  )
}