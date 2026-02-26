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
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { loginUser } from '../api/services';


export default function Login() {
  const navigate = useNavigate();


  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Snackbar informativo (reemplaza alert() nativo)
  const [infoSnack, setInfoSnack] = useState({ open: false, msg: '', severity: 'info' });


  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'El usuario es obligatorio';
    if (!form.password.trim()) newErrors.password = 'La contraseña es obligatoria';
    else if (form.password.length < 4)
      newErrors.password = 'Mínimo 4 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const userData = await loginUser(form.username, form.password);
      // Guardar datos completos del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/dashboard');
    } catch (err) {
      const msg =
        typeof err === 'string'
          ? err
          : err?.message || 'Error al iniciar sesión. Intente de nuevo.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
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
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
        m: 0,
        p: 0,
      }}
    >
      <Container maxWidth={false} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Paper
          elevation={12}
          sx={{
            width: 440,
            p: 6,
            borderRadius: 4,
            background: '#ffffff',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
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
              height: '4px',
              borderRadius: '1rem 1rem 0 0',
              background: 'linear-gradient(90deg, #dc2626 0%, #9333ea 100%)',
            },
          }}
        >
          <Typography variant="h4" fontWeight="bold" mb={1} sx={{ color: '#1e293b', letterSpacing: 1 }}>
            Iniciar Sesión
          </Typography>
          <Typography variant="body2" mb={3} sx={{ color: '#64748b' }}>
            Bienvenido de vuelta
          </Typography>

          {apiError && (
            <Alert severity="error" sx={{ mb: 2, background: '#fef2f2', color: '#ef4444', border: '1px solid #ef4444', fontWeight: 600 }} onClose={() => setApiError('')}>
              {apiError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <TextField
              label="Usuario"
              name="username"
              fullWidth
              margin="normal"
              value={form.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              autoFocus
              sx={{
                background: '#f8fafc',
                borderRadius: 2,
                '& label': { color: '#1e293b' },
                '& label.Mui-focused': { color: '#dc2626' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#dc2626' },
                  '&.Mui-focused fieldset': { borderColor: '#dc2626' },
                },
                '& .MuiFormHelperText-root': { color: '#ef4444', fontWeight: 500 },
              }}
            />

            <TextField
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={form.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                background: '#f8fafc',
                borderRadius: 2,
                '& label': { color: '#1e293b' },
                '& label.Mui-focused': { color: '#dc2626' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#dc2626' },
                  '&.Mui-focused fieldset': { borderColor: '#dc2626' },
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
                mt: 3,
                py: 1.7,
                borderRadius: 2,
                fontWeight: 'bold',
                fontSize: 18,
                background: '#dc2626',
                color: '#fff',
                letterSpacing: 1,
                boxShadow: '0 4px 16px 0 rgba(220,38,38,0.18)',
                transition: 'all 0.3s',
                '&:hover': {
                  background: '#b91c1c',
                  color: '#fff',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(220,38,38,0.4)',
                },
              }}
            >
              {loading ? <CircularProgress size={28} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
          </Box>

          <Typography variant="caption" display="block" textAlign="center" mt={3} sx={{ color: '#64748b', fontWeight: 500 }}>
            Credenciales de prueba: emilys / emilyspass
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: '#9333ea', mt: 2, cursor: 'pointer', '&:hover': { color: '#7e22ce' } }}
            onClick={() => setInfoSnack({ open: true, msg: 'Función de recuperación de contraseña no implementada', severity: 'info' })}
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
