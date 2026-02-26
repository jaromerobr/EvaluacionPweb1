import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';

/**
 * ConfirmDialog – Diálogo genérico de confirmación con MUI.
 *
 * Props:
 *  - open      {boolean}  Controla visibilidad
 *  - title     {string}   Título del diálogo
 *  - message   {string|ReactNode} Mensaje de confirmación
 *  - onConfirm {function} Callback al confirmar
 *  - onCancel  {function} Callback al cancelar
 *  - confirmColor {string} Color del botón de confirmar (default: 'error')
 *  - confirmText  {string} Texto del botón (default: 'Eliminar')
 */
export default function ConfirmDialog({
  open,
  title = 'Confirmar',
  message,
  onConfirm,
  onCancel,
  confirmColor = 'error',
  confirmText = 'Eliminar',
}) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
