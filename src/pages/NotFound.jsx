import { Box, Typography, Button, Paper } from '@mui/material';
import { SentimentVeryDissatisfied } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * NotFound – Página 404 mostrada cuando el usuario accede a una ruta inexistente.
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
      }}
    >
      <Paper elevation={6} sx={{ p: 5, borderRadius: 3, textAlign: 'center', maxWidth: 450 }}>
        <SentimentVeryDissatisfied sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h2" fontWeight="bold" color="error.main">
          404
        </Typography>
        <Typography variant="h5" fontWeight="bold" mt={1}>
          Página no encontrada
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={2} mb={3}>
          La ruta que buscas no existe o fue movida.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/login')}
          sx={{ borderRadius: 2 }}
        >
          Volver al inicio
        </Button>
      </Paper>
    </Box>
  );
}
