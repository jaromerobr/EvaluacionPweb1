import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Card,
  CardContent,
  CardActions,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Logout,
  Add,
  Edit,
  Delete,
  Person,
} from '@mui/icons-material';

import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../api/services';

// ─── estado inicial del formulario de producto ───
const emptyProduct = { title: '', price: '', category: '' };

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ── datos ──
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── diálogos ──
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = crear, obj = editar
  const [formData, setFormData] = useState(emptyProduct);
  const [formErrors, setFormErrors] = useState({});

  const [confirmDelete, setConfirmDelete] = useState(null);

  // ── snackbar ──
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  // ──────────── cargar productos ────────────
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await getProducts(12, 0);
      setProducts(result.products || []);
    } catch {
      showSnack('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user.accessToken) {
      navigate('/login');
      return;
    }
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ──────────── helpers ────────────
  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // ──────────── CRUD handlers ────────────
  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Título obligatorio';
    if (!formData.price || Number(formData.price) <= 0)
      errs.price = 'Precio debe ser mayor a 0';
    if (!formData.category.trim()) errs.category = 'Categoría obligatoria';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyProduct);
    setFormErrors({});
    setOpenForm(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setFormData({
      title: product.title,
      price: String(product.price),
      category: product.category || '',
    });
    setFormErrors({});
    setOpenForm(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      title: formData.title,
      price: parseFloat(formData.price),
      category: formData.category,
    };

    try {
      if (editing) {
        try {
          const updated = await updateProduct(editing.id, payload);
          setProducts((prev) =>
            prev.map((p) => (p.id === editing.id ? { ...p, ...updated } : p))
          );
        } catch {
          // DummyJSON no persiste productos nuevos (id > 194), actualizar localmente
          setProducts((prev) =>
            prev.map((p) => (p.id === editing.id ? { ...p, ...payload } : p))
          );
        }
        showSnack('Producto actualizado correctamente');
      } else {
        const newProduct = await addProduct(payload);
        setProducts((prev) => [newProduct, ...prev]);
        showSnack('Producto agregado correctamente');
      }
      setOpenForm(false);
    } catch {
      showSnack('Error al guardar producto', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(confirmDelete.id);
    } catch {
      // DummyJSON no persiste productos nuevos (id > 194), eliminar localmente
    }
    // Siempre actualizar el state local (DummyJSON es API simulada)
    setProducts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
    showSnack('Producto eliminado');
    setConfirmDelete(null);
  };

  // ──────────── RENDER ────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* AppBar */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Dashboard — Productos
          </Typography>
          <Chip
            avatar={<Avatar src={user.image}>{user.firstName?.[0]}</Avatar>}
            label={`${user.firstName || ''} ${user.lastName || ''}`}
            color="default"
            sx={{ bgcolor: 'rgba(255,255,255,0.85)', mr: 2 }}
          />
          <Tooltip title="Cerrar sesión">
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* ── Info del usuario (datos de localStorage) ── */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Avatar src={user.image} sx={{ width: 64, height: 64 }}>
              <Person fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{user.username} — {user.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Género: {user.gender} | ID: {user.id}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* ── Botón agregar ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Productos
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Nuevo Producto
          </Button>
        </Box>

        {/* ── Lista de productos ── */}
        {loading ? (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {products.map((p) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
                <Card elevation={3} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {p.thumbnail && (
                    <Box
                      component="img"
                      src={p.thumbnail}
                      alt={p.title}
                      sx={{ height: 160, objectFit: 'cover', width: '100%' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {p.title}
                    </Typography>
                    <Chip label={p.category} size="small" sx={{ mb: 1 }} />
                    <Typography variant="h6" color="primary">
                      ${p.price}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Editar">
                      <IconButton color="primary" onClick={() => openEdit(p)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton color="error" onClick={() => setConfirmDelete(p)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* ───── Diálogo Crear / Editar ───── */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={!!formErrors.title}
            helperText={formErrors.title}
            fullWidth
          />
          <TextField
            label="Precio"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            error={!!formErrors.price}
            helperText={formErrors.price}
            fullWidth
          />
          <TextField
            label="Categoría"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            error={!!formErrors.category}
            helperText={formErrors.category}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ───── Diálogo Confirmar Eliminación ───── */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar <strong>{confirmDelete?.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ───── Snackbar (alertas MUI, NO alert nativo) ───── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
