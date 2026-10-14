import { createClient } from '@/utils/supabase/server'

export default async function PatientsPage() {
  const supabase = await createClient()

  const { data: patients, error } = await supabase
    .from('patients')
    .select('*')

  if (error) {
    return <p>Error: {error.message}</p>
  }

  return (
    <div>
      <h1>Patients</h1>
      <ul>
        {patients?.map((p) => (
          <li key={p.id}>
            {p.name} — {p.phone}
          </li>
        ))}
      </ul>
    </div>
  )
}