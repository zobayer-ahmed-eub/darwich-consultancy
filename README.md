> **October 2026 site update:** see [GITHUB-UPDATE-2026-10-21.md](./GITHUB-UPDATE-2026-10-21.md) for the four-service migration, redesigned homepage, cost-estimation enquiry form, images and safe GitHub/Hostinger deployment steps.

# Darwich Consultancy

Full-stack construction consultancy website for **darwichconsultancy.com**, designed for Hostinger deployment.

## Stack
- React + Vite frontend
- Node.js + Express backend
- MySQL
- GitHub → Hostinger deployment
- Admin dashboard at `/admin/login`

## Public website
- Modern responsive homepage using the supplied Darwich logo
- Dynamic Services index + individual service pages
- Projects portfolio
- Gallery
- Management/team page
- About and Contact / consultation request
- Optional fixed-scope consultation packages and booking flow
- Responsive mobile/tablet/desktop navigation

## Admin dashboard
- Business settings and logo
- Full service CRUD, fees, visibility, images and SEO
- Consultation packages and pricing
- Consultation bookings / request status
- Management profiles
- Projects
- Gallery
- Testimonials
- Enquiries

## SEO included
- Server-rendered title/description injection for crawler requests
- Canonical URLs
- Open Graph and Twitter/X social cards
- `robots.txt`
- Dynamic `sitemap.xml`
- `ProfessionalService`, `WebSite`, `Service`, `AboutPage` and `ContactPage` JSON-LD
- Google Search Console verification environment variable
- GA4 environment variable
- Admin/cart/checkout noindex

## Important
Real phone, email, office address, trade licence/registration, staff, projects and testimonials are intentionally not invented. Add the real information after deployment through Admin.

## Local development
1. Create a MySQL database.
2. Copy `.env.example` to `.env` and enter credentials.
3. Run `npm install --prefix client` and `npm install --prefix server`.
4. Start backend with `npm run dev:server`.
5. Start frontend in another terminal with `npm run dev:client`.

Production deployment steps are in `HOSTINGER-DEPLOY.md`.
