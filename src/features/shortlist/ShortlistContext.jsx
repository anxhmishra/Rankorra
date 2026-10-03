import { createContext, useContext, useEffect, useState } from 'react'
const Ctx = createContext(null)
const KEY = 'seatwise.shortlist.v1'
export const seatKey = s => `${s.institute}|${s.branch}|${s.quota}`
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
export function ShortlistProvider({ children }) {
  const [items, setItems] = useState(load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {} }, [items])
  const has = s => items.some(x => seatKey(x) === seatKey(s))
  const toggle = s => setItems(p => p.some(x => seatKey(x) === seatKey(s)) ? p.filter(x => seatKey(x) !== seatKey(s)) : [...p, s])
  const move = (i, d) => setItems(p => { const j = i + d; if (j < 0 || j >= p.length) return p; const n = [...p]; [n[i], n[j]] = [n[j], n[i]]; return n })
  const clear = () => setItems([])
  return <Ctx.Provider value={{ items, has, toggle, move, clear }}>{children}</Ctx.Provider>
}
export const useShortlist = () => useContext(Ctx)
