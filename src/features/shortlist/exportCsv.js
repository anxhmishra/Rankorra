export function exportCsv(items) {
  const esc = v => `"${String(v).replace(/"/g, '""')}"`
  const rows = [['Preference','Institute','Branch','Quota','Expected closing rank','Admission chance','Status'],
    ...items.map((s, i) => [i + 1, s.institute, s.branch, s.quota, s.expectedClosingRank, s.probability + '%', s.status])]
  const url = URL.createObjectURL(new Blob([rows.map(r => r.map(esc).join(',')).join('\n')], { type: 'text/csv' }))
  const a = document.createElement('a'); a.href = url; a.download = 'seatwise-choice-list.csv'; a.click(); URL.revokeObjectURL(url)
}
