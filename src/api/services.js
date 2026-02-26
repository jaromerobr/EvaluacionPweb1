import API from './axiosInstance';

// ──── AUTH ────

export const loginUser = async (username, password) => {
  try {
    const response = await API.post('/auth/login', {
      username,
      password,
      expiresInMins: 30,
    });
    return response.data;
  } catch (error) {
    // Extraer el mensaje real de DummyJSON (ej: "Invalid credentials")
    const msg = error.response?.data?.message || error.message || 'Error de conexión';
    throw new Error(msg);
  }
};

export const getAuthUser = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

// ──── PRODUCTS CRUD ────

export const getProducts = async (limit = 12, skip = 0) => {
  const response = await API.get(`/products?limit=${limit}&skip=${skip}`);
  return response.data; // { products: [], total, skip, limit }
};

export const addProduct = async (product) => {
  const response = await API.post('/products/add', product);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await API.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await API.delete(`/products/${id}`);
  return response.data;
};