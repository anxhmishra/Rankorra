// Placeholder data used when VITE_API_URL is not set. Same shape as the real API.
const SEATS = [['NIT Trichy','Computer Science and Engineering',1800],['NIT Warangal','Civil Engineering',9000],['NIT Surathkal','Information Technology',4200],
  ['IIIT Allahabad','Information Technology',6800],['NIT Jaipur','Electronics and Communication Engineering',9800],['DTU','Mechanical Engineering',14000],
  ['NIT Kurukshetra','Civil Engineering',18500],['NIT Patna','Civil Engineering',32000],['NSUT','Mathematics and Computing',7600]]
export function mockPredict({ rank, preferred_branch, quota }) {
  return new Promise(res => setTimeout(() => {
    const results = SEATS.filter(([, , c]) => c >= rank * 0.8).map(([institute, branch, c]) => ({
      institute, branch, quota, finalRound: 6, expectedClosingRank: c, bestCaseRank: c, worstCaseRank: c,
      probability: Math.max(2, Math.min(95, Math.round(50 + (c - rank) / rank * 100))),
      status: c > rank * 1.25 ? 'Safe' : c >= rank * 0.95 ? 'Target' : 'Reach', rankMargin: c - rank,
      branchMatch: branch.toLowerCase() === preferred_branch.toLowerCase() }))
    const n = s => results.filter(r => r.status === s).length
    res({ summary: { total: results.length, year: 2025, safe: n('Safe'), target: n('Target'), reach: n('Reach') }, results })
  }, 700))
}
