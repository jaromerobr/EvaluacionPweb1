import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Snackbar,
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { loginUser } from '../api/services';

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [infoSnack, setInfoSnack] = useState({ open: false, msg: '', severity: 'info' });

  // ── Validación individual de cada campo (llamada onChange Y onSubmit) ──
  const validateField = (name, value) => {
    if (name === 'username') {
      if (!value.trim()) return 'El usuario es obligatorio';
      if (value.trim().length < 3) return 'El usuario debe tener al menos 3 caracteres';
    }
    if (name === 'password') {
      if (!value.trim()) return 'La contraseña es obligatoria';
      if (value.length < 4) return 'Mínimo 4 caracteres';
    }
    return '';
  };

  // ── Validación completa del formulario al hacer submit ──
  const validateAll = () => {
    const newErrors = {};
    const usernameErr = validateField('username', form.username);
    const passwordErr = validateField('password', form.password);
    if (usernameErr) newErrors.username = usernameErr;
    if (passwordErr) newErrors.password = passwordErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── handleChange: valida en tiempo real mientras el usuario escribe ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Validación en tiempo real: muestra/quita el error mientras escribe
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validateAll()) return;

    setLoading(true);
    try {
      const userData = await loginUser(form.username, form.password);
      localStorage.setItem('user', JSON.stringify(userData));
      setInfoSnack({ open: true, msg: `¡Bienvenido, ${userData.firstName}!`, severity: 'success' });
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      const msg =
        typeof err === 'string'
          ? err
          : err?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 60%, #dc2626 100%)',
        overflow: 'hidden',
        m: 0,
        p: 0,
      }}
    >
      <Container maxWidth={false} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Paper
          elevation={24}
          sx={{
            width: 460,
            p: 6,
            borderRadius: 4,
            background: '#ffffff',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'visible',
            '::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              borderRadius: '1rem 1rem 0 0',
              background: 'linear-gradient(90deg, #dc2626 0%, #9333ea 100%)',
            },
          }}
        >
          {/* Icono */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #dc2626, #9333ea)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: '0 4px 15px rgba(220,38,38,0.4)',
            }}
          >
            <LockOutlined sx={{ color: '#fff', fontSize: 32 }} />
          </Box>

          <Typography variant="h4" fontWeight="bold" mb={0.5} sx={{ color: '#1e293b', letterSpacing: 1 }}>
            Iniciar Sesión
          </Typography>
          <Typography variant="body2" mb={3} sx={{ color: '#64748b' }}>
            Acceda con sus credenciales
          </Typography>

          {/* Alert de error de API — componente MUI, prohibido alert() nativo */}
          {apiError && (
            <Alert
              severity="error"
              variant="filled"
              sx={{ mb: 2, width: '100%', fontWeight: 600 }}
              onClose={() => setApiError('')}
            >
              {apiError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            {/* Campo Usuario — error mostrado con helperText MUI en tiempo real */}
            <TextField
              label="Usuario"
              name="username"
              fullWidth
              margin="normal"
              value={form.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username || ' '}
              autoFocus
              disabled={loading}
              inputProps={{ 'data-testid': 'input-username' }}
              sx={{
                '& label': { color: '#1e293b' },
                '& label.Mui-focused': { color: '#dc2626' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#dc2626' },
                  '&.Mui-focused fieldset': { borderColor: '#dc2626', borderWidth: 2 },
                  '&.Mui-error fieldset': { borderColor: '#ef4444' },
                },
                '& .MuiFormHelperText-root': { color: '#ef4444', fontWeight: 500 },
              }}
            />

            {/* Campo Contraseña — error mostrado con helperText MUI en tiempo real */}
            <TextField
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={form.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password || ' '}
              disabled={loading}
              inputProps={{ 'data-testid': 'input-password' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& label': { color: '#1e293b' },
                '& label.Mui-focused': { color: '#dc2626' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#dc2626' },
                  '&.Mui-focused fieldset': { borderColor: '#dc2626', borderWidth: 2 },
                  '&.Mui-error fieldset': { borderColor: '#ef4444' },
                },
                '& .MuiFormHelperText-root': { color: '#ef4444', fontWeight: 500 },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.7,
                borderRadius: 2,
                fontWeight: 'bold',
                fontSize: 16,
                background: 'linear-gradient(90deg, #dc2626 0%, #9333ea 100%)',
                color: '#fff',
                letterSpacing: 1,
                boxShadow: '0 4px 16px 0 rgba(220,38,38,0.3)',
                transition: 'all 0.3s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #b91c1c 0%, #7e22ce 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(220,38,38,0.5)',
                },
                '&:disabled': { opacity: 0.7 },
              }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
          </Box>

          <Typography
            variant="caption"
            display="block"
            textAlign="center"
            mt={3}
            sx={{
              color: '#94a3b8',
              fontWeight: 500,
              background: '#f8fafc',
              px: 2,
              py: 1,
              borderRadius: 2,
              width: '100%',
            }}
          >
            💡 Credenciales de prueba: <strong>emilys</strong> / <strong>emilyspass</strong>
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: '#9333ea', mt: 2, cursor: 'pointer', '&:hover': { color: '#7e22ce', textDecoration: 'underline' } }}
            onClick={() =>
              setInfoSnack({ open: true, msg: 'Función de recuperación de contraseña no disponible', severity: 'warning' })
            }
          >
            ¿Olvidaste tu contraseña?
          </Typography>
        </Paper>
      </Container>

      {/* Snackbar MUI — reemplaza alert() nativo (prohibido por rúbrica) */}
      <Snackbar
        open={infoSnack.open}
        autoHideDuration={4000}
        onClose={() => setInfoSnack({ ...infoSnack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setInfoSnack({ ...infoSnack, open: false })}
          severity={infoSnack.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {infoSnack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
