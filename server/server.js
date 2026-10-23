require('dotenv').config();
const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
const path=require('path');
const fs=require('fs');
const db=require('./db');
const initDb=require('./initDb');
const publicRoutes=require('./routes/public');
const adminRoutes=require('./routes/admin');

const app=express();
app.set('trust proxy',1);
app.disable('x-powered-by');
const clientDist=path.join(__dirname,'..','client','dist');
const SITE_URL=(process.env.SITE_URL||'https://darwichconsultancy.com').replace(/\/$/,'');
const norm=v=>String(v||'').trim().replace(/\/$/,'');
const absolute=v=>{const s=String(v||'').trim();if(!s)return '';return /^https?:\/\//i.test(s)?s:`${SITE_URL}${s.startsWith('/')?'':'/'}${s}`};

app.use(helmet({contentSecurityPolicy:false,crossOriginResourcePolicy:false}));
const allowed=new Set(['https://darwichconsultancy.com','https://www.darwichconsultancy.com',norm(SITE_URL)]);
String(process.env.CLIENT_URL||'').split(',').map(norm).filter(Boolean).forEach(x=>allowed.add(x));
if(process.env.NODE_ENV!=='production'){allowed.add('http://localhost:5173');allowed.add('http://127.0.0.1:5173')}
app.use(cors({origin:(origin,cb)=>{if(!origin)return cb(null,true);const o=norm(origin);try{const host=new URL(o).hostname;if(allowed.has(o)||host.endsWith('.hostingersite.com'))return cb(null,true)}catch{}const e=new Error('Origin not allowed');e.code='CORS_NOT_ALLOWED';e.status=403;console.warn('Blocked CORS origin:',origin);cb(e)},credentials:true,methods:['GET','POST','PUT','PATCH','DELETE','OPTIONS'],allowedHeaders:['Content-Type','Authorization']}));
app.use(express.json({limit:'8mb'}));
app.use(express.urlencoded({extended:true,limit:'8mb'}));
app.use('/api/admin',rateLimit({windowMs:15*60*1000,max:120,standardHeaders:true,legacyHeaders:false}),adminRoutes);
app.use('/api',rateLimit({windowMs:15*60*1000,max:300,standardHeaders:true,legacyHeaders:false}),publicRoutes);

const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const jsonSafe=o=>JSON.stringify(o).replace(/</g,'\\u003c');
async function getSettings(){try{const [rows]=await db.query('SELECT setting_key,setting_value FROM site_settings');return Object.fromEntries(rows.map(r=>[r.setting_key,r.setting_value]))}catch{return {business_name:'Darwich Consultancy',service_area:'Bangladesh',logo_url:'/brand/darwich-wordmark.svg'}}}

async function pageData(pathname){
  const pages={
    '/':{title:'Darwich Consultancy | Creative Interiors & Murals in Bangladesh',description:'Cost estimation, architectural interior design, mural painting and 3D wall art, wood interiors and decking in Bangladesh.'},
    '/services':{title:'Four Creative Services | Darwich Consultancy',description:'Explore cost estimation and consultancy, architectural interior design, mural painting and 3D wall art, and wood interiors and decking.'},
    '/estimate':{title:'Project Cost Estimate Enquiry | Darwich Consultancy',description:'Submit a project brief for a scope-based cost consultation, covering interiors, mural art and timber finishes.'},
    '/products':{title:'Consultation Packages | Darwich Consultancy',description:'Browse any currently published interior, mural and cost consultancy packages.'},
    '/projects':{title:'Design Inspiration Portfolio | Darwich Consultancy',description:'Reference images for custom murals, Sajek-inspired timber interiors and decorative spaces; not verified completed work.'},
    '/gallery':{title:'Visual Gallery | Darwich Consultancy',description:'Curated mural painting and wood interior references for education, commercial and hospitality spaces.'},
    '/team':{title:'Creative Team | Darwich Consultancy',description:'Meet Darwich Consultancy team members and mural artist Arifa Jahan Swarna.'},
    '/about':{title:'About | Darwich Consultancy',description:'Darwich Consultancy works across cost estimation, architectural interior design, mural painting and wood interiors.'},
    '/contact':{title:'Contact Darwich Consultancy',description:'Enquire about architectural interior design, custom murals, cost estimation and wood interiors in Bangladesh.'},
    '/cart':{title:'Consultation Selection | Darwich Consultancy',description:'Review your selected consultation services.',noindex:true},
    '/checkout':{title:'Consultation Request | Darwich Consultancy',description:'Complete your Darwich Consultancy consultation request.',noindex:true}
  };
  if(/^\/projects\/\d+$/.test(pathname)){
    const id=Number(pathname.split('/')[2]);
    try {const [rows]=await db.query('SELECT id,title,category,description,cover_image FROM projects WHERE id=? AND active=1 AND category IN (?,?,?,?) LIMIT 1',[id,'Cost Estimation & Consultancy','Architectural Interior Design','Mural Painting & 3D Wall Art','Wood Interiors & Decking']);
      if(rows.length){const p=rows[0];const supplied=String(p.cover_image||'').startsWith('/portfolio/');return {title:`${p.title} | ${supplied?'Artwork Gallery':'Visual Reference'} | Darwich Consultancy`,description:(p.description||'Darwich mural and creative interiors portfolio photography.').replace(/^(PORTFOLIO PHOTO PROVIDED\.|REFERENCE IMAGE ONLY\.)\s*/, '').slice(0,155),image:absolute(p.cover_image),project:p}}}
    catch{}
    return {title:'Portfolio entry not found | Darwich Consultancy',description:'',noindex:true};
  }
  if(pathname.startsWith('/admin'))return {title:'Darwich Admin',description:'',noindex:true};
  if(pathname.startsWith('/services/')){const slug=pathname.split('/')[2];try{const [rows]=await db.query('SELECT * FROM services WHERE slug=? AND active=1 LIMIT 1',[slug]);if(rows.length){const s=rows[0];return {title:s.seo_title||`${s.title} | Darwich Consultancy`,description:s.seo_description||s.short_description||`${s.title} consultancy from Darwich Consultancy.`,service:s}}}catch{}return {title:'Service not found | Darwich Consultancy',description:'',noindex:true}}
  if(pathname.startsWith('/products/')){const slug=pathname.split('/')[2];try{const [rows]=await db.query('SELECT * FROM products WHERE slug=? AND active=1 LIMIT 1',[slug]);if(rows.length){const p=rows[0];return {title:`${p.name} | Darwich Consultancy`,description:p.short_description||`Book ${p.name} with Darwich Consultancy.`,product:p}}}catch{}return {title:'Package not found | Darwich Consultancy',description:'',noindex:true}}
  return pages[pathname]||{title:'Darwich Consultancy',description:'Creative interiors, mural painting, wood interiors and cost consultancy in Bangladesh.',noindex:true};
}

function schemaFor(pathname,settings,meta){
  const business={'@context':'https://schema.org','@type':'ProfessionalService','@id':`${SITE_URL}/#business`,name:settings.business_name||'Darwich Consultancy',url:SITE_URL,logo:absolute(settings.logo_url||'/brand/darwich-wordmark.svg'),image:`${SITE_URL}/brand/og-darwich.jpg`,description:'Creative interior design, custom mural painting, wood interiors and cost estimation and consultancy in Bangladesh.',areaServed:settings.service_area||'Bangladesh'};
  if(settings.phone)business.telephone=settings.phone;if(settings.email)business.email=settings.email;if(settings.address)business.address={'@type':'PostalAddress',streetAddress:settings.address,addressCountry:'BD'};
  const sameAs=[settings.facebook,settings.linkedin,settings.instagram].filter(Boolean);if(sameAs.length)business.sameAs=sameAs;
  const schemas=[business,{'@context':'https://schema.org','@type':'WebSite','@id':`${SITE_URL}/#website`,url:SITE_URL,name:settings.business_name||'Darwich Consultancy',publisher:{'@id':`${SITE_URL}/#business`}}];
  if(meta.service){const s=meta.service;const x={'@context':'https://schema.org','@type':'Service',name:s.title,description:s.seo_description||s.short_description||'',provider:{'@id':`${SITE_URL}/#business`},areaServed:settings.service_area||'Bangladesh',url:`${SITE_URL}${pathname}`};if(absolute(s.image))x.image=absolute(s.image);if(Number(s.starting_price)>0)x.offers={'@type':'Offer',priceCurrency:settings.currency||'BDT',price:Number(s.starting_price).toFixed(2),url:`${SITE_URL}${pathname}`};schemas.push(x)}
  if(pathname==='/about')schemas.push({'@context':'https://schema.org','@type':'AboutPage',url:`${SITE_URL}/about`,name:'About Darwich Consultancy'});
  if(pathname==='/contact')schemas.push({'@context':'https://schema.org','@type':'ContactPage',url:`${SITE_URL}/contact`,name:'Contact Darwich Consultancy'});
  if(pathname==='/team')schemas.push({'@context':'https://schema.org','@type':'CollectionPage',url:`${SITE_URL}/team`,name:'Darwich Consultancy Management Team'});
  if(meta.project)schemas.push({'@context':'https://schema.org','@type':'CreativeWork','name':meta.project.title,'description':meta.project.description||'Submitted artwork photography and design references; credits pending confirmation','image':absolute(meta.project.cover_image),'url':`${SITE_URL}${pathname}`});
  return schemas;
}

async function buildHead(pathname,settings){const m=await pageData(pathname);const canonical=`${SITE_URL}${pathname==='/'?'/':pathname}`;const image=m.image||`${SITE_URL}/brand/og-darwich.jpg`;const robots=m.noindex?'noindex,nofollow':'index,follow,max-image-preview:large';const verify=process.env.GOOGLE_SITE_VERIFICATION?`<meta name="google-site-verification" content="${esc(process.env.GOOGLE_SITE_VERIFICATION)}" />`:'';const ld=schemaFor(pathname,settings,m).map(x=>`<script type="application/ld+json">${jsonSafe(x)}</script>`).join('\n');const ga=process.env.GA_MEASUREMENT_ID?`<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(process.env.GA_MEASUREMENT_ID)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(process.env.GA_MEASUREMENT_ID)}');</script>`:'';return `<title>${esc(m.title)}</title><meta name="description" content="${esc(m.description)}"/><meta name="robots" content="${robots}"/><link rel="canonical" href="${canonical}"/><meta property="og:locale" content="en_BD"/><meta property="og:type" content="website"/><meta property="og:site_name" content="Darwich Consultancy"/><meta property="og:title" content="${esc(m.title)}"/><meta property="og:description" content="${esc(m.description)}"/><meta property="og:url" content="${canonical}"/><meta property="og:image" content="${image}"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${esc(m.title)}"/><meta name="twitter:description" content="${esc(m.description)}"/><meta name="twitter:image" content="${image}"/>${verify}\n${ld}\n${ga}`}

app.get('/robots.txt',(req,res)=>res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\nDisallow: /cart\nDisallow: /checkout\n\nSitemap: ${SITE_URL}/sitemap.xml\n`));
app.get('/sitemap.xml',async(req,res)=>{const routes=['/','/services','/estimate','/projects','/gallery','/team','/about','/contact'];let serviceRoutes=[],productRoutes=[],projectRoutes=[];try{const [rows]=await db.query("SELECT slug FROM services WHERE active=1 AND slug IN ('cost-estimation-consultancy','architectural-interior-design','mural-painting-3d-wall-art','wood-interiors-decking') ORDER BY sort_order,id");serviceRoutes=rows.map(x=>`/services/${x.slug}`)}catch{}try{const [rows]=await db.query('SELECT slug FROM products WHERE active=1 ORDER BY sort_order,id');productRoutes=rows.map(x=>`/products/${x.slug}`)}catch{}try{const [rows]=await db.query('SELECT id FROM projects WHERE active=1 AND category IN (?,?,?,?) ORDER BY id DESC',["Cost Estimation & Consultancy","Architectural Interior Design","Mural Painting & 3D Wall Art","Wood Interiors & Decking"]);projectRoutes=rows.map(x=>`/projects/${x.id}`)}catch{}const all=[...routes,...serviceRoutes,...projectRoutes,...productRoutes];const lastmod=new Date().toISOString().slice(0,10);const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${all.map((r,i)=>`<url><loc>${SITE_URL}${r}</loc><lastmod>${lastmod}</lastmod><changefreq>${i===0?'weekly':'monthly'}</changefreq><priority>${i===0?'1.0':'0.8'}</priority></url>`).join('')}</urlset>`;res.type('application/xml').send(xml)});
app.get('/health',(req,res)=>res.json({ok:true,service:'DARWICH'}));
if(fs.existsSync(clientDist)){app.use(express.static(clientDist,{index:false,maxAge:'1h'}));app.get('*',async(req,res,next)=>{if(req.path.startsWith('/api'))return next();try{const html=fs.readFileSync(path.join(clientDist,'index.html'),'utf8');const settings=await getSettings();res.type('html').send(html.replace('<!--SEO_HEAD-->',await buildHead(req.path,settings)))}catch(e){next(e)}})}
app.use((err,req,res,next)=>{if(err?.code==='CORS_NOT_ALLOWED')return res.status(403).json({message:'Origin not allowed'});console.error(err);res.status(err?.status||500).json({message:err?.status&&err.status<500?err.message:'Server error'})});
async function start(){try{await initDb();const port=Number(process.env.PORT||5000);app.listen(port,()=>{console.log(`DARWICH running on port ${port}`);console.log(`SITE_URL: ${SITE_URL}`);console.log(`CORS allowed origins: ${[...allowed].join(', ')}`)})}catch(err){console.error('DARWICH startup failed:',err);process.exit(1)}}
start();
