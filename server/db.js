import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { restaurants as defaultRestaurants } from './data/restaurants.js';
import fs from 'fs';

const DEFAULT_USERS = [
  {
    id: 'u-superadmin',
    name: 'Super Admin',
    email: 'admin@bukain.id',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'super_admin'
  },
  {
    id: 'warung-barokah',
    name: 'Warung Barokah',
    email: 'warung-barokah@bukain.id',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'restaurant',
    restaurantId: 'warung-barokah'
  },
  {
    id: 'ayam-geprek-mantap',
    name: 'Ayam Geprek Mantap',
    email: 'ayam-geprek-mantap@bukain.id',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'restaurant',
    restaurantId: 'ayam-geprek-mantap'
  },
  {
    id: 'kedai-ramadan',
    name: 'Kedai Ramadan',
    email: 'kedai-ramadan@bukain.id',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'restaurant',
    restaurantId: 'kedai-ramadan'
  },
  {
    id: 'sate-madura-cak-hadi',
    name: 'Sate Madura Cak Hadi',
    email: 'sate-madura-cak-hadi@bukain.id',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'restaurant',
    restaurantId: 'sate-madura-cak-hadi'
  },
  {
    id: 'bakso-pak-rudi',
    name: 'Bakso Pak Rudi',
    email: 'bakso-pak-rudi@bukain.id',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'restaurant',
    restaurantId: 'bakso-pak-rudi'
  },
  {
    id: 'martabak-alim',
    name: 'Martabak Alim',
    email: 'martabak-alim@bukain.id',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'restaurant',
    restaurantId: 'martabak-alim'
  },
  {
    id: 'nasi-uduk-bu-siti',
    name: 'Nasi Uduk Bu Siti',
    email: 'nasi-uduk-bu-siti@bukain.id',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'restaurant',
    restaurantId: 'nasi-uduk-bu-siti'
  },
  {
    id: 'gacoan-pedas',
    name: 'Mie Pedas Gacoan',
    email: 'gacoan-pedas@bukain.id',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'restaurant',
    restaurantId: 'gacoan-pedas'
  },
  {
    id: 'ayam-bakar-nusantara',
    name: 'Ayam Bakar Nusantara',
    email: 'ayam-bakar-nusantara@bukain.id',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'restaurant',
    restaurantId: 'ayam-bakar-nusantara'
  },
  {
    id: 'takjil-berkah',
    name: 'Takjil Berkah',
    email: 'takjil-berkah@bukain.id',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'restaurant',
    restaurantId: 'takjil-berkah'
  },
  {
    id: 'u-customer',
    name: 'Customer User',
    email: 'customer@bukain.id',
    passwordHash: bcrypt.hashSync('customer123', 10),
    role: 'customer'
  }
];

const DEFAULT_RESTAURANTS = defaultRestaurants.map((r) => ({
  ...r,
  active: true
}));

export async function initDb(dbPath) {
  console.log('Initializing db at', dbPath);
  const adapter = new JSONFile(dbPath);
  const db = new Low(adapter);
  await db.read();
  console.log('Db read, data:', db.data);
  db.data ||= { orders: [], users: [], restaurants: [] };
  console.log('Db data set to:', db.data);

  if (!Array.isArray(db.data.users) || db.data.users.length === 0) {
    db.data.users = [...DEFAULT_USERS];
    await save();
  }

  if (!Array.isArray(db.data.restaurants) || db.data.restaurants.length === 0) {
    db.data.restaurants = [...DEFAULT_RESTAURANTS];
    await save();
  } else {
    // Ensure all default restaurants exist (merge rather than overwrite)
    const existingById = new Map(db.data.restaurants.map((r) => [r.id, r]));
    DEFAULT_RESTAURANTS.forEach((rest) => {
      if (!existingById.has(rest.id)) {
        db.data.restaurants.push(rest);
        save();
      }
    });
  }

  // Ensure restaurant admins point to an existing restaurant
  const restaurantIds = new Set(db.data.restaurants.map((r) => r.id));
  db.data.users = db.data.users.map((user) => {
    if (user.role === 'restaurant_admin' && !restaurantIds.has(user.restaurantId)) {
      const fallback = db.data.restaurants[0];
      return { ...user, restaurantId: fallback?.id ?? null };
    }
    return user;
  });

  const save = async () => {
    console.log('Saving db to', dbPath);
    try {
      await db.write();
      console.log('Db saved successfully');
    } catch (error) {
      console.error('Error saving db:', error);
    }
  };

  const getUsers = () => {
    return [...db.data.users];
  };

  const getUserById = (id) => {
    return db.data.users.find((user) => user.id === id) ?? null;
  };

  const getUserByEmail = (email) => {
    return db.data.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  };

  const createUser = async ({ name, email, password, role = 'user', restaurantId = null }) => {
    const existing = getUserByEmail(email);
    if (existing) return null;
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = { id, name, email, passwordHash, role, restaurantId };
    db.data.users.push(user);
    await save();
    return user;
  };

  const verifyPassword = async (user, password) => {
    if (!user) return false;
    return bcrypt.compare(password, user.passwordHash);
  };

  const getRestaurants = () => {
    return [...db.data.restaurants];
  };

  const getRestaurantById = (id) => {
    return db.data.restaurants.find((r) => r.id === id) ?? null;
  };

  const updateRestaurant = async (id, updates) => {
    const restaurant = db.data.restaurants.find((r) => r.id === id);
    if (!restaurant) return null;
    Object.assign(restaurant, updates);
    await save();
    return restaurant;
  };

  const getOrders = () => {
    return [...db.data.orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  };

  const getOrdersForUser = (userId) => {
    return getOrders().filter((order) => order.customerId === userId);
  };

  const getOrdersForRestaurant = (restaurantId) => {
    return getOrders().filter((order) => order.restaurantId === restaurantId);
  };

  const getOrder = (id) => {
    return db.data.orders.find((order) => order.id === id) ?? null;
  };

  const createOrder = async (order) => {
    const id = randomUUID();
    const code = order.code || `BK${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const record = {
      id,
      code,
      order_code: code,
      packageId: order.packageId ?? null,
      package_name: order.packageName,
      packageName: order.packageName,
      items: order.items ?? [],
      price: order.price,
      total_price: order.price,
      restaurantId: order.restaurantId,
      restaurant_id: order.restaurantId,
      restaurantName: order.restaurantName,
      customerId: order.customerId ?? null,
      customer_id: order.customerId ?? null,
      customerName: order.customerName,
      phone: order.phone,
      pickupTime: order.pickupTime,
      pickup_time: order.pickupTime,
      notes: order.notes ?? '',
      status: order.status ?? 'pending',
      createdAt: now,
      created_at: now,
      updatedAt: now
    };

    db.data.orders.push(record);
    await save();
    return record;
  };

  const updateStatus = async (id, status) => {
    const order = db.data.orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    await save();
    return order;
  };

  const markPaid = async (id) => updateStatus(id, 'paid');

  // Force write at the end
  await save();
  // Manual write to ensure
  fs.writeFileSync(dbPath, JSON.stringify(db.data, null, 2));

  return {
    getUsers,
    getUserById,
    getUserByEmail,
    createUser,
    verifyPassword,
    getRestaurants,
    getRestaurantById,
    getOrders,
    getOrdersForUser,
    getOrdersForRestaurant,
    getOrder,
    createOrder,
    markPaid,
    updateStatus,
    updateRestaurant
  };
}
