const json = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Request failed');
  }
  return res.json();
};

export const api = {
  settings: () => fetch('/api/settings').then(json),
  services: () => fetch('/api/services').then(json),
  service: (slug) => fetch(`/api/services/${slug}`).then(json),
  products: () => fetch('/api/products').then(json),
  product: (slug) => fetch(`/api/products/${slug}`).then(json),
  projects: () => fetch('/api/projects').then(json),
  testimonials: () => fetch('/api/testimonials').then(json),
  management: () => fetch('/api/management').then(json),
  gallery: () => fetch('/api/gallery').then(json),
  enquiry: (payload) => fetch('/api/enquiries', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)}).then(json),
  booking: (payload) => fetch('/api/bookings', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)}).then(json),
  verifyStripe: (sessionId) => fetch(`/api/payments/stripe/verify?session_id=${encodeURIComponent(sessionId)}`).then(json),
  login: (email,password) => fetch('/api/admin/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password})}).then(json),
  adminGet: (path, token) => fetch(`/api/admin/${path}`, {headers:{Authorization:`Bearer ${token}`}}).then(json),
  adminJson: (path, method, body, token) => fetch(`/api/admin/${path}`, {method, headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify(body)}).then(json),
  adminDelete: (path, token) => fetch(`/api/admin/${path}`, {method:'DELETE', headers:{Authorization:`Bearer ${token}`}}).then(json)
};
