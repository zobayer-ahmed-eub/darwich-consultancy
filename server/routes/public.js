const express=require('express');
const db=require('../db');
const router=express.Router();

const asSettings=rows=>Object.fromEntries(rows.map(r=>[r.setting_key,r.setting_value]));
router.get('/settings',async(req,res)=>{const [rows]=await db.query('SELECT setting_key,setting_value FROM site_settings');res.json(asSettings(rows))});
router.get('/services',async(req,res)=>{const [rows]=await db.query(`SELECT * FROM services WHERE active=1 AND slug IN ('cost-estimation-consultancy','architectural-interior-design','mural-painting-3d-wall-art','wood-interiors-decking') ORDER BY sort_order,id`);res.json(rows)});
router.get('/services/:slug',async(req,res)=>{const [rows]=await db.query(`SELECT * FROM services WHERE slug=? AND active=1 AND slug IN ('cost-estimation-consultancy','architectural-interior-design','mural-painting-3d-wall-art','wood-interiors-decking') LIMIT 1`,[req.params.slug]);if(!rows.length)return res.status(404).json({message:'Service not found'});res.json(rows[0])});
router.get('/products',async(req,res)=>{const [rows]=await db.query('SELECT * FROM products WHERE active=1 ORDER BY featured DESC,sort_order,id DESC');res.json(rows)});
router.get('/products/:slug',async(req,res)=>{const [rows]=await db.query('SELECT * FROM products WHERE slug=? AND active=1 LIMIT 1',[req.params.slug]);if(!rows.length)return res.status(404).json({message:'Package not found'});res.json(rows[0])});
router.get('/projects',async(req,res)=>{const [rows]=await db.query('SELECT * FROM projects WHERE active=1 ORDER BY created_at DESC');res.json(rows)});
router.get('/testimonials',async(req,res)=>{const [rows]=await db.query('SELECT * FROM testimonials WHERE active=1 ORDER BY created_at DESC');res.json(rows)});
router.get('/management',async(req,res)=>{const [rows]=await db.query('SELECT * FROM management WHERE active=1 ORDER BY sort_order,id');res.json(rows)});
router.get('/gallery',async(req,res)=>{const [rows]=await db.query('SELECT * FROM gallery WHERE active=1 ORDER BY sort_order,id DESC');res.json(rows)});

router.post('/enquiries',async(req,res)=>{
  const {name,phone,email,suburb,service,message}=req.body||{};
  if(!name||!phone||!message)return res.status(400).json({message:'Name, phone and project details are required'});
  await db.query('INSERT INTO enquiries(name,phone,email,suburb,service,message) VALUES (?,?,?,?,?,?)',[name,phone,email||'',suburb||'',service||'',message]);
  res.status(201).json({ok:true});
});

router.post('/bookings',async(req,res)=>{
  const {customer_name,phone,email,address,suburb,preferred_date,preferred_time,notes,payment_method,items}=req.body||{};
  if(!customer_name||!phone||!Array.isArray(items)||!items.length)return res.status(400).json({message:'Name, phone and at least one item are required'});
  const ids=[...new Set(items.map(i=>Number(i.product_id)).filter(Boolean))];
  if(!ids.length)return res.status(400).json({message:'No valid products selected'});
  const placeholders=ids.map(()=>'?').join(',');
  const [products]=await db.query(`SELECT * FROM products WHERE active=1 AND id IN (${placeholders})`,ids);
  const map=new Map(products.map(p=>[Number(p.id),p]));
  const clean=[];let subtotal=0,deposit=0;
  for(const raw of items){
    const p=map.get(Number(raw.product_id)); if(!p) continue;
    const qty=Math.max(1,Math.min(50,Number(raw.qty)||1));
    if(Number(p.stock_tracking)===1 && Number(p.stock_qty)<qty) return res.status(400).json({message:`Not enough availability for ${p.name}`});
    const unit=Number(p.sale_price)>0?Number(p.sale_price):Number(p.price||0);
    subtotal+=unit*qty; deposit+=Number(p.deposit_amount||0)*qty;
    clean.push({product_id:p.id,slug:p.slug,name:p.name,qty,unit_price:unit,price_unit:p.price_unit,image:p.image||''});
  }
  if(!clean.length)return res.status(400).json({message:'Selected consultation packages are unavailable'});
  const [settingRows]=await db.query("SELECT setting_key,setting_value FROM site_settings WHERE setting_key IN ('gst_percent','prices_include_gst','bank_transfer_enabled','pay_later_enabled','quote_checkout_enabled','stripe_enabled','currency','booking_enabled','ecommerce_enabled')");
  const settings=asSettings(settingRows); if(String(settings.booking_enabled)==='0'||String(settings.ecommerce_enabled)==='0')return res.status(403).json({message:'Online booking is currently unavailable'}); const gstRate=Math.max(0,Number(settings.gst_percent||0)); const incl=String(settings.prices_include_gst)!=='0';
  let gst=0,total=subtotal;
  if(gstRate>0){ if(incl) gst=subtotal-(subtotal/(1+gstRate/100)); else {gst=subtotal*gstRate/100; total=subtotal+gst;} }
  const allowed=['pay_later','bank_transfer','request_quote','card'];
  const method=allowed.includes(payment_method)?payment_method:'pay_later';
  if(method==='bank_transfer' && String(settings.bank_transfer_enabled)!=='1') return res.status(400).json({message:'Bank transfer is not enabled'});
  if(method==='pay_later' && String(settings.pay_later_enabled)==='0') return res.status(400).json({message:'Pay later is not enabled'});
  if(method==='request_quote' && String(settings.quote_checkout_enabled)==='0') return res.status(400).json({message:'Quote checkout is not enabled'});
  if(method==='card' && (String(settings.stripe_enabled)!=='1' || !process.env.STRIPE_SECRET_KEY)) return res.status(400).json({message:'Online card payment is not configured yet'});
  const stamp=new Date(); const booking=`DARWICH-${stamp.toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  await db.query(`INSERT INTO bookings(booking_number,customer_name,phone,email,address,suburb,preferred_date,preferred_time,notes,items_json,subtotal,gst_amount,total_amount,deposit_due,payment_method) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[booking,customer_name,phone,email||'',address||'',suburb||'',preferred_date||null,preferred_time||'',notes||'',JSON.stringify(clean),subtotal,gst,total,deposit,method]);
  if(method==='card') {
    try {
      const site=(process.env.SITE_URL||'https://darwichconsultancy.com').replace(/\/$/,'');
      const params=new URLSearchParams();
      params.set('mode','payment');
      params.set('success_url',`${site}/checkout?stripe_success=1&session_id={CHECKOUT_SESSION_ID}`);
      params.set('cancel_url',`${site}/checkout?payment_cancelled=1`);
      if(email) params.set('customer_email',email);
      params.set('metadata[booking_number]',booking);
      params.set('line_items[0][price_data][currency]',String(settings.currency||'BDT').toLowerCase());
      params.set('line_items[0][price_data][product_data][name]',`DARWICH booking ${booking}`);
      params.set('line_items[0][price_data][product_data][description]',clean.map(x=>`${x.name} x ${x.qty}`).join(', ').slice(0,500));
      params.set('line_items[0][price_data][unit_amount]',String(Math.max(1,Math.round(total*100))));
      params.set('line_items[0][quantity]','1');
      const stripeRes=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`,'Content-Type':'application/x-www-form-urlencoded'},body:params});
      const stripe=await stripeRes.json();
      if(!stripeRes.ok) throw new Error(stripe?.error?.message||'Stripe checkout failed');
      return res.status(201).json({ok:true,booking_number:booking,subtotal,gst_amount:gst,total_amount:total,deposit_due:deposit,checkout_url:stripe.url});
    } catch(err) {
      await db.query("UPDATE bookings SET status='payment_error' WHERE booking_number=?",[booking]);
      return res.status(502).json({message:err.message||'Unable to start card payment',booking_number:booking});
    }
  }
  res.status(201).json({ok:true,booking_number:booking,subtotal,gst_amount:gst,total_amount:total,deposit_due:deposit});
});

router.get('/payments/stripe/verify',async(req,res)=>{
  const id=String(req.query.session_id||'');
  if(!id||!process.env.STRIPE_SECRET_KEY)return res.status(400).json({message:'Missing payment session'});
  const stripeRes=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`}});
  const stripe=await stripeRes.json();
  if(!stripeRes.ok)return res.status(400).json({message:stripe?.error?.message||'Unable to verify payment'});
  const booking=stripe.metadata?.booking_number;
  if(booking&&stripe.payment_status==='paid')await db.query("UPDATE bookings SET payment_status='paid', status=IF(status='new','confirmed',status) WHERE booking_number=?",[booking]);
  res.json({ok:true,payment_status:stripe.payment_status,booking_number:booking||''});
});
module.exports=router;
