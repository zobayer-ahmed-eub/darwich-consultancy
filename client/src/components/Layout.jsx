import React,{useEffect,useState} from 'react';
import { Link,NavLink,Outlet } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../CartContext';

export default function Layout(){
  const [open,setOpen]=useState(false);
  const [settings,setSettings]=useState({});
  const [services,setServices]=useState([]);
  const cart=useCart();
  useEffect(()=>{api.settings().then(setSettings).catch(()=>{});api.services().then(setServices).catch(()=>{});},[]);
  const close=()=>setOpen(false);
  return <>
    <header className="site-header"><div className="container nav-wrap">
      <Link to="/" className="brand" onClick={close}><img src={settings.logo_url||'/brand/darwich-logo.png'} alt="Darwich Consultancy logo"/></Link>
      <button className="menu-btn" onClick={()=>setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open} aria-controls="darwich-nav">☰</button>
      <nav id="darwich-nav" className={open?'nav open':'nav'}>
        <NavLink to="/" onClick={close}>Home</NavLink>
        <NavLink to="/services" onClick={close}>Services</NavLink>
        <NavLink to="/estimate" onClick={close}>Cost Estimator</NavLink>
        <NavLink to="/projects" onClick={close}>Projects</NavLink>
        <NavLink to="/gallery" onClick={close}>Gallery</NavLink>
        <NavLink to="/team" onClick={close}>Management</NavLink>
        <NavLink to="/about" onClick={close}>About</NavLink>
        <NavLink to="/contact" onClick={close}>Contact</NavLink>
        {cart.count>0&&<Link className="cart-link" to="/cart" onClick={close}>Selection <span>{cart.count}</span></Link>}
        <Link className="nav-cta" to="/contact" onClick={close}>Book consultation</Link>
      </nav>
    </div></header>
    <main><Outlet context={{settings,services}}/></main>
    <footer className="footer"><div className="container footer-grid">
      <div><img className="footer-logo" src={settings.logo_url||'/brand/darwich-logo.png'} alt="Darwich Consultancy"/><p>Cost estimation, architectural interiors, murals, 3D wall art and wood interiors in Bangladesh.</p></div>
      <div><h4>Services</h4>{services.filter(s=>Number(s.nav_visible)!==0).slice(0,5).map(s=><Link key={s.id||s.slug} to={`/services/${s.slug}`}>{s.title}</Link>)}<Link to="/services">All services</Link></div>
      <div><h4>Contact</h4>{settings.phone&&<a href={`tel:${settings.phone}`}>{settings.phone}</a>}{settings.email&&<a href={`mailto:${settings.email}`}>{settings.email}</a>}{settings.address&&<span>{settings.address}</span>}<span>{settings.service_area||'Bangladesh'}</span></div>
      <div><h4>Company</h4><Link to="/projects">Projects</Link><Link to="/estimate">Estimate enquiry</Link><Link to="/team">Management</Link><Link to="/about">About</Link><Link to="/contact">Consultation</Link><Link to="/admin/login">Admin</Link></div>
    </div><div className="container footer-bottom">© {new Date().getFullYear()} Darwich Consultancy. All rights reserved.</div></footer>
  </>;
}
