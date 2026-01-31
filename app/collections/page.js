import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import CollectionsClient from './CollectionsClient'

export const dynamic = 'force-dynamic'

async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      images:product_images(*)
    `)
    .order('retail_price', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data
}

async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  return data
}

export default async function CollectionsPage() {
  const products = await getProducts()
  const categories = await getCategories()

  return (
    <main className="min-h-screen bg-cream">
      <Header />

      <section className="pt-32 pb-8 px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-5xl font-light mb-2">Collections</h1>
        </div>
      </section>

      <CollectionsClient products={products} categories={categories} />

      <footer className="bg-charcoal text-white py-16 px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-serif text-xl font-light tracking-[6px] uppercase">La Scala</Link>
          <p className="text-sm text-white/40">© 2025 La Scala. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
