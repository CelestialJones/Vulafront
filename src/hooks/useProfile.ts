import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export function useProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single()

    if (!error) setProfile(data)
    setLoading(false)
  }

  return { profile, loading }
}
