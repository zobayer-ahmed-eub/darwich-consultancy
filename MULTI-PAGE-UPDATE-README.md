# Darwich Consultancy — True Multi-Page Navigation Update

This is the existing **React + Vite frontend, Express backend and MySQL database**. It is **not** a one-page HTML website.

## Key clarification

React Router creates distinct URL pages while the Express server serves a shared HTML shell, which is normal for a single-page application (SPA). A shared HTML shell **does not mean everything is placed on one web page**. The previous standalone HTML preview incorrectly made that impression. The separate, clickable HTML design preview in `Darwich-MultiPage-Design-Preview.zip` corrects that presentation.

## Real public routes in the GitHub code

| Page | URL |
|---|---|
| Home | `/` |
| Four service overview | `/services` |
| Cost Estimation & Consultancy | `/services/cost-estimation-consultancy` |
| Architectural Interior Design | `/services/architectural-interior-design` |
| Mural Painting & 3D Wall Art | `/services/mural-painting-3d-wall-art` |
| Wood Interiors & Decking | `/services/wood-interiors-decking` |
| Cost estimator | `/estimate` |
| Projects portfolio | `/projects` |
| Individual project reference | `/projects/:id` (NEW) |
| Gallery | `/gallery` |
| Team | `/team` |
| About | `/about` |
| Contact | `/contact` |
| Products / consultation packages | `/products` |
| Individual product | `/products/:slug` |
| Cart | `/cart` |
| Checkout | `/checkout` |
| Admin login | `/admin/login` |
| Admin dashboard | `/admin` |

## Changes in this revision

- Added a **Services navigation submenu** with individual links for exactly the four approved services.
- Added dedicated **project-detail pages**. Every project card opens a separate `/projects/:id` URL.
- Added `GET /api/projects/:id` API endpoint with validation and the same allowed-category filter as the main project list.
- Added project-specific page titles, descriptions and optional photo metadata to the Express SEO renderer and included individual projects in the XML sitemap.
- Kept all existing admin, service, booking, checkout and gallery routes.
- Supplied 22 *offline static preview pages* separately to demonstrate the multi-page navigation. These are visual previews, **not** files to push as your live frontend.

## Deploy safely to existing GitHub → Hostinger

1. **Back up the Hostinger database and your Git repository.** This project has a separate database initialization/content migration from the previous refresh. Review `server/initDb.js` carefully and test on staging first; reverting Git code will not revert database changes.
2. For an existing repository already updated with the Darwich Refresh ZIP, extract the **MultiPage Patch** and merge the `darwich-consultancy-main/` contents into the same repository root. Do not create a nested folder. Keep `.git`, `.env`, and existing secrets unchanged.
3. In VS Code:
   ```bash
   npm install --prefix client
   npm run build --prefix client
   node --check server/server.js
   node --check server/routes/public.js
   git status
   git add client server MULTI-PAGE-UPDATE-README.md
   git commit -m "Add separate Darwich service and project pages"
   git push
   ```
4. If your existing repository **has not received the previous redesign yet**, use the **MultiPage Full GitHub Source ZIP**, not just the patch.
5. Hostinger should redeploy the existing Node.js app from the connected branch (automatically if configured, otherwise use its redeploy option).
6. Visit the 4 individual service URLs and at least one `/projects/:id`, open them directly or refresh them, verify admin login and submit a test enquiry.

## Validation and limitations

- Syntax validation passed for `server/server.js` and `server/routes/public.js`.
- A separate **22-page offline preview** had no missing relative links; rendered desktop/mobile pages with no horizontal overflow and verified the mobile preview menu toggle.
- `npm install` was blocked by the restricted environment's unavailable npm registry; **the production Vite build and live MySQL routes still need testing** before deployment.
- Site data contains **visual inspiration and not verified company projects**. Do not call third-party photographs completed Darwich work without proof and appropriate image rights.
