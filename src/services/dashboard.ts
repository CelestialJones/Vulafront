import { supabase } from './supabase'

export async function getDashboardData() {
  const [{ data: products }, { data: stock }, { data: alerts }] =
    await Promise.all([
      supabase.from('products').select('id, category, min_stock'),
      supabase.from('stock_items').select('quantity, product_id'),
      supabase.from('alerts').select('id').eq('is_read', false)
    ])

  const totalProducts = products?.length || 0
  const totalStock = stock?.reduce((sum, i) => sum + i.quantity, 0) || 0

  const lowStockProducts =
    products?.filter(p => {
      const productStock = stock
        ?.filter(s => s.product_id === p.id)
        .reduce((sum, i) => sum + i.quantity, 0)

      return productStock !== undefined && productStock < p.min_stock
    }).length || 0

  return {
    totalProducts,
    totalStock,
    lowStockProducts,
    alerts: alerts?.length || 0,
    products,
    stock
  }
}
