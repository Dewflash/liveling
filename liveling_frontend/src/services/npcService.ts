export async function fetchNpcName(): Promise<string | null> {
  try {
    const res = await fetch('https://randomuser.me/api/?inc=name&nat=gb,us,au&noinfo')
    const data = await res.json()
    const first = data.results[0].name.first as string
    const last = data.results[0].name.last as string
    return `${first} ${last}`
  } catch {
    return null
  }
}
