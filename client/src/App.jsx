import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import ServicePage from './pages/ServicePage';
import Projects from './pages/Projects';
import Gallery from './pages/Gallery';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Team from './pages/Team';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App(){return <Routes>
  <Route element={<Layout/>}>
    <Route path="/" element={<Home/>}/>
    <Route path="/services" element={<Services/>}/>
    <Route path="/services/:slug" element={<ServicePage/>}/>
    <Route path="/products" element={<Products/>}/>
    <Route path="/products/:slug" element={<ProductDetail/>}/>
    <Route path="/cart" element={<Cart/>}/>
    <Route path="/checkout" element={<Checkout/>}/>
    <Route path="/projects" element={<Projects/>}/>
    <Route path="/gallery" element={<Gallery/>}/>
    <Route path="/team" element={<Team/>}/>
    <Route path="/about" element={<About/>}/>
    <Route path="/contact" element={<Contact/>}/>
  </Route>
  <Route path="/admin/login" element={<AdminLogin/>}/>
  <Route path="/admin" element={<AdminDashboard/>}/>
  <Route path="*" element={<NotFound/>}/>
</Routes>}
