# Darwich Consultancy — October 2026 focused-services update

This repository is **an update to the existing React/Vite + Express/MySQL Darwich website**. It is NOT a WordPress conversion. Existing domain, API/admin routes, bookings, payment configuration, gallery, management database, projects and ecommerce features are kept.

## What changed

- **Exactly four public services** after a one-time, non-destructive MySQL data migration:
  1. Cost Estimation & Consultancy
  2. Architectural Interior Design
  3. Mural Painting & 3D Wall Art
  4. Wood Interiors & Decking
- New responsive homepage with four service tiles, clear cost-estimation enquiry CTA, creativity-focused mural and wood interior inspiration sections and four homepage management profile positions.
- New `/estimate` form collects project type, area category, finish, budget, location, timing and contact information. On submission, it creates a normal record in **Admin → Enquiries** using the existing API. **No estimated monetary price is invented**; this is a structured enquiry for a human quotation.
- Service detail pages for the mural and wood-interiors services include labelled image-reference galleries.
- 4 mural reference photos and 1 Sajek hotel room image were resized/compressed as WebP from the user-provided images. They are **illustrative reference content, not claimed completed projects of Darwich Consultancy**.
- One profile for **Arifa Jahan Swarna — Mural Artist** is seeded with the supplied name/role on the first upgrade. Portrait, detailed biography, and confirmed project attribution should be added by admin after approval. Homepage displays up to four real management profiles; remaining slots remain clearly marked as pending rather than inventing staff identities.
- Original administration remains at `/admin/login` and `/admin`; content can be updated in the existing **Services & fees**, **Management**, **Projects** and **Gallery** sections.
- Expanded SEO meta descriptions, sitemap inclusion for `/estimate`, and updated link/navigation copy.

## CRITICAL: Safe update steps for your existing Hostinger + GitHub setup

1. **Back up the live MySQL database** via hPanel/phpMyAdmin before deploying, and keep the existing working Git commit so you can roll back the code. A database snapshot is especially important because this update changes service visibility in the database.
2. Copy **the contents of the included `darwich-consultancy-main` folder** into the **root of the existing GitHub repository**. Do not create a second nested website folder in the repository root.
3. Review changed files and commit:

   ```bash
   git status
   git add client server GITHUB-UPDATE-2026-10-21.md
   git commit -m "Refresh Darwich four services, mural and timber showcases, estimate enquiry"
   git push origin main
   ```

4. Keep all live `.env` and Hostinger environment variables unchanged. The new features use existing MySQL credentials and JWT admin settings; **do not commit secrets**.
5. In Hostinger redeploy `main` using the project's existing Node 22 / `npm run build` / `server/server.js` settings. Do not delete or recreate the live database.
6. Upon the first successful app startup, `server/initDb.js` runs a one-time migration with setting key `darwich_four_services_v1`. It **archives old services by setting `active=0` and visibility flags to 0**. It does **not delete them**. New service records are inserted only if absent; existing records/edits on those slugs are preserved. Other tables are unchanged.
7. Visit `/health`, `/`, `/services`, all four service detail URLs, `/estimate`, `/team`, `/contact`, `/projects`, `/gallery`, `/admin/login`, and `/sitemap.xml`. Test at desktop and mobile resolutions.
8. Submit a **test estimator enquiry** and confirm it appears in Admin → Enquiries. Confirm existing checkout and admin logins are unaffected.

### New service URLs

- `/services/cost-estimation-consultancy`
- `/services/architectural-interior-design`
- `/services/mural-painting-3d-wall-art`
- `/services/wood-interiors-decking`

Previously published old service URLs will no longer be public after migration. If these were indexed in Google or shared, set up **301 redirects** to the most relevant new services after reviewing your old URLs. Otherwise they return 404.

## Items requiring confirmation **before publicly claiming completed work**

- Sajek is in **Rangamati District**; the brief's reference to Bandarban should be verified before publishing a location-specific project description.
- Confirm whether the resort photographs show a genuine **Darwich Consultancy commission**, the correct resort name and whether image use is authorised. Only one separate relatively high-resolution Sajek interior photograph was supplied; the original Google search collage was a screenshot, not a licence for the original third-party hotel images. Two additional verified/licensed full-size images are needed for the requested three-photo room gallery.
- Confirm whether the village primary-school murals and orange wall painting are real Darwich/Arifa projects before labelling them as completed projects. A real school name was **not provided**, so none was invented. They currently appear as **design references**, separate from the verified portfolio.
- Confirm the management biographies and supply **four approved team member portraits**. Only the artist's name and role were supplied. Do **not** attribute the uploaded illustrative portrait to a named person without confirmation.
- Confirm itemised estimate rates before offering automatic monetary quotes. The form currently captures requirements and stores them in Enquiries; it does **not** calculate a quote from arbitrary rates.

## Testing performed in the preparation environment

- All server JS passed `node --check`.
- A standalone HTML visual preview using the updated project's CSS and supplied assets rendered in Chromium at **1440px** and **390px**. No horizontal overflow detected.
- Release ZIP was tested for archive integrity.

## Testing limitations

The environment could not complete `npm install` (network dependency resolution stalled), so a real Vite/React production build and MySQL integration tests **were not completed locally**. The preview is representative HTML/CSS, not a running React app. Do `npm run build` in your connected GitHub/Hostinger build environment and test a staging deployment before switching production traffic.

## Rollback

Revert to the last working Git commit and redeploy. **Code rollback does not automatically undo the one-time database visibility update**. Restore the predeployment MySQL backup if necessary, or manually adjust service `active`, `nav_visible` and `featured` flags after checking the live data. Never blindly delete the migration marker or rerun seed scripts on production without a backup.
