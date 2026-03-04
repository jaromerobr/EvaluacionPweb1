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
  Divider,
} from '@mui/material';
import {
  Logout,
  Add,
  Edit,
  Delete,
  Person,
  ShoppingBag,
  Category,
  AttachMoney,
  Refresh,
} from '@mui/icons-material';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../api/services';

// ─── estado inicial vacío para formulario ───
const emptyProduct = { title: '', price: '', category: '' };

export default function Dashboard() {
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  // ── datos de productos ──
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── formulario diálogo crear/editar ──
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // ── diálogo confirmar eliminación ──
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── snackbar (MUI — NO alert nativo, prohibido por rúbrica) ──
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  // ──────────── Helpers ────────────
  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // ──────────── Recurso 1: GET /products (Listar) ────────────
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await getProducts(12, 0);
      setProducts(result.products || []);
      showSnack(`${result.products?.length || 0} productos cargados desde la API`, 'info');
    } catch (err) {
      showSnack('Error al cargar productos: ' + (err.message || 'Sin conexión'), 'error');
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

  // ──────────── Validación en tiempo real del formulario CRUD ────────────
  const validateField = (name, value) => {
    if (name === 'title') {
      if (!value.trim()) return 'El título es obligatorio';
      if (value.trim().length < 3) return 'Mínimo 3 caracteres';
    }
    if (name === 'price') {
      if (!value) return 'El precio es obligatorio';
      if (isNaN(Number(value)) || Number(value) <= 0) return 'Precio debe ser mayor a 0';
    }
    if (name === 'category') {
      if (!value.trim()) return 'La categoría es obligatoria';
    }
    return '';
  };

  const validateAll = () => {
    const errs = {};
    ['title', 'price', 'category'].forEach((field) => {
      const msg = validateField(field, formData[field]);
      if (msg) errs[field] = msg;
    });
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Validación en tiempo real mientras escribe
    const errorMsg = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // ──────────── Abrir formulario ────────────
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

  // ──────────── Recurso 2: POST /products/add (Crear) ────────────
  // ──────────── Recurso 3: PUT /products/:id  (Actualizar) ────────────
  const handleSave = async () => {
    if (!validateAll()) return;

    const payload = {
      title: formData.title.trim(),
      price: parseFloat(formData.price),
      category: formData.category.trim(),
    };

    setSaving(true);
    try {
      if (editing) {
        // PUT — Actualizar producto existente
        const updated = await updateProduct(editing.id, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...updated } : p))
        );
        showSnack(`✏️ Producto "${updated.title || payload.title}" actualizado (PUT /products/${editing.id})`, 'success');
      } else {
        // POST — Crear nuevo producto
        const newProduct = await addProduct(payload);
        setProducts((prev) => [newProduct, ...prev]);
        showSnack(`✅ Producto "${newProduct.title}" creado (POST /products/add) — ID: ${newProduct.id}`, 'success');
      }
      setOpenForm(false);
    } catch (err) {
      // DummyJSON no persiste productos nuevos (id > 194), guardar localmente igual
      if (editing) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...payload } : p))
        );
        showSnack(`✏️ Producto actualizado localmente`, 'warning');
      } else {
        showSnack('❌ Error al guardar producto: ' + (err.message || 'Error desconocido'), 'error');
      }
      setOpenForm(false);
    } finally {
      setSaving(false);
    }
  };

  // ──────────── Recurso 4: DELETE /products/:id (Eliminar) ────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteProduct(confirmDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      showSnack(
        `🗑️ Producto "${confirmDelete.title}" eliminado (DELETE /products/${confirmDelete.id}) — isDeleted: ${result.isDeleted}`,
        'success'
      );
    } catch (err) {
      // DummyJSON no persiste productos nuevos, eliminar localmente de igual modo
      setProducts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      showSnack(`🗑️ Producto "${confirmDelete.title}" eliminado localmente`, 'warning');
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  // ──────────── RENDER ────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      {/* AppBar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)',
          borderBottom: '3px solid #dc2626',
        }}
      >
        <Toolbar>
          <ShoppingBag sx={{ mr: 1, color: '#dc2626' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}>
            Dashboard — Gestión de Productos
          </Typography>
          <Chip
            avatar={<Avatar src={user.image}>{user.firstName?.[0]}</Avatar>}
            label={`${user.firstName || ''} ${user.lastName || ''}`}
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', mr: 2, fontWeight: 600 }}
          />
          <Tooltip title="Cerrar sesión">
            <IconButton color="inherit" onClick={handleLogout} id="btn-logout">
              <Logout />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* ── Info del usuario (datos de localStorage) ── */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: '#fff',
          }}
        >
          <Typography variant="overline" sx={{ color: '#94a3b8', letterSpacing: 2 }}>
            Sesión activa — datos guardados en localStorage
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
            <Avatar
              src={user.image}
              sx={{ width: 72, height: 72, border: '3px solid #dc2626' }}
            >
              <Person fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                👤 @{user.username} &nbsp;|&nbsp; 📧 {user.email}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                🪪 ID: {user.id} &nbsp;|&nbsp; ⚥ Género: {user.gender} &nbsp;|&nbsp; 📱 {user.phone}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={`Token: ${user.accessToken ? user.accessToken.substring(0, 30) + '...' : 'N/A'}`}
                  size="small"
                  sx={{ bgcolor: 'rgba(220,38,38,0.3)', color: '#fca5a5', fontSize: 10, fontFamily: 'monospace' }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* ── Encabezado de sección Productos ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="#1e293b">
              📦 Productos (CRUD completo)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              API: https://dummyjson.com — GET · POST · PUT · DELETE
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Recargar productos (GET /products)">
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchProducts}
                disabled={loading}
                id="btn-refresh"
                sx={{ borderColor: '#334155', color: '#334155' }}
              >
                Recargar
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreate}
              id="btn-new-product"
              sx={{
                background: 'linear-gradient(90deg, #dc2626, #9333ea)',
                fontWeight: 'bold',
                '&:hover': { background: 'linear-gradient(90deg, #b91c1c, #7e22ce)' },
              }}
            >
              Nuevo Producto
            </Button>
          </Box>
        </Box>

        {/* ── Lista de productos ── */}
        {loading ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <CircularProgress size={56} sx={{ color: '#dc2626' }} />
            <Typography mt={2} color="text.secondary">
              Cargando productos desde la API...
            </Typography>
          </Box>
        ) : products.length === 0 ? (
          <Alert severity="info" sx={{ mt: 3 }}>
            No hay productos disponibles. Cree uno nuevo usando el botón &quot;Nuevo Producto&quot;.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {products.map((p) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  {p.thumbnail && (
                    <Box
                      component="img"
                      src={p.thumbnail}
                      alt={p.title}
                      sx={{ height: 160, objectFit: 'cover', width: '100%', borderRadius: '12px 12px 0 0' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                      ID: {p.id}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
                      {p.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Category fontSize="small" sx={{ color: '#9333ea' }} />
                      <Chip label={p.category} size="small" sx={{ bgcolor: '#f3e8ff', color: '#7e22ce' }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AttachMoney sx={{ color: '#dc2626' }} />
                      <Typography variant="h6" color="error" fontWeight="bold">
                        {Number(p.price).toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: 'flex-end', p: 1.5 }}>
                    <Tooltip title={`Editar (PUT /products/${p.id})`}>
                      <IconButton
                        color="primary"
                        onClick={() => openEdit(p)}
                        id={`btn-edit-${p.id}`}
                        sx={{ '&:hover': { bgcolor: '#dbeafe' } }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={`Eliminar (DELETE /products/${p.id})`}>
                      <IconButton
                        color="error"
                        onClick={() => setConfirmDelete(p)}
                        id={`btn-delete-${p.id}`}
                        sx={{ '&:hover': { bgcolor: '#fef2f2' } }}
                      >
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
      <Dialog open={openForm} onClose={() => !saving && setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            background: 'linear-gradient(90deg, #1e293b, #334155)',
            color: '#fff',
            fontWeight: 'bold',
          }}
        >
          {editing
            ? `✏️ Editar Producto — PUT /products/${editing?.id}`
            : '➕ Nuevo Producto — POST /products/add'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '24px !important' }}>
          {/* Alert explicativo del formulario */}
          <Alert severity={editing ? 'info' : 'success'} variant="outlined">
            {editing
              ? 'Modifique los campos y presione Actualizar para llamar PUT a la API.'
              : 'Complete todos los campos requeridos para crear un nuevo producto vía POST.'}
          </Alert>

          {/* Título — validación en tiempo real */}
          <TextField
            label="Título del Producto *"
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            error={!!formErrors.title}
            helperText={formErrors.title || ' '}
            fullWidth
            disabled={saving}
            inputProps={{ 'data-testid': 'form-title' }}
          />

          {/* Precio — validación en tiempo real */}
          <TextField
            label="Precio *"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleFormChange}
            error={!!formErrors.price}
            helperText={formErrors.price || ' '}
            fullWidth
            disabled={saving}
            inputProps={{ min: 0, step: '0.01', 'data-testid': 'form-price' }}
            InputProps={{
              startAdornment: (
                <Box component="span" sx={{ mr: 1, color: '#64748b' }}>$</Box>
              ),
            }}
          />

          {/* Categoría — validación en tiempo real */}
          <TextField
            label="Categoría *"
            name="category"
            value={formData.category}
            onChange={handleFormChange}
            error={!!formErrors.category}
            helperText={formErrors.category || ' '}
            fullWidth
            disabled={saving}
            inputProps={{ 'data-testid': 'form-category' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setOpenForm(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              background: editing
                ? 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                : 'linear-gradient(90deg, #16a34a, #15803d)',
              fontWeight: 'bold',
            }}
          >
            {saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : editing ? (
              'Actualizar'
            ) : (
              'Crear Producto'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ───── Diálogo Confirmar Eliminación ───── */}
      <Dialog open={!!confirmDelete} onClose={() => !deleting && setConfirmDelete(null)}>
        <DialogTitle sx={{ color: '#dc2626', fontWeight: 'bold' }}>
          🗑️ Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción llamará a <strong>DELETE /products/{confirmDelete?.id}</strong> en la API.
          </Alert>
          <Typography>
            ¿Está seguro que desea eliminar <strong>&quot;{confirmDelete?.title}&quot;</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            id="btn-confirm-delete"
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ───── Snackbar MUI (NO alert nativo — prohibido por rúbrica) ───── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
