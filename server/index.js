import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { initDb } from './db.js';
import { restaurants } from './data/restaurants.js';
import { generateRecommendations } from './ai.js';
import { createPayment } from './payment.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'bukain-secret';

// File khusus untuk menyimpan riwayat pesanan (orders.json)
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
}

const getOrdersJson = () => JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
const saveOrdersJson = (data) => {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2));
};

const app = express();
app.use(cors());
app.use(express.json());

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization?.split(' ');
  const token = auth?.[0] === 'Bearer' ? auth[1] : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    console.error('Auth token error', err);
    return res.status(401).json({ error: 'Invalid auth token' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

async function start() {
  const store = await initDb(path.join(__dirname, 'data', 'bukain.json'));

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = store.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await store.verifyPassword(user, password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId ?? null
      }
    });
  });

  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existingUser = store.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const newUser = {
      id: `customer-${Date.now()}`,
      name,
      email,
      password,
      role: 'customer'
    };

    if (typeof store.createUser === 'function') {
      await store.createUser(newUser);
    } else {
      // Fallback update to in-memory store and file if createUser method doesn't exist
      try {
        const fs = await import('fs/promises');
        const dbPath = path.join(__dirname, 'data', 'bukain.json');
        const data = JSON.parse(await fs.readFile(dbPath, 'utf8'));
        data.users.push(newUser);
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
        
        const users = store.getUsers();
        users.push(newUser);
      } catch (err) {
        console.error('Failed to create user:', err);
        return res.status(500).json({ error: 'Failed to create user' });
      }
    }

    return res.json({ success: true, message: 'User registered successfully' });
  });

  app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = store.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId ?? null
      }
    });
  });

  app.get('/api/restaurants', (req, res) => {
    const restaurants = store.getRestaurants();
    res.json({ restaurants });
  });

  app.get('/api/orders/customer/:customer_id', authMiddleware, (req, res) => {
    const { customer_id } = req.params;
    const role = req.user.role;

    if (role === 'super_admin' || (role === 'customer' && req.user.id === customer_id)) {
      const orders = store.getOrdersForUser(customer_id);
      return res.json({ orders });
    }

    return res.status(403).json({ error: 'Forbidden' });
  });

  app.get('/api/orders/restaurant/:restaurant_id', authMiddleware, (req, res) => {
    const { restaurant_id } = req.params;
    const role = req.user.role;

    if (role === 'super_admin') {
      const orders = store.getOrdersForRestaurant(restaurant_id);
      return res.json({ orders });
    }

    if (role === 'restaurant') {
      const user = store.getUserById(req.user.id);
      if (user.restaurantId === restaurant_id) {
        const orders = store.getOrdersForRestaurant(restaurant_id);
        return res.json({ orders });
      }
    }

    return res.status(403).json({ error: 'Forbidden' });
  });

  app.post('/api/recommend', async (req, res) => {
    const { budget, people, preferences } = req.body;
    if (!budget || !people || !Array.isArray(preferences)) {
      return res.status(400).json({ error: 'budget, people, and preferences are required' });
    }

    try {
      const response = await generateRecommendations({ budget, people, preferences, restaurants });
      return res.json(response);
    } catch (error) {
      console.error('recommendation error', error);
      return res.status(500).json({ error: 'Unable to generate recommendations' });
    }
  });

  app.post('/api/checkout', authMiddleware, async (req, res) => {
    const { packageId, restaurantId, price, name } = req.body;

    console.log('[Checkout API] Received checkout request:', req.body);

    if (!packageId || !restaurantId || !price) {
      return res.status(400).json({ error: 'Missing packageId, restaurantId, or price' });
    }

    try {
      const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      const newOrder = {
        orderId,
        packageId,
        restaurantId,
        userId: req.user.id || 'dummy_user',
        price: Number(price),
        status: 'PENDING',
        paymentUrl: null,
        createdAt: new Date().toISOString()
      };

      // Get user details for payment
      const user = store.getUserById(req.user.id);
      const customerName = user ? user.name : 'Guest Customer';
      const customerEmail = user ? user.email : 'guest@bukain.app';
      const customerMobile = '08123456789'; // Provide default if not available in user model

      const paymentPayload = {
        name: customerName,
        email: customerEmail,
        mobile: customerMobile,
        reference_id: orderId,
        description: "Order from Bukain App",
        items: [{
          name: name,
          description: `Menu ${name}`,
          quantity: 1,
          rate: Number(price)
        }]
      };

      console.log('[Checkout API] Prepared MCP Payload:', JSON.stringify(paymentPayload, null, 2));

      // securely call the payment logic in backend
      const paymentResult = await createPayment(paymentPayload);

      if (paymentResult.success && paymentResult.url) {
        newOrder.paymentUrl = paymentResult.url;
        
        // Save order to orders.json
        const orders = getOrdersJson();
        orders.push(newOrder);
        saveOrdersJson(orders);
        
        return res.json({ orderId, paymentUrl: paymentResult.url });
      } else {
        console.error('[Checkout API] Payment creation failed:', paymentResult.error);
        return res.status(500).json({ error: 'Failed to generate payment link via MCP', details: paymentResult.error });
      }
    } catch (error) {
      console.error('Checkout Endpoint Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/payment-status/:orderId', (req, res) => {
    const orders = getOrdersJson();
    const order = orders.find((o) => o.orderId === req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ status: order.status });
  });

  app.get('/api/admin/revenue/:restaurantId', (req, res) => {
    const orders = getOrdersJson();
    const restOrders = orders.filter((o) => o.restaurantId === req.params.restaurantId);
    const paidOrders = restOrders.filter((o) => o.status === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.price, 0);

    res.json({
      restaurantId: req.params.restaurantId,
      totalOrders: restOrders.length,
      paidOrders: paidOrders.length,
      totalRevenue
    });
  });

  const createOrderHandler = async (req, res) => {
    const {
      customer_id,
      restaurant_id,
      package_name,
      pickup_time,
      total_price,
      packageName,
      restaurantId,
      pickupTime,
      price,
      customerName,
      restaurantName,
      restaurant_name
    } = req.body;

    // Normalize fields for backward compatibility
    const customerId = customer_id || req.user?.id || null;
    let restaurantIdFinal = restaurant_id || restaurantId;
    const packageNameFinal = package_name || packageName;
    const pickupTimeFinal = pickup_time || pickupTime;
    const priceFinal = total_price ?? price;
    const restaurantNameFinal = restaurantName || restaurant_name;

    // Try to resolve restaurantId from restaurantName if not provided
    if (!restaurantIdFinal && restaurantNameFinal) {
      const restaurantMatch = store
        .getRestaurants()
        .find((r) => r.name.toLowerCase() === String(restaurantNameFinal).toLowerCase());
      if (restaurantMatch) {
        restaurantIdFinal = restaurantMatch.id;
      }
    }

    if (!restaurantIdFinal || !packageNameFinal || !customerId || !pickupTimeFinal || !priceFinal) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const customer = store.getUserById(customerId);
    if (!customer) {
      return res.status(400).json({ error: 'Invalid customer' });
    }

    const restaurant = store.getRestaurantById(restaurantIdFinal);
    if (!restaurant) {
      return res.status(400).json({ error: 'Invalid restaurant' });
    }

    const customerNameFinal = customerName || customer.name;

    const order = await store.createOrder({
      customerId,
      restaurantId: restaurantIdFinal,
      packageName: packageNameFinal,
      price: priceFinal,
      pickupTime: pickupTimeFinal,
      customerName: customerNameFinal,
      restaurantName: restaurant.name,
      status: 'pending'
    });

    console.log('Order created:', {
      id: order.id,
      order_code: order.order_code,
      restaurant_id: order.restaurant_id,
      customer_id: order.customer_id,
      status: order.status
    });

    return res.json({ order });
  };

  app.post('/api/orders', authMiddleware, createOrderHandler);
  app.post('/api/order', authMiddleware, createOrderHandler);

  app.post('/api/order/:id/paid', async (req, res) => {
    const order = await store.markPaid(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order });
  });

  app.get('/api/my-orders', authMiddleware, (req, res) => {
    const role = req.user.role;

    if (role === 'customer') {
      const orders = store.getOrdersForUser(req.user.id);
      return res.json({ orders });
    }

    if (role === 'restaurant') {
      const user = store.getUserById(req.user.id);
      const orders = store.getOrdersForRestaurant(user.restaurantId);
      return res.json({ orders });
    }

    // super admin
    const orders = store.getOrders();
    return res.json({ orders });
  });

  app.get('/api/orders', authMiddleware, (req, res) => {
    const { customer_id, restaurant_id } = req.query;
    const role = req.user.role;

    // Give super admins full access
    if (role === 'super_admin') {
      const orders = store.getOrders();
      console.log('Super admin fetched all orders:', { count: orders.length, requestedBy: req.user.id });
      return res.json({ orders });
    }

    // Restaurant admin can query only their own restaurant orders
    if (role === 'restaurant') {
      const user = store.getUserById(req.user.id);
      const allowedRestaurantId = user.restaurantId;
      if (restaurant_id && restaurant_id !== allowedRestaurantId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const orders = store.getOrdersForRestaurant(allowedRestaurantId);
      console.log('Restaurant admin fetched orders:', { restaurant_id: allowedRestaurantId, count: orders.length, requestedBy: req.user.id });
      return res.json({ orders });
    }

    // Normal users can query only their own orders
    if (role === 'customer') {
      const allowedCustomerId = req.user.id;
      if (customer_id && customer_id !== allowedCustomerId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const orders = store.getOrdersForUser(allowedCustomerId);
      console.log('User fetched their orders:', { customer_id: allowedCustomerId, count: orders.length });
      return res.json({ orders });
    }

    return res.status(403).json({ error: 'Forbidden' });
  });

  app.get('/api/admin/users', authMiddleware, requireRole(['super_admin']), (req, res) => {
    const users = store.getUsers().map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      restaurantId: u.restaurantId ?? null
    }));
    return res.json({ users });
  });

  app.get('/api/admin/restaurants', authMiddleware, requireRole(['super_admin']), (req, res) => {
    const restaurants = store.getRestaurants();
    return res.json({ restaurants });
  });

  app.patch('/api/admin/restaurants/:id', authMiddleware, requireRole(['super_admin']), async (req, res) => {
    const { active } = req.body;
    const restaurant = await store.updateRestaurant(req.params.id, { active });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    return res.json({ restaurant });
  });

  app.get('/api/order/:id', authMiddleware, (req, res) => {
    const order = store.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const user = store.getUserById(req.user.id);
    const role = req.user.role;

    const canView =
      role === 'super_admin' ||
      (role === 'customer' && order.customerId === user.id) ||
      (role === 'restaurant' && order.restaurantId === user.restaurantId);

    if (!canView) return res.status(403).json({ error: 'Forbidden' });

    return res.json({ order });
  });

  // Legacy support: keep this POST endpoint for older clients
  app.post('/api/order/:id/status', authMiddleware, requireRole(['restaurant_admin', 'super_admin']), async (req, res) => {
    return updateStatusHandler(req, res);
  });

  // Preferred endpoint for status updates
  app.patch('/api/orders/:id/status', authMiddleware, requireRole(['restaurant', 'super_admin']), async (req, res) => {
    return updateStatusHandler(req, res);
  });

  async function updateStatusHandler(req, res) {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const allowed = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
    }

    const order = store.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // restaurant admins can only update their own orders
    if (req.user.role === 'restaurant') {
      const user = store.getUserById(req.user.id);
      if (order.restaurantId !== user.restaurantId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const updated = await store.updateStatus(req.params.id, status);
    return res.json({ order: updated });
  }

  app.listen(PORT, () => {
    console.log(`Bukain API running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
