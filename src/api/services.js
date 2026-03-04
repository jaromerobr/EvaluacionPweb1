import API from './axiosInstance';

// ──── RECURSO 1: AUTH — Login ────
export const loginUser = async (username, password) => {
  try {
    const response = await API.post('/auth/login', {
      username,
      password,
      expiresInMins: 30,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Error de conexión';
    throw new Error(msg);
  }
};

export const getAuthUser = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

// ──── RECURSO 2: GET /products (Listar) ────
export const getProducts = async (limit = 12, skip = 0) => {
  try {
    const response = await API.get(`/products?limit=${limit}&skip=${skip}`);
    return response.data; // { products: [], total, skip, limit }
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Error al obtener productos';
    throw new Error(msg);
  }
};

// ──── RECURSO 3: POST /products/add (Crear) ────
export const addProduct = async (product) => {
  try {
    const response = await API.post('/products/add', product);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Error al crear producto';
    throw new Error(msg);
  }
};

// ──── RECURSO 4: PUT /products/:id (Actualizar) ────
export const updateProduct = async (id, data) => {
  try {
    const response = await API.put(`/products/${id}`, data);
    return response.data;
  } catch (error) {
    // DummyJSON retorna 404 para productos con id > 194 (no persiste).
    // Retornamos el payload con el id original para actualización local.
    if (error.response?.status === 404) {
      return { ...data, id };
    }
    const msg = error.response?.data?.message || error.message || 'Error al actualizar producto';
    throw new Error(msg);
  }
};

// ──── RECURSO 5: DELETE /products/:id (Eliminar) ────
export const deleteProduct = async (id) => {
  try {
    const response = await API.delete(`/products/${id}`);
    return response.data; // { id, title, isDeleted, deletedOn }
  } catch (error) {
    // DummyJSON retorna 404 para productos con id > 194 (no persiste).
    if (error.response?.status === 404) {
      return { id, isDeleted: true, deletedOn: new Date().toISOString() };
    }
    const msg = error.response?.data?.message || error.message || 'Error al eliminar producto';
    throw new Error(msg);
  }
};