import { Link } from 'react-router-dom'
export default function NotFound() {
  return <section className="wrap pad"><h1>Page not found</h1><p>That link doesn't exist.</p><Link to="/" className="btn">Go home</Link></section>
}
