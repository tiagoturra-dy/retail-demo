export const profileService = {
  getAffinityData: async ({ cuid = null }) => {
    const response = await fetch(`/api/profile`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({cuid: cuid}),
    })

    const data = await response.json()
    console.debug('DY Profile Results', data.affinity)
    return data.affinity
  }
}