import React from 'react';
import {Link} from 'react-router-dom';
export const CATEGORY_MURAL='Mural Painting & 3D Wall Art';
export const CATEGORY_WOOD='Wood Interiors & Decking';
export function PortfolioCard({item,large=false}){
  const supplied=(item.cover_image||'').startsWith('/portfolio/');
  const stockCategory=/^(https:\/\/images\.pexels\.com\/|\/stock\/)/.test(item.cover_image||'');
  const badge=supplied?'Artwork photo':'Visual reference';
  return <article className={`refresh-project-card ${large?'feature':''}`}>
    <Link className="refresh-project-image refresh-project-link" to={`/projects/${item.id}`} aria-label={`Read more about ${item.title}`}>{item.cover_image?<img loading="lazy" src={item.cover_image} alt={item.title} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src="/showcase/sajek-room.webp"}}/>:<div className="refresh-image-fallback">Design reference</div>}
    {!stockCategory&&<span className="reference-badge">{badge}</span>}</Link>
    <div className="refresh-project-body"><div className="refresh-project-category">{item.category}</div><h3><Link to={`/projects/${item.id}`}>{item.title}</Link></h3>{item.suburb&&<p className="location">{item.suburb}</p>}
    <p>{item.description?.replace(/^(REFERENCE IMAGE ONLY\.|CONCEPT REFERENCE\.|PORTFOLIO PHOTO PROVIDED\.)\s*/,'')}</p>
    {!stockCategory&&<small className="reference-caption">{supplied?'Submitted artwork photographs · credits pending verification.':'Visual reference · project attribution not verified.'}</small>}<Link className="refresh-project-more" to={`/projects/${item.id}`}>View photos ↗</Link></div>
  </article>;
}
