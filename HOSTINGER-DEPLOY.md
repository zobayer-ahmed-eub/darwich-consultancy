# Hostinger deployment — darwichconsultancy.com

## 1. Create MySQL database
In Hostinger create a database + database user and keep the database name, username and password.

## 2. Connect the GitHub repository
Hostinger → Websites → darwichconsultancy.com → Git / Node.js deployment → connect the private GitHub repository.

Use:
- Framework preset: **Other**
- Node version: **22.x**
- Root directory: `/`
- Package manager: `npm`
- Build command: `npm run build`
- Output directory: `client/dist`
- Entry file: `server/server.js`

## 3. Environment variables
Add these in Hostinger:

```text
DB_HOST=localhost
DB_PORT=3306
DB_USER=<your Hostinger MySQL user>
DB_PASSWORD=<your MySQL password>
DB_NAME=<your Hostinger database>
JWT_SECRET=<long random secret>
ADMIN_EMAIL=admin@darwichconsultancy.com
ADMIN_PASSWORD=<strong private password>
CLIENT_URL=https://darwichconsultancy.com,https://www.darwichconsultancy.com
SITE_URL=https://darwichconsultancy.com
NODE_ENV=production
```

Optional:

```text
GOOGLE_SITE_VERIFICATION=
GA_MEASUREMENT_ID=
STRIPE_SECRET_KEY=
```

## 4. Deploy
Deploy the latest `main` branch. The first successful start automatically creates the required MySQL tables and seeded consultancy services.

Expected runtime log:

```text
DARWICH running on port 5000
SITE_URL: https://darwichconsultancy.com
```

## 5. Test
- `https://darwichconsultancy.com/`
- `https://darwichconsultancy.com/health`
- `https://darwichconsultancy.com/admin/login`
- `https://darwichconsultancy.com/sitemap.xml`
