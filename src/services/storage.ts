import { supabase } from './supabase'

export async function uploadProductImage(
  uri: string,
  fileName: string
): Promise<string> {
  try {
    // 🔥 Converter imagem local em Blob (SDK 54)
    const response = await fetch(uri)
    if (!response.ok) {
      throw new Error('Falha ao ler imagem local')
    }

    const blob = await response.blob()

    // 📤 Upload para o bucket "products"
    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true
      })

    if (error) throw error

    // 🌍 URL pública
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  } catch (err) {
    console.log('❌ Erro upload:', err)
    throw err
  }
}
