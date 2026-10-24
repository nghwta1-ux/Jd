import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Database file setup
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'ramz_database.json');

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
}

const defaultGhamsProducts: Product[] = [
  {
    id: 'prod_ghams_1',
    name: 'إنشاء تقديمة احترافية',
    description: 'تصميم وتطوير مقدمة مرئية أو عروض تقديمية تفاعلية جذابة للأنشطة والعلامات التجارية.',
    price: 12.00,
    category: 'الوسائط المرئية',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_ghams_2',
    name: 'إنشاء فيديو سينمائي',
    description: 'إنتاج وتعديل مقاطع فيديو سينمائية احترافية عالية الجودة للإعلانات والترويج.',
    price: 15.00,
    category: 'الوسائط المرئية',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_ghams_3',
    name: 'إنشاء موقع إلكتروني',
    description: 'بناء وتطوير موقع إلكتروني متكامل، سريع، ومتجاوب مع جميع الأجهزة والمنصات.',
    price: 15.50,
    category: 'تطوير الويب',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_ghams_4',
    name: 'إنشاء منيو إلكتروني',
    description: 'تصميم منيو إلكتروني تفاعلي وحديث للمطاعم والمقاهي مع سهولة التصفح والطلب.',
    price: 10.00,
    category: 'الحلول الرقمية',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_ghams_5',
    name: 'إنشاء بطايق رقمية',
    description: 'تصميم بطاقات تعريفية رقمية ذكية (Digital Business Cards) قابلة للمشاركة الفورية.',
    price: 8.50,
    category: 'الحلول الرقمية',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_ghams_6',
    name: 'إنشاء رموز QR ذكية',
    description: 'توليد وإدارة رموز الاستجابة السريع QR المخصصة للروابط، القوائم، ومنصات التواصل.',
    price: 5.00,
    category: 'الحلول الرقمية',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      products: defaultGhamsProducts,
      orders: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    let prods = Array.isArray(parsed.products) ? parsed.products : [];
    
    // If products list is empty, or only contains old sample services, ensure we have the 6 ghams products
    if (prods.length === 0 || !prods.some((p: Product) => p.id && p.id.startsWith('prod_ghams_'))) {
      prods = defaultGhamsProducts;
    } else {
      // Ensure all 6 ghams products exist
      const existingIds = new Set(prods.map((p: Product) => p.id));
      for (const defP of defaultGhamsProducts) {
        if (!existingIds.has(defP.id)) {
          prods.push(defP);
        }
      }
    }

    const dbData: DatabaseSchema = {
      products: prods,
      orders: Array.isArray(parsed.orders) ? parsed.orders : []
    };
    // Save back to ensure persistence
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
    return dbData;
  } catch (err) {
    console.error('Failed to read database file, reinitializing', err);
    const initialData: DatabaseSchema = { products: defaultGhamsProducts, orders: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveDatabase(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database', err);
  }
}

// In-memory reference synced to disk
let db: DatabaseSchema = initDatabase();

// Server-Sent Events subscribers for instant live order updates
const sseClients: Array<(data: any) => void> = [];

function broadcastSSE(event: string, payload: any) {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const send of sseClients) {
    try {
      send(message);
    } catch {
      // ignore dropped client
    }
  }
}

// SSE endpoint for Admin live updates
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write('\n');

  const send = (msg: string) => res.write(msg);
  sseClients.push(send);

  req.on('close', () => {
    const idx = sseClients.indexOf(send);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Products API
app.get('/api/products', (req, res) => {
  const uniqueMap = new Map<string, Product>();
  for (const p of db.products) {
    if (p && p.id && !uniqueMap.has(p.id)) {
      uniqueMap.set(p.id, p);
    }
  }
  const cleanProducts = Array.from(uniqueMap.values());
  if (cleanProducts.length !== db.products.length) {
    db.products = cleanProducts;
    saveDatabase(db);
  }
  res.json({ success: true, products: cleanProducts });
});

app.post('/api/products', (req, res) => {
  const { name, description, price, category } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'اسم المنتج مطلوب' });
  }

  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice < 1 || numPrice > 15.50) {
    return res.status(400).json({ success: false, error: 'يجب أن يكون السعر بين 1 و 15.50 ر.س' });
  }

  const newProduct: Product = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    description: (description || '').trim(),
    price: numPrice,
    category: category ? String(category).trim() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.products.unshift(newProduct);
  saveDatabase(db);
  broadcastSSE('product_created', newProduct);

  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, category } = req.body;

  const productIndex = db.products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
  }

  if (name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'اسم المنتج مطلوب' });
    }
    db.products[productIndex].name = name.trim();
  }

  if (description !== undefined) {
    db.products[productIndex].description = (description || '').trim();
  }

  if (category !== undefined) {
    db.products[productIndex].category = category ? String(category).trim() : undefined;
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 1 || numPrice > 15.50) {
      return res.status(400).json({ success: false, error: 'يجب أن يكون السعر بين 1 و 15.50 ر.س' });
    }
    db.products[productIndex].price = numPrice;
  }

  db.products[productIndex].updatedAt = new Date().toISOString();
  saveDatabase(db);
  broadcastSSE('product_updated', db.products[productIndex]);

  res.json({ success: true, product: db.products[productIndex] });
});

// Robust Sync endpoint to ensure data persistence across container redeploys or restarts
app.post('/api/sync', (req, res) => {
  const { products: syncProds, orders: syncOrds } = req.body;
  let changed = false;

  if (Array.isArray(syncProds) && syncProds.length > 0) {
    const existingIds = new Set(db.products.map(p => p.id));
    for (const p of syncProds) {
      if (p && p.id && !existingIds.has(p.id)) {
        db.products.push(p);
        existingIds.add(p.id);
        changed = true;
      }
    }
  }

  if (Array.isArray(syncOrds) && syncOrds.length > 0) {
    const existingOrderIds = new Set(db.orders.map(o => o.id));
    for (const o of syncOrds) {
      if (o && o.id && !existingOrderIds.has(o.id)) {
        db.orders.push(o);
        existingOrderIds.add(o.id);
        changed = true;
      }
    }
  }

  if (changed) {
    saveDatabase(db);
    broadcastSSE('products_reloaded', db.products);
  }

  res.json({
    success: true,
    products: db.products,
    orders: db.orders
  });
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const productIndex = db.products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
  }

  const [removed] = db.products.splice(productIndex, 1);
  saveDatabase(db);
  broadcastSSE('product_deleted', { id });

  res.json({ success: true, product: removed });
});

// Optional sample services for admin to seed initial recommended services if desired
app.post('/api/products/seed-samples', (req, res) => {
  const sampleServices: Product[] = [
    {
      id: `prod_${Date.now()}_1`,
      name: 'برمجة وتطوير المواقع المخصصة',
      description: 'بناء مواقع وتطبيقات ويب سريعة وحديثة بأحدث التقنيات مع تجربة مستخدم استثنائية وأداء متفوق.',
      price: 15.50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `prod_${Date.now()}_2`,
      name: 'تطوير الأنظمة ولوحات التحكم السحابية',
      description: 'تصميم وبرمجة أنظمة إدارة العمليات مع صلاحيات المستخدمين وأتمتة المهام.',
      price: 14.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `prod_${Date.now()}_3`,
      name: 'خدمات وهندسة قواعد البيانات',
      description: 'تصميم وهيكلة قواعد بيانات سحابية، تحسين سرعة الاستعلامات، والنسخ الاحتياطي والأمان.',
      price: 12.50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `prod_${Date.now()}_4`,
      name: 'البرمجة الخاصة وتكامل واجهات الربط (API)',
      description: 'تطوير حلول برمجية مخصصة، ربط بوابات الدفع الإلكترونية، وبناء واجهات برمجية متطورة.',
      price: 10.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  db.products = [...sampleServices, ...db.products];
  saveDatabase(db);
  broadcastSSE('products_reloaded', db.products);

  res.json({ success: true, count: sampleServices.length, products: db.products });
});

// Orders API
app.get('/api/orders', (req, res) => {
  const uniqueMap = new Map<string, Order>();
  for (const o of db.orders) {
    if (o && o.id && !uniqueMap.has(o.id)) {
      uniqueMap.set(o.id, o);
    }
  }
  const cleanOrders = Array.from(uniqueMap.values());
  if (cleanOrders.length !== db.orders.length) {
    db.orders = cleanOrders;
    saveDatabase(db);
  }
  // Sort descending by creation date
  const sortedOrders = cleanOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, orders: sortedOrders });
});

app.post('/api/orders', (req, res) => {
  const { customerName, phone, email, notes, items } = req.body;

  if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
    return res.status(400).json({ success: false, error: 'اسم العميل مطلوب' });
  }

  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return res.status(400).json({ success: false, error: 'رقم الجوال مطلوب' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'السلة فارغة. يرجى إضافة خدمة واحدة على الأقل' });
  }

  // Calculate total
  let total = 0;
  const sanitizedItems: OrderItem[] = [];

  for (const item of items) {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const itemPrice = Number(item.price) || 0;
    total += itemPrice * qty;
    sanitizedItems.push({
      productId: item.productId || item.id || '',
      name: item.name || 'خدمة برمجية',
      price: itemPrice,
      quantity: qty
    });
  }

  const orderCounter = db.orders.length + 1001;
  const orderNumber = `RAMZ-${orderCounter}`;

  const newOrder: Order = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    orderNumber,
    customerName: customerName.trim(),
    phone: phone.trim(),
    email: (email || '').trim(),
    notes: (notes || '').trim(),
    items: sanitizedItems,
    total,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder);
  saveDatabase(db);

  // Broadcast to all active admin panels in real time!
  broadcastSSE('new_order', newOrder);

  res.status(201).json({ success: true, order: newOrder });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses: OrderStatus[] = ['new', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'حالة الطلب غير صالحة' });
  }

  const orderIndex = db.orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
  }

  db.orders[orderIndex].status = status;
  db.orders[orderIndex].updatedAt = new Date().toISOString();
  saveDatabase(db);

  broadcastSSE('order_updated', db.orders[orderIndex]);

  res.json({ success: true, order: db.orders[orderIndex] });
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const orderIndex = db.orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
  }

  const [removed] = db.orders.splice(orderIndex, 1);
  saveDatabase(db);
  broadcastSSE('order_deleted', { id });

  res.json({ success: true, order: removed });
});

// System info / Database connection details for transparency
app.get('/api/system/info', (req, res) => {
  res.json({
    success: true,
    platform: 'RAMZ Core Fullstack Engine',
    database: {
      type: 'Persistent File-Backed JSON Store (Disk Synchronized)',
      location: DB_FILE,
      status: 'متصل ويعمل بكفاءة بين جميع الأجهزة (Cloud / Local Synchronized)',
      productsCount: db.products.length,
      ordersCount: db.orders.length,
      externalCost: 0,
      notes: 'يعمل التخزين بشكل مشترك فوري بين كافة المتصفحات والأجهزة دون أي اشتراك أو تكاليف إضافية.'
    }
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Vite middleware for development
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RAMZ Server] Running on http://0.0.0.0:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer().catch(err => {
  console.error('[RAMZ Server] Failed to start:', err);
  process.exit(1);
});
