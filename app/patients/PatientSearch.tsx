"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function PatientSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('name', `%${query}%`)

      if (error) {
        console.error(error)
        return
      }
      setResults(data ?? [])
    }
    load()
  }, [query])

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search patients…"
      />
      <ul>
        {results.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  )
}