import { supabase } from './supabase'

export async function getStockList() {
  const { data, error } = await supabase
    .from('stock_items')
    .select(`
      id,
      quantity,
      product:products (
        id,
        name,
        category,
        min_stock
      )
    `)

  if (error) throw error
  return data
}

export async function getStockHistory(productId: string) {
  const { data, error } = await supabase
    .from('stock_movements')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
