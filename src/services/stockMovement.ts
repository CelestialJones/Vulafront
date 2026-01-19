import { supabase } from './supabase'

type MovementType = 'in' | 'out' | 'transfer'

interface CreateMovement {
  productId: string
  quantity: number
  type: MovementType
  reason?: string
}

export async function createStockMovement(data: CreateMovement) {
  const { productId, quantity, type, reason } = data

  if (quantity <= 0) {
    throw new Error('Quantidade inválida')
  }

  // 1️⃣ Buscar stock_item do produto
  let { data: stockItem } = await supabase
    .from('stock_items')
    .select('*')
    .eq('product_id', productId)
    .single()

  // 2️⃣ Se NÃO existir, cria
  if (!stockItem) {
    const { data: newItem, error } = await supabase
      .from('stock_items')
      .insert({
        product_id: productId,
        quantity: 0
      })
      .select()
      .single()

    if (error) throw error
    stockItem = newItem
  }

  let newQuantity = stockItem.quantity

  if (type === 'out' && newQuantity < quantity) {
    throw new Error('Estoque insuficiente')
  }

  if (type === 'in') newQuantity += quantity
  if (type === 'out') newQuantity -= quantity

  // 3️⃣ Atualizar estoque
  await supabase
    .from('stock_items')
    .update({ quantity: newQuantity })
    .eq('id', stockItem.id)

  // 4️⃣ Registrar movimentação
  await supabase.from('stock_movements').insert({
    stock_item_id: stockItem.id,
    type,
    quantity,
    reason
  })
}
