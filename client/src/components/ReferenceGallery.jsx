import React from 'react';
import { Link } from 'react-router-dom';

const muralReferences = [
  {image:'/reference/school-mural.webp',title:'Primary school boundary-wall art',detail:'School campus wall painting reference'},
  {image:'/reference/school-awareness.webp',title:'Educational awareness mural',detail:'Colourful community-awareness artwork reference'},
  {image:'/reference/mural-artist-at-work.webp',title:'Hand-painted decorative border',detail:'Decorative mural work reference'},
  {image:'/reference/heritage-wall-art.webp',title:'Ornamental feature wall',detail:'Heritage-inspired painted wall design reference'},
];
const woodReferences = [
  {image:'/reference/sajek-room.webp',title:'Sajek resort bedroom interior',detail:'Timber accents, lighting and furnishing reference'},
];
export function ReferenceGallery({type='mural',compact=false}) {
  const mural=type==='mural';const items=mural?muralReferences:woodReferences;
  return <section className={`reference-gallery ${compact?'compact':''}`} aria-label={mural?'Wall art design references':'Sajek wood interior references'}>
    <div className="section-head"><div><p className="eyebrow">{mural?'Wall art inspiration':'Resort-inspired timber spaces'}</p><h2>{mural?'Murals that tell a story.':'Wood interiors inspired by Sajek.'}</h2></div></div>
    <p className="reference-note">Reference imagery supplied for design inspiration. These photographs are <strong>not presented as verified Darwich Consultancy completed projects</strong>. Project attribution can be updated after confirmation.</p>
    <div className={`reference-grid ${mural?'mural-reference':''}`}>
      {items.map(item=><figure key={item.image} className="reference-item"><img src={item.image} alt={item.title} loading="lazy"/><figcaption><strong>{item.title}</strong><span>{item.detail}</span></figcaption></figure>)}
      {!mural&&<div className="reference-placeholder"><span className="eyebrow">Wood Interiors & Decking</span><h3>Resort rooms, timber ceilings & custom decking</h3><p>Two additional high-resolution resort interior photographs can be added through the existing admin gallery after usage rights and project credits are confirmed.</p><Link className="inline-link" to="/contact?service=wood-interiors-decking">Discuss a timber project →</Link></div>}
    </div>
    {!mural&&<p className="reference-location">Sajek Valley is in Rangamati District, Bangladesh. Confirm the exact resort and work attribution before publishing a completed-project claim.</p>}
  </section>
}
export default ReferenceGallery;
