const bcrypt = require('bcryptjs');
const db = require('./db');

async function columnExists(table, column){
  const [rows]=await db.query(`SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=? LIMIT 1`,[table,column]);
  return rows.length>0;
}
async function ensureColumn(table,column,definition){
  if(!(await columnExists(table,column))) await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
}

async function initDb(){
  await db.query(`CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS site_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value LONGTEXT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(120) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    kicker VARCHAR(150) NULL,
    short_description TEXT NULL,
    body LONGTEXT NULL,
    starting_price DECIMAL(12,2) DEFAULT 0,
    price_label VARCHAR(120) DEFAULT 'Starting from',
    price_unit VARCHAR(80) DEFAULT 'project',
    image LONGTEXT NULL,
    booking_enabled TINYINT(1) DEFAULT 1,
    quote_enabled TINYINT(1) DEFAULT 1,
    nav_visible TINYINT(1) DEFAULT 1,
    featured TINYINT(1) DEFAULT 0,
    duration_minutes INT DEFAULT 0,
    seo_title VARCHAR(255) NULL,
    seo_description TEXT NULL,
    sort_order INT DEFAULT 0,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await ensureColumn('services','starting_price','DECIMAL(12,2) DEFAULT 0');
  await ensureColumn('services','price_label',"VARCHAR(120) DEFAULT 'Starting from'");
  await ensureColumn('services','price_unit',"VARCHAR(80) DEFAULT 'project'");
  await ensureColumn('services','image','LONGTEXT NULL');
  await ensureColumn('services','booking_enabled','TINYINT(1) DEFAULT 1');
  await ensureColumn('services','quote_enabled','TINYINT(1) DEFAULT 1');
  await ensureColumn('services','nav_visible','TINYINT(1) DEFAULT 1');
  await ensureColumn('services','featured','TINYINT(1) DEFAULT 0');
  await ensureColumn('services','duration_minutes','INT DEFAULT 0');
  await ensureColumn('services','seo_title','VARCHAR(255) NULL');
  await ensureColumn('services','seo_description','TEXT NULL');
  await ensureColumn('services','created_at','TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  await ensureColumn('services','updated_at','TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  await db.query(`CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(180) NOT NULL,
    category VARCHAR(100) NULL,
    short_description TEXT NULL,
    description LONGTEXT NULL,
    price DECIMAL(12,2) DEFAULT 0,
    sale_price DECIMAL(12,2) DEFAULT 0,
    price_unit VARCHAR(80) DEFAULT 'consultation',
    deposit_amount DECIMAL(12,2) DEFAULT 0,
    image LONGTEXT NULL,
    active TINYINT(1) DEFAULT 1,
    featured TINYINT(1) DEFAULT 0,
    bookable TINYINT(1) DEFAULT 1,
    stock_tracking TINYINT(1) DEFAULT 0,
    stock_qty INT DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(80) NOT NULL,
    email VARCHAR(190) NULL,
    address VARCHAR(255) NULL,
    suburb VARCHAR(120) NULL,
    preferred_date DATE NULL,
    preferred_time VARCHAR(80) NULL,
    notes TEXT NULL,
    items_json LONGTEXT NOT NULL,
    subtotal DECIMAL(12,2) DEFAULT 0,
    gst_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    deposit_due DECIMAL(12,2) DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'pay_later',
    payment_status VARCHAR(30) DEFAULT 'unpaid',
    status VARCHAR(30) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS management (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(150) NOT NULL,
    bio TEXT NULL,
    phone VARCHAR(80) NULL,
    email VARCHAR(190) NULL,
    photo LONGTEXT NULL,
    sort_order INT DEFAULT 0,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    category VARCHAR(100) NULL,
    image LONGTEXT NOT NULL,
    sort_order INT DEFAULT 0,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    category VARCHAR(80) NULL,
    suburb VARCHAR(120) NULL,
    description TEXT NULL,
    cover_image LONGTEXT NULL,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    suburb VARCHAR(120) NULL,
    rating INT DEFAULT 5,
    quote TEXT NOT NULL,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(80) NOT NULL,
    email VARCHAR(190) NULL,
    suburb VARCHAR(120) NULL,
    service VARCHAR(80) NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  const settings={
    business_name:'Darwich Consultancy',
    phone:'',
    email:'',
    service_area:'Bangladesh',
    address:'',
    trade_licence:'',
    registration:'',
    facebook:'',
    linkedin:'',
    instagram:'',
    logo_url:'/brand/darwich-wordmark.svg',
    currency:'BDT',
    currency_symbol:'৳',
    gst_percent:'0',
    prices_include_gst:'1',
    booking_enabled:'1',
    ecommerce_enabled:'1',
    bank_transfer_enabled:'0',
    bank_transfer_instructions:'',
    pay_later_enabled:'1',
    quote_checkout_enabled:'1',
    stripe_enabled:'0',
    booking_notice:'Consultation requests are confirmed after our team reviews the project details.',
    minimum_booking_notice_hours:'24'
  };
  for(const [k,v] of Object.entries(settings)){
    await db.query('INSERT IGNORE INTO site_settings(setting_key,setting_value) VALUES (?,?)',[k,v]);
  }

  // New public business direction. This migration runs ONCE per database.
  // It archives, rather than permanently destroys, legacy business content.
  const migrationKey='darwich_refresh_four_services_20261021';
  const [[migrated]]=await db.query('SELECT setting_value FROM site_settings WHERE setting_key=?',[migrationKey]);
  if(!migrated){
    for(const table of ['services','projects','gallery','management','testimonials','products']){
      const archive=`archived_20261021_${table}`;
      await db.query(`CREATE TABLE IF NOT EXISTS \`${archive}\` LIKE \`${table}\``);
      await db.query(`INSERT IGNORE INTO \`${archive}\` SELECT * FROM \`${table}\``);
    }
    // Do NOT delete orders, enquiries or existing booking records.
    await db.query('DELETE FROM services');
    await db.query('DELETE FROM projects');
    await db.query('DELETE FROM gallery');
    await db.query('DELETE FROM management');
    await db.query('DELETE FROM testimonials');
    await db.query('DELETE FROM products');
    await db.query("UPDATE site_settings SET setting_value='/brand/darwich-wordmark.svg' WHERE setting_key='logo_url' AND setting_value='/brand/darwich-logo.png'");
    console.log('Darwich refresh: legacy public catalogue archived; new categories are being seeded.');
  }

  const services=[
    ['cost-estimation-consultancy','Cost Estimation & Consultancy','Plan with confidence','Budget planning, clear quantity guidance and practical advice for your interior, mural or timber project.','We review the project brief, intended finishes, approximate measurements and site context to help you make informed decisions. Ask for a scope-specific estimate, advice on materials and a clear next step. Estimates are indicative until reviewed and confirmed.',1],
    ['architectural-interior-design','Architectural Interior Design','Designed for daily life','Interior planning, material palettes and considered design concepts for residential, hospitality and commercial spaces.','We explore layout, circulation, lighting, joinery, materials and the experience of the space. Concept development can include mood boards, spatial planning and visual presentation tailored to the brief.',2],
    ['mural-painting-3d-wall-art','Mural Painting & 3D Wall Art','Art that tells a story','School murals, custom artwork, decorative wall finishes and memorable commercial brand environments.','From cultural motifs and educational artwork to brand-focused wall painting and dimensional finishes, we work from a visual brief to create a strong sense of place. Portfolio imagery currently illustrates styles and needs project verification.',3],
    ['wood-interiors-decking','Wood Interiors & Decking','Warmth in every detail','Wood-lined resort rooms, feature walls, built-ins and decks inspired by natural textures and thoughtful joinery.','Explore timber-inspired interior concepts including warm bedroom surfaces, statement ceilings, cabinetry and outdoor decking. The Sajek imagery shown is design reference material, not a verified completed company project.',4]
  ];
  for(const x of services){
    await db.query(`INSERT IGNORE INTO services(slug,title,kicker,short_description,body,starting_price,price_label,price_unit,image,booking_enabled,quote_enabled,nav_visible,featured,sort_order,active)
      VALUES (?,?,?,?,?,?,?,?,?,1,1,1,1,?,1)`,[
      x[0],x[1],x[2],x[3],x[4],0,'Custom quotation','project',
      ['/showcase/school-message.webp','/showcase/ornamental-wall.webp','/showcase/mural-painter.webp','/showcase/sajek-room.webp'][x[5]-1],x[5]
    ]);
  }

  // Seed example galleries ONLY on the first refresh, so administrators can edit/delete freely.
  if(!migrated){
    const projects=[
      ['Village Primary School — Mural Inspiration','Mural Painting & 3D Wall Art','Bangladesh · design reference','REFERENCE IMAGE ONLY. Educational wall painting with illustrated school messages. Village primary school name and participation require confirmation.','/showcase/primary-school.webp'],
      ['School Awareness Mural — Visual Reference','Mural Painting & 3D Wall Art','Bangladesh · design reference','REFERENCE IMAGE ONLY. Bold painted storytelling can support awareness campaigns and school spaces. Not a verified Darwich completion.','/showcase/school-message.webp'],
      ['Decorative Heritage Wall Art','Mural Painting & 3D Wall Art','Design reference','REFERENCE IMAGE ONLY. Decorative hand-painted patterns and cultural motifs for interior accent walls. Project ownership unverified.','/showcase/ornamental-wall.webp'],
      ['Commercial Brand Wall Painting Concept','Mural Painting & 3D Wall Art','Design concept','CONCEPT REFERENCE. Custom murals, logos and dimensional graphics can help cafes, offices and retail spaces tell their story. No completed Darwich project claimed.','/showcase/mural-painter.webp'],
      ['Sajek Resort Room — Wood Interior Inspiration','Wood Interiors & Decking','Sajek Valley, Rangamati · reference','REFERENCE IMAGE ONLY. A wood-accented resort room photographed in Sajek, illustrating warm finishes and bedroom detailing. Darwich project attribution awaits confirmation.','/showcase/sajek-room.webp'],
      ['Wood-Lined Boutique Bedroom Concept','Wood Interiors & Decking','Design reference','REFERENCE IMAGE ONLY. Wood-furnished guest bedroom, CC0 Wikimedia Commons photograph. Not a Darwich commission.','https://commons.wikimedia.org/wiki/Special:FilePath/Hotel_room_with_traditional_wooden_decor_and_city_view.jpg?width=1000']
    ];
    for(const p of projects)await db.query('INSERT INTO projects(title,category,suburb,description,cover_image,active) VALUES (?,?,?,?,?,1)',p);
    const gallery=[
      ['Primary school exterior artwork','Mural Painting & 3D Wall Art','/showcase/primary-school.webp'],
      ['Educational mural illustration','Mural Painting & 3D Wall Art','/showcase/school-message.webp'],
      ['Ornamental wall pattern','Mural Painting & 3D Wall Art','/showcase/ornamental-wall.webp'],
      ['Mural painting in progress','Mural Painting & 3D Wall Art','/showcase/mural-painter.webp'],
      ['Sajek resort bedroom inspiration','Wood Interiors & Decking','/showcase/sajek-room.webp'],
      ['Wood decor bedroom inspiration · CC0','Wood Interiors & Decking','https://commons.wikimedia.org/wiki/Special:FilePath/Hotel_room_with_traditional_wooden_decor_and_city_view.jpg?width=1000'],
      ['Hospitality bedroom example · CC0','Wood Interiors & Decking','https://commons.wikimedia.org/wiki/Special:FilePath/Bed_in_hotel_room.jpg?width=1000']
    ];
    for(let i=0;i<gallery.length;i++)await db.query('INSERT INTO gallery(title,category,image,sort_order,active) VALUES (?,?,?,?,1)',[...gallery[i],i+1]);
    await db.query('INSERT INTO management(name,role,bio,phone,email,photo,sort_order,active) VALUES (?,?,?,?,?,?,?,1)',[
      'Arifa Jahan Swarna','Mural Artist','Mural and decorative wall-art profile. Portrait and portfolio credit require final client confirmation.','','','/showcase/arifa-portrait-reference.webp',1
    ]);
    for(let i=2;i<=4;i++)await db.query('INSERT INTO management(name,role,bio,phone,email,photo,sort_order,active) VALUES (?,?,?,?,?,?,?,1)',[
      `Team member ${String(i).padStart(2,'0')} — details pending`,'Profile awaiting confirmation','Replace this placeholder with the approved name, photograph and role in the Admin → Management section.','','','',i
    ]);
    await db.query('INSERT INTO site_settings(setting_key,setting_value) VALUES (?,?)',[migrationKey,'1']);
  }

  const email=process.env.ADMIN_EMAIL;
  const password=process.env.ADMIN_PASSWORD;
  if(email && password){
    const hash=await bcrypt.hash(password,12);
    const [rows]=await db.query('SELECT id FROM admins WHERE email=?',[email]);
    if(!rows.length) console.log(`DARWICH admin created: ${email}`);
    await db.query('INSERT INTO admins(email,password_hash) VALUES (?,?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)',[email,hash]);
  }
}
module.exports=initDb;
