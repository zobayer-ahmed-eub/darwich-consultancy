import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import Seo from '../components/Seo';
import {api} from '../api';

export default function ProjectDetail(){
 const {id}=useParams();
 const [project,setProject]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{let live=true;setLoading(true);setError('');api.project(id).then(p=>{if(live)setProject(p)}).catch(()=>{if(live){setProject(null);setError('Project not found')}}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[id]);
 if(loading)return <section className="section"><div className="container"><p>Loading project…</p></div></section>;
 if(error||!project)return <section className="section"><div className="container"><h1>Project reference unavailable</h1><p>That entry may have been removed or is no longer public.</p><Link className="btn primary" to="/projects">Back to portfolio ↗</Link></div></section>;
 const supplied=(project.cover_image||'').startsWith('/portfolio/');
 const stockCategory=/^(https:\/\/images\.pexels\.com\/|\/stock\/)/.test(project.cover_image||'');
 let allPhotos=[];
 try{const parsed=JSON.parse(project.gallery_images||'[]');if(Array.isArray(parsed)) allPhotos=parsed.filter(x=>typeof x==='string'&&(x.startsWith('/')&&!x.startsWith('//')||x.startsWith('https://')));}catch{}
 if(!allPhotos.length && project.cover_image)allPhotos=[project.cover_image];
 const description=(project.description||'').replace(/^(REFERENCE IMAGE ONLY\.|CONCEPT REFERENCE\.|PORTFOLIO PHOTO PROVIDED\.)\s*/,'');
 return <>
  <Seo title={`${project.title} | ${supplied?"Artwork Gallery":"Visual Reference"} | Darwich Consultancy`} description={description.slice(0,155)||'Design-reference project details from Darwich Consultancy.'} canonical={`https://darwichconsultancy.com/projects/${project.id}`}/>
  <section className="refresh-page-head"><div className="container narrow"><p className="eyebrow">PORTFOLIO / {project.category}</p><h1>{project.title}</h1>{project.suburb&&<p className="lead">{project.suburb}</p>}<div className="actions"><Link className="btn ghost" to="/projects">← All projects</Link><Link className="btn primary" to="/contact">Discuss a similar idea ↗</Link></div></div></section>
  <section className="section refresh-section"><div className="container refresh-project-detail-layout"><div className="refresh-project-detail-image">
   {project.cover_image?<img src={project.cover_image} alt={`${project.title} — portfolio image`} loading="eager"/>:<div className="refresh-image-fallback">Design reference</div>}
   {!stockCategory&&<span className="reference-badge">{supplied?"Submitted artwork":"Visual reference"}</span>}</div>
   <div className="refresh-project-detail-info"><p className="eyebrow">{stockCategory?project.category:supplied?"ARTWORK PORTFOLIO":"DESIGN REFERENCE"}</p><h2>{stockCategory?"Inside the collection.":supplied?"Inside the artwork.":"Explore the direction."}</h2><p>{description}</p>{!stockCategory&&<p className="refresh-reference-warning">{supplied?"Photographs supplied for the Darwich website portfolio. Project dates, client details and individual artist credits are pending confirmation.":"Reference / inspiration photography only. This entry is not presented as a verified completed Darwich Consultancy project."}</p>}<Link className="btn primary" to="/estimate">Start an estimate enquiry ↗</Link></div></div></section>
  {allPhotos.length>1&&<section className="section refresh-section"><div className="container"><div className="refresh-section-head"><div><p className="eyebrow">ADDITIONAL PHOTOGRAPHS</p><h2>More from this collection.</h2></div><p>Images supplied for portfolio presentation.</p></div><div className="refresh-samples-grid">{allPhotos.filter(src=>src!==project.cover_image).map((src,i)=><figure key={src}><img src={src} alt={`${project.title} — additional artwork photo ${i+2}`} loading="lazy"/><figcaption><strong>{project.title}</strong>{!stockCategory&&<small>Submitted photography · attribution pending</small>}</figcaption></figure>)}</div></div></section>}
  <section className="section refresh-final-cta"><div className="container refresh-cta-inner"><div><p className="eyebrow">EXPLORE MORE</p><h2>Every space has a story.</h2></div><Link className="btn primary" to="/gallery">Browse image gallery ↗</Link></div></section>
 </>;
}
