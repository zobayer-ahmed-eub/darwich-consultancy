const express=require('express');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const db=require('../db');
const auth=require('../middleware/auth');
const router=express.Router();
const approvedServices=new Set(['cost-estimation-consultancy','architectural-interior-design','mural-painting-3d-wall-art','wood-interiors-decking']);
const approvedCategories=new Set(['Cost Estimation & Consultancy','Architectural Interior Design','Mural Painting & 3D Wall Art','Wood Interiors & Decking']);

const cleanSlug=value=>String(value||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const n=value=>Number.isFinite(Number(value))?Number(value):0;
const bit=(value,fallback=0)=>value===undefined||value===null?fallback:(Number(value)?1:0);

router.post('/login',async(req,res)=>{const {email,password}=req.body||{};const [rows]=await db.query('SELECT * FROM admins WHERE email=? LIMIT 1',[email]);if(!rows.length||!(await bcrypt.compare(password||'',rows[0].password_hash)))return res.status(401).json({message:'Invalid email or password'});const token=jwt.sign({id:rows[0].id,email:rows[0].email},process.env.JWT_SECRET,{expiresIn:'12h'});res.json({token})});
router.use(auth);
router.get('/summary',async(req,res)=>{const names=['services','products','bookings','projects','testimonials','enquiries','management','gallery'];const out={};for(const n of names){const [[r]]=await db.query(`SELECT COUNT(*) count FROM \`${n}\``);out[n]=Number(r.count||0)}const [[newBookings]]=await db.query("SELECT COUNT(*) count FROM bookings WHERE status='new'");const [[newEnquiries]]=await db.query("SELECT COUNT(*) count FROM enquiries WHERE status='new'");out.new_bookings=Number(newBookings.count||0);out.new_enquiries=Number(newEnquiries.count||0);res.json(out)});
router.get('/settings',async(req,res)=>{const [rows]=await db.query('SELECT setting_key,setting_value FROM site_settings');res.json(Object.fromEntries(rows.map(r=>[r.setting_key,r.setting_value])))});
// Limit homepage image settings to safe image sources and keep uploads compact.
const homepageImages=new Set(['home_hero_main_image','home_hero_secondary_image','home_sajek_image']);
const homepageFlags=new Set(['home_hero_art_visible','home_hero_main_visible','home_hero_secondary_visible','home_sajek_visible']);
router.put('/settings',async(req,res)=>{
 const entries=Object.entries(req.body||{});
 for(const [key,value] of entries){
  if(homepageImages.has(key)){
   const src=String(value??'').trim();
   const isData=/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(src);
   const isURL=/^https:\/\/[^\s"'<>]+$/i.test(src)||/^\/(?!\/)[\w./%-]+$/.test(src);
   if(src && !(isData||isURL))return res.status(400).json({message:'Homepage images must be JPG, PNG, WebP uploads, HTTPS URLs, or local paths.'});
   if(src.length>650000)return res.status(413).json({message:'Image is too large after compression. Please use a smaller image.'});
  }
  if(homepageFlags.has(key)&&!['0','1'].includes(String(value)))return res.status(400).json({message:'Invalid visibility setting.'});
  if(key==='office_map_url' && value && !/^https:\/\/(?:www\.google\.com\/maps\/|maps\.app\.goo\.gl\/)/i.test(String(value))) return res.status(400).json({message:'Use a Google Maps sharing URL for office directions.'});
  if(key==='office_map_embed_url' && value && !/^https:\/\/www\.google\.com\/maps\/embed\?/i.test(String(value))) return res.status(400).json({message:'Use a Google Maps Embed URL beginning with https://www.google.com/maps/embed?.'});
  if(key==='home_hero_background_color'&&value!==''&&!/^#[0-9a-f]{6}$/i.test(String(value)))return res.status(400).json({message:'Invalid background colour.'});
 }
 for(const [k,v] of entries){await db.query('INSERT INTO site_settings(setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)',[k,String(v??'')]);}
 res.json({ok:true});
});

router.get('/services',async(req,res)=>{
  const [rows]=await db.query('SELECT * FROM services ORDER BY sort_order,id');
  res.json(rows);
});

router.post('/services',async(req,res)=>{
  const b=req.body||{};
  const slug=cleanSlug(b.slug||b.title);
  if(!b.title||!slug||!approvedServices.has(slug))return res.status(400).json({message:'Only the four approved service slugs are allowed'});
  try{
    const [result]=await db.query(`INSERT INTO services(
      slug,title,kicker,short_description,body,starting_price,price_label,price_unit,image,
      booking_enabled,quote_enabled,nav_visible,featured,duration_minutes,seo_title,seo_description,sort_order,active
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[
      slug,String(b.title).trim(),b.kicker||'',b.short_description||'',b.body||'',n(b.starting_price),b.price_label||'Starting from',b.price_unit||'project',b.image||'',
      bit(b.booking_enabled,1),bit(b.quote_enabled,1),bit(b.nav_visible,1),bit(b.featured,0),Math.max(0,n(b.duration_minutes)),b.seo_title||'',b.seo_description||'',n(b.sort_order),bit(b.active,1)
    ]);
    const [[created]]=await db.query('SELECT * FROM services WHERE id=?',[result.insertId]);
    res.status(201).json(created);
  }catch(err){
    if(err?.code==='ER_DUP_ENTRY')return res.status(409).json({message:'That service URL slug is already in use'});
    throw err;
  }
});

router.put('/services/:id',async(req,res)=>{
  const b=req.body||{};
  const slug=cleanSlug(b.slug||b.title);
  if(!b.title||!slug||!approvedServices.has(slug))return res.status(400).json({message:'Only the four approved service slugs are allowed'});
  try{
    await db.query(`UPDATE services SET
      slug=?,title=?,kicker=?,short_description=?,body=?,starting_price=?,price_label=?,price_unit=?,image=?,
      booking_enabled=?,quote_enabled=?,nav_visible=?,featured=?,duration_minutes=?,seo_title=?,seo_description=?,sort_order=?,active=?
      WHERE id=?`,[
      slug,String(b.title).trim(),b.kicker||'',b.short_description||'',b.body||'',n(b.starting_price),b.price_label||'Starting from',b.price_unit||'project',b.image||'',
      bit(b.booking_enabled,1),bit(b.quote_enabled,1),bit(b.nav_visible,1),bit(b.featured,0),Math.max(0,n(b.duration_minutes)),b.seo_title||'',b.seo_description||'',n(b.sort_order),bit(b.active,1),req.params.id
    ]);
    const [[updated]]=await db.query('SELECT * FROM services WHERE id=?',[req.params.id]);
    if(!updated)return res.status(404).json({message:'Service not found'});
    res.json(updated);
  }catch(err){
    if(err?.code==='ER_DUP_ENTRY')return res.status(409).json({message:'That service URL slug is already in use'});
    throw err;
  }
});

router.delete('/services/:id',async(req,res)=>{
  const [[service]]=await db.query('SELECT id,title FROM services WHERE id=?',[req.params.id]);
  if(!service)return res.status(404).json({message:'Service not found'});
  await db.query('DELETE FROM services WHERE id=?',[req.params.id]);
  res.json({ok:true,deleted:service.title});
});

router.get('/products',async(req,res)=>{const [rows]=await db.query('SELECT * FROM products ORDER BY sort_order,id DESC');res.json(rows)});
router.post('/products',async(req,res)=>{const b=req.body||{};if(!b.name||!b.slug)return res.status(400).json({message:'Package name and slug are required'});await db.query(`INSERT INTO products(slug,name,category,short_description,description,price,sale_price,price_unit,deposit_amount,image,active,featured,bookable,stock_tracking,stock_qty,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[b.slug,b.name,b.category||'',b.short_description||'',b.description||'',Number(b.price)||0,Number(b.sale_price)||0,b.price_unit||'consultation',Number(b.deposit_amount)||0,b.image||'',b.active??1,b.featured??0,b.bookable??1,b.stock_tracking??0,Number(b.stock_qty)||0,Number(b.sort_order)||0]);res.status(201).json({ok:true})});
router.put('/products/:id',async(req,res)=>{const b=req.body||{};await db.query(`UPDATE products SET slug=?,name=?,category=?,short_description=?,description=?,price=?,sale_price=?,price_unit=?,deposit_amount=?,image=?,active=?,featured=?,bookable=?,stock_tracking=?,stock_qty=?,sort_order=? WHERE id=?`,[b.slug,b.name,b.category||'',b.short_description||'',b.description||'',Number(b.price)||0,Number(b.sale_price)||0,b.price_unit||'consultation',Number(b.deposit_amount)||0,b.image||'',b.active??1,b.featured??0,b.bookable??1,b.stock_tracking??0,Number(b.stock_qty)||0,Number(b.sort_order)||0,req.params.id]);res.json({ok:true})});
router.delete('/products/:id',async(req,res)=>{await db.query('DELETE FROM products WHERE id=?',[req.params.id]);res.json({ok:true})});

router.get('/bookings',async(req,res)=>{const [rows]=await db.query('SELECT * FROM bookings ORDER BY created_at DESC');res.json(rows.map(r=>({...r,items:JSON.parse(r.items_json||'[]')})))});
router.put('/bookings/:id',async(req,res)=>{const {status,payment_status,payment_method,preferred_date,preferred_time,notes}=req.body||{};await db.query('UPDATE bookings SET status=?,payment_status=?,payment_method=?,preferred_date=?,preferred_time=?,notes=? WHERE id=?',[status||'new',payment_status||'unpaid',payment_method||'pay_later',preferred_date||null,preferred_time||'',notes||'',req.params.id]);res.json({ok:true})});
router.delete('/bookings/:id',async(req,res)=>{await db.query('DELETE FROM bookings WHERE id=?',[req.params.id]);res.json({ok:true})});

router.get('/management',async(req,res)=>{const [rows]=await db.query('SELECT * FROM management ORDER BY sort_order,id');res.json(rows)});
router.post('/management',async(req,res)=>{const b=req.body||{};if(!b.name||!b.role)return res.status(400).json({message:'Name and role are required'});await db.query('INSERT INTO management(name,role,bio,phone,email,photo,sort_order,active) VALUES (?,?,?,?,?,?,?,?)',[b.name,b.role,b.bio||'',b.phone||'',b.email||'',b.photo||'',Number(b.sort_order)||0,b.active??1]);res.status(201).json({ok:true})});
router.put('/management/:id',async(req,res)=>{const b=req.body||{};await db.query('UPDATE management SET name=?,role=?,bio=?,phone=?,email=?,photo=?,sort_order=?,active=? WHERE id=?',[b.name,b.role,b.bio||'',b.phone||'',b.email||'',b.photo||'',Number(b.sort_order)||0,b.active??1,req.params.id]);res.json({ok:true})});
router.delete('/management/:id',async(req,res)=>{await db.query('DELETE FROM management WHERE id=?',[req.params.id]);res.json({ok:true})});

router.get('/gallery',async(req,res)=>{const [rows]=await db.query('SELECT * FROM gallery ORDER BY sort_order,id DESC');res.json(rows)});
router.post('/gallery',async(req,res)=>{const b=req.body||{};if(!b.title||!b.image||!approvedCategories.has(b.category))return res.status(400).json({message:'Title, image and an approved category are required'});await db.query('INSERT INTO gallery(title,category,image,sort_order,active) VALUES (?,?,?,?,?)',[b.title,b.category||'',b.image,Number(b.sort_order)||0,b.active??1]);res.status(201).json({ok:true})});
router.put('/gallery/:id',async(req,res)=>{const b=req.body||{};await db.query('UPDATE gallery SET title=?,category=?,image=?,sort_order=?,active=? WHERE id=?',[b.title,b.category||'',b.image||'',Number(b.sort_order)||0,b.active??1,req.params.id]);res.json({ok:true})});
router.delete('/gallery/:id',async(req,res)=>{await db.query('DELETE FROM gallery WHERE id=?',[req.params.id]);res.json({ok:true})});

const projectPhotoJSON=value=>{let values=[];if(Array.isArray(value))values=value;else if(typeof value==='string'){try{const a=JSON.parse(value);values=Array.isArray(a)?a:value.split(/[\n,]+/);}catch{values=value.split(/[\n,]+/);}}const clean=values.map(x=>String(x||'').trim()).filter(x=>/^\/(?!\/)[a-z0-9_./%-]+$/i.test(x)||/^https:\/\/[^\s<>"']+$/i.test(x));return JSON.stringify([...new Set(clean)].slice(0,15));};
router.get('/projects',async(req,res)=>{const [rows]=await db.query('SELECT * FROM projects ORDER BY created_at DESC');res.json(rows)});
router.post('/projects',async(req,res)=>{const b=req.body||{};if(!b.title||!approvedCategories.has(b.category))return res.status(400).json({message:'Project title and an approved category are required'});await db.query('INSERT INTO projects(title,category,suburb,description,cover_image,gallery_images,active) VALUES (?,?,?,?,?,?,?)',[b.title,b.category||'',b.suburb||'',b.description||'',b.cover_image||'',projectPhotoJSON(b.gallery_images),b.active??1]);res.status(201).json({ok:true})});
router.put('/projects/:id',async(req,res)=>{const b=req.body||{};await db.query('UPDATE projects SET title=?,category=?,suburb=?,description=?,cover_image=?,gallery_images=?,active=? WHERE id=?',[b.title,b.category||'',b.suburb||'',b.description||'',b.cover_image||'',projectPhotoJSON(b.gallery_images),b.active??1,req.params.id]);res.json({ok:true})});
router.delete('/projects/:id',async(req,res)=>{await db.query('DELETE FROM projects WHERE id=?',[req.params.id]);res.json({ok:true})});

router.get('/testimonials',async(req,res)=>{const [rows]=await db.query('SELECT * FROM testimonials ORDER BY created_at DESC');res.json(rows)});
router.post('/testimonials',async(req,res)=>{const b=req.body||{};if(!b.name||!b.quote)return res.status(400).json({message:'Name and quote are required'});await db.query('INSERT INTO testimonials(name,suburb,rating,quote,active) VALUES (?,?,?,?,?)',[b.name,b.suburb||'',b.rating||5,b.quote,b.active??1]);res.status(201).json({ok:true})});
router.put('/testimonials/:id',async(req,res)=>{const b=req.body||{};await db.query('UPDATE testimonials SET name=?,suburb=?,rating=?,quote=?,active=? WHERE id=?',[b.name,b.suburb||'',Number(b.rating)||5,b.quote,b.active??1,req.params.id]);res.json({ok:true})});
router.delete('/testimonials/:id',async(req,res)=>{await db.query('DELETE FROM testimonials WHERE id=?',[req.params.id]);res.json({ok:true})});

router.get('/enquiries',async(req,res)=>{const [rows]=await db.query('SELECT * FROM enquiries ORDER BY created_at DESC');res.json(rows)});
router.put('/enquiries/:id',async(req,res)=>{await db.query('UPDATE enquiries SET status=? WHERE id=?',[req.body?.status||'new',req.params.id]);res.json({ok:true})});
router.delete('/enquiries/:id',async(req,res)=>{await db.query('DELETE FROM enquiries WHERE id=?',[req.params.id]);res.json({ok:true})});
module.exports=router;
