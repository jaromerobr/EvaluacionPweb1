import { Snackbar, Alert } from '@mui/material';

/**
 * NotificationSnackbar – Componente MUI para mostrar alertas/notificaciones.
 * Reemplaza el uso de alert() nativo.
 *
 * Props:
 *  - open     {boolean}  Controla visibilidad
 *  - message  {string}   Texto a mostrar
 *  - severity {string}   'success' | 'error' | 'warning' | 'info'
 *  - onClose  {function} Callback al cerrar
 */
export default function NotificationSnackbar({ open, message, severity = 'success', onClose }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
