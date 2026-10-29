import React,{useEffect,useState} from 'react';
import {Link,NavLink,Outlet} from 'react-router-dom';
import {api} from '../api';
import {useCart} from '../CartContext';
export default function Layout(){
 const [open,setOpen]=useState(false),[settings,setSettings]=useState({}),[services,setServices]=useState([]);
 const cart=useCart();
 useEffect(()=>{api.settings().then(setSettings).catch(()=>{});api.services().then(setServices).catch(()=>{})},[]);
 const close=()=>setOpen(false);
 // Use the same office location values as the Contact page. If Admin provides a
 // precise Google Maps embed URL, prefer it over an address-based map search.
 const footerMapQuery=[settings.address,settings.service_area].filter(Boolean).join(', ');
 const savedEmbed=String(settings.office_map_embed_url||'').trim();
 const footerEmbedUrl=/^https:\/\/(?:www\.)?google\.com\/maps\/embed\?/i.test(savedEmbed)
  ? savedEmbed
  : (footerMapQuery?`https://maps.google.com/maps?q=${encodeURIComponent(footerMapQuery)}&output=embed`:'');
 const savedMapsLink=String(settings.office_map_url||'').trim();
 const footerDirectionsUrl=/^https:\/\/(?:www\.)?google\.com\/maps\//i.test(savedMapsLink)||/^https:\/\/maps\.app\.goo\.gl\//i.test(savedMapsLink)
  ? savedMapsLink
  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(footerMapQuery)}`;
 return <div className="refresh-site"><a className="refresh-skip" href="#main">Skip to main content</a>
  <div className="refresh-info-bar"><div className="container"><span>Thoughtful spaces, original details &amp; practical consultancy</span><span>{settings.service_area||'Bangladesh'}</span></div></div>
  <header className="site-header refresh-header"><div className="container nav-wrap">
   <Link to="/" className="brand" onClick={close}><img className="darwich-site-logo" src={settings.logo_url || "/brand/darwich-wordmark.svg"} alt="Darwich Consultancy" onError={e=>{if(e.currentTarget.dataset.fallback)return;e.currentTarget.dataset.fallback="1";e.currentTarget.src="/brand/darwich-wordmark.svg";}} /></Link>
   <button className="menu-btn" onClick={()=>setOpen(!open)} aria-controls="darwich-nav" aria-expanded={open} aria-label={open?'Close menu':'Open menu'}>{open?'×':'☰'}</button>
   <nav id="darwich-nav" className={open?'nav open':'nav'} aria-label="Main navigation">
    <NavLink to="/" end onClick={close}>Home</NavLink>
    <div className="refresh-service-menu">
      <NavLink to="/services" onClick={close}>Services <span aria-hidden="true">▾</span></NavLink>
      <div className="refresh-service-submenu" aria-label="Individual services">
        <Link onClick={close} to="/services/cost-estimation-consultancy">Cost Estimation & Consultancy</Link>
        <Link onClick={close} to="/services/architectural-interior-design">Architectural Interior Design</Link>
        <Link onClick={close} to="/services/mural-painting-3d-wall-art">Mural Painting & 3D Wall Art</Link>
        <Link onClick={close} to="/services/wood-interiors-decking">Wood Interiors & Decking</Link>
      </div>
    </div>
    <NavLink to="/estimate" onClick={close}>Cost estimator</NavLink>
    <NavLink to="/projects" onClick={close}>Portfolio</NavLink>
    <NavLink to="/gallery" onClick={close}>Gallery</NavLink>
    <NavLink to="/team" onClick={close}>Team</NavLink>
    <NavLink to="/about" onClick={close}>About</NavLink>
    <Link to="/contact" className="nav-cta" onClick={close}>Let's talk <span>↗</span></Link>
    {cart.count>0&&<Link to="/cart" className="cart-link" onClick={close}>Selection ({cart.count})</Link>}
   </nav>
  </div></header>
  <main id="main"><Outlet context={{settings,services}}/></main>
  <footer className="footer refresh-footer">
   <div className="container refresh-footer-top">
    <div className="refresh-footer-intro">
     <p className="eyebrow">DARWICH CONSULTANCY</p>
     <h2>Spaces with character.<br/>Ideas with purpose.</h2>
     <p>Cost Estimation &amp; Consultancy · Architectural Interior Design · Mural Painting &amp; 3D Wall Art · Wood Interiors &amp; Decking</p>
     <Link to="/contact" className="btn primary">Start a conversation ↗</Link>
    </div>
    <div className="refresh-footer-right">
     <div className="refresh-footer-columns">
      <div><h4>Explore</h4><Link to="/services">Services</Link><Link to="/estimate">Cost estimator</Link><Link to="/projects">Portfolio</Link><Link to="/gallery">Gallery</Link></div>
      <div><h4>Company</h4><Link to="/team">Our team</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/admin/login">Admin login</Link></div>
      <div><h4>Contact</h4>{settings.phone&&<a href={`tel:${settings.phone}`}>{settings.phone}</a>}{settings.email&&<a href={`mailto:${settings.email}`}>{settings.email}</a>}{settings.address&&<span>{settings.address}</span>}<span>{settings.service_area||'Bangladesh'}</span></div>
     </div>
     {footerEmbedUrl&&<section className="refresh-footer-map" aria-label="Darwich Consultancy office location">
      <div className="refresh-footer-map-heading">
       <span>Find our office</span>
       <a href={footerDirectionsUrl} target="_blank" rel="noopener noreferrer" aria-label="Open Darwich Consultancy office directions in Google Maps">Open in Google Maps ↗</a>
      </div>
      <iframe title="Map showing Darwich Consultancy office location" src={footerEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
     </section>}
    </div>
   </div>
   <div className="container footer-bottom">© {new Date().getFullYear()} Darwich Consultancy. Images labelled as references are illustrative and are not claims of completed company work.</div>
  </footer>
  <div className="refresh-mobile-actions"><Link to="/estimate">Get estimate</Link><Link to="/contact">Contact us</Link></div>
 </div>
}
