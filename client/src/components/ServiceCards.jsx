import React from 'react';
import {Link} from 'react-router-dom';
const symbols=['⌑','◱','✺','▤'];
export default function ServiceCards({services=[]}){
 return <div className="refresh-service-grid">{services.map((s,i)=><article className="refresh-service-card" key={s.slug}>
  <Link to={`/services/${s.slug}`} className="refresh-service-img">{s.image?<img loading="lazy" src={s.image} alt={`Example imagery for ${s.title}`}/>:<div className="refresh-image-fallback">{symbols[i]}</div>}<span className="refresh-card-number">0{i+1}</span></Link>
  <div className="refresh-service-content"><span className="refresh-label">{s.kicker||'Our expertise'}</span><h3>{s.title}</h3><p>{s.short_description}</p><Link to={`/services/${s.slug}`}>Explore service <span aria-hidden="true">↗</span></Link></div>
  </article>)}</div>
}
