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
    logo_url:'/brand/darwich-logo.png',
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

  const services=[
    ['architectural-design','Architectural Design','Planning & design','Functional, buildable architectural planning for residential and commercial projects.','We help shape the project from early concept through coordinated design. Scope can include space planning, layout development, design coordination, presentation drawings and construction-focused documentation. Every engagement is tailored to the actual site, brief and approval requirements.',0,'Starting from','project',1,1,1,1,1],
    ['structural-engineering','Structural Engineering','Safety & buildability','Structural design and technical coordination focused on safety, efficiency and practical construction.','Our structural consultancy supports reinforced concrete, steel and mixed construction systems. We coordinate structural decisions with architecture and site conditions so the design is practical to execute and easier to manage during construction.',0,'Starting from','project',1,1,1,1,2],
    ['cost-estimation-boq','Cost Estimation & BOQ','Cost clarity','Quantity take-offs, BOQ preparation and cost planning to help control project decisions before and during construction.','Clear cost information helps clients compare options and manage scope. We can prepare bills of quantities, preliminary estimates, itemised cost schedules and cost updates as project information develops.',0,'Starting from','project',1,1,1,1,3],
    ['project-management','Project Management','Coordination & control','Structured project coordination covering scope, schedule, consultants, contractors and reporting.','Darwich Consultancy helps clients organise project delivery through clear responsibilities, programme tracking, coordination and practical reporting. The exact management scope is agreed around the size and stage of each project.',0,'Starting from','project',1,1,1,1,4],
    ['construction-supervision','Construction Supervision','Site quality','Independent site supervision and construction monitoring to support quality, compliance and progress.','Site supervision can include inspections, progress observations, coordination with contractors, review of workmanship against issued drawings and identification of items requiring correction or clarification.',0,'Starting from','project',1,1,1,1,5],
    ['interior-fitout-consultancy','Interior & Fit-out Consultancy','Spaces that work','Planning, specification and coordination support for interior upgrades, fit-outs and renovation projects.','We support interior and fit-out projects with layout planning, finish coordination, practical detailing, cost awareness and construction-stage coordination so design intent remains achievable on site.',0,'Starting from','project',1,1,1,0,6]
  ];
  for(const s of services){
    await db.query(`INSERT IGNORE INTO services(slug,title,kicker,short_description,body,starting_price,price_label,price_unit,booking_enabled,quote_enabled,nav_visible,featured,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,s);
  }

  // One-time non-destructive site refresh: old services are archived, not deleted.
  // Existing products, bookings, projects, enquiries and uploaded admin content are retained.
  const [[migration]]=await db.query("SELECT setting_value FROM site_settings WHERE setting_key='darwich_four_services_v1'");
  if(!migration){
    const refreshed=[
      ['cost-estimation-consultancy','Cost Estimation & Consultancy','Plan better · Budget clearly','Itemised project cost estimates, scope planning and practical consultancy for renovations, fit-outs and construction.','We help you define requirements, compare material options and make informed budget decisions. Available support includes quantity take-offs, BOQ preparation, estimates, material and labour costing, budget planning and indicative work schedules. Final figures depend on measured scope, site conditions and current local prices.',1],
      ['architectural-interior-design','Architectural Interior Design','Layouts · Finishes · Practical details','Interior concepts, space planning and architectural design support for residential and commercial environments.','From concept layouts and space optimisation to coordinated finishes and materials, our architectural interior design support balances practicality, aesthetics and budget. Scope is confirmed based on project requirements and available site information.',2],
      ['mural-painting-3d-wall-art','Mural Painting & 3D Wall Art','Schools · Cafés · Feature walls','Creative murals, cultural illustrations, commercial feature walls and 3D-inspired art for memorable spaces.','Mural work can support primary schools, cafes, public spaces and branded interiors. We discuss wall condition, design direction, artwork approval, materials and installation requirements before making a proposal.',3],
      ['wood-interiors-decking','Wood Interiors & Decking','Resort rooms · Timber details','Warm wood interiors, wall and ceiling panelling, custom timber finishes and resort-inspired decking.','Explore timber textures, practical details, cladding, joinery and decking solutions for rooms and outdoor living spaces. The Sajek photographs shown on this website are visual references until the company verifies project attribution.',4]
    ];
    for(const row of refreshed){
      await db.query(`INSERT IGNORE INTO services (slug,title,kicker,short_description,body,starting_price,booking_enabled,quote_enabled,nav_visible,featured,sort_order,active)
        VALUES (?,?,?,?,?,0,1,1,1,1,?,1)`,row);
    }
    await db.query(`UPDATE services SET active=0,nav_visible=0,featured=0 WHERE slug NOT IN (?,?,?,?)`,refreshed.map(x=>x[0]));
    // Name and role were provided by the client; photograph and credentials await confirmation.
    const [[artist]]=await db.query('SELECT id FROM management WHERE name=? LIMIT 1',['Arifa Jahan Swarna']);
    if(!artist) await db.query(`INSERT INTO management (name,role,bio,sort_order,active) VALUES (?,?,?,?,?)`,
      ['Arifa Jahan Swarna','Mural Artist','Mural painting and decorative wall-art profile. Project credits, biography and an approved portrait can be added from the admin panel.',1,1]);
    await db.query("INSERT INTO site_settings(setting_key,setting_value) VALUES ('darwich_four_services_v1','1')");
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
