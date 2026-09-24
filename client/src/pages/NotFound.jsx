import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
export default function NotFound(){return <div className="not-found"><Seo title="Page not found | DARWICH" description="" canonical="https://darwichconsultancy.com/404" noindex/><h1>404</h1><p>That page could not be found.</p><Link className="btn primary" to="/">Back to home</Link></div>}
