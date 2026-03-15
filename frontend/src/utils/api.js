import axios from 'axios';

const getToken = () => window.localStorage.getItem('bukain_token');

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000'
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

export const login = (email, password) => api.post('/api/auth/login', { email, password }).then((r) => r.data);
export const fetchMe = () => api.get('/api/auth/me').then((r) => r.data.user);
export const fetchRecommendations = (payload) => api.post('/api/recommend', payload).then((r) => r.data);
export const checkoutPackage = (payload) => api.post('/api/checkout', payload).then((r) => r.data);
export const createOrder = (payload) => api.post('/api/orders', payload).then((r) => r.data.order);
export const fetchOrder = (orderId) => api.get(`/api/order/${orderId}`).then((r) => r.data.order);
export const markOrderPaid = (orderId) => api.post(`/api/order/${orderId}/paid`).then((r) => r.data.order);
export const updateOrderStatus = (orderId, status) =>
  api.patch(`/api/orders/${orderId}/status`, { status }).then((r) => r.data);

export const fetchOrdersByCustomer = (customerId) =>
  api.get(`/api/orders/customer/${customerId}`).then((r) => r.data.orders);

export const fetchOrdersByRestaurant = (restaurantId) =>
  api.get(`/api/orders/restaurant/${restaurantId}`).then((r) => r.data.orders);

export const fetchAllOrders = () => api.get('/api/orders').then((r) => r.data.orders);
export const fetchUsers = () => api.get('/api/admin/users').then((r) => r.data.users);
export const fetchRestaurants = () => api.get('/api/restaurants').then((r) => r.data.restaurants);

export const getPaymentStatus = (orderId) => api.get(`/api/payment-status/${orderId}`).then((r) => r.data);
export const getRestaurantRevenue = (restaurantId) => api.get(`/api/admin/revenue/${restaurantId}`).then((r) => r.data);
