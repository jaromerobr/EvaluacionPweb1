import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

/**
 * ProductFormDialog – Diálogo MUI para crear o editar un producto.
 *
 * Props:
 *  - open       {boolean}  Controla visibilidad del diálogo
 *  - editing    {object|null} Producto que se edita (null = creación)
 *  - formData   {object}   { title, price, category }
 *  - formErrors {object}   Errores de validación por campo
 *  - onChange   {function} (field, value) => void
 *  - onSave     {function} Callback al guardar
 *  - onClose    {function} Callback al cerrar/cancelar
 */
export default function ProductFormDialog({
  open,
  editing,
  formData,
  formErrors,
  onChange,
  onSave,
  onClose,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}
      >
        <TextField
          label="Título"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          error={!!formErrors.title}
          helperText={formErrors.title}
          fullWidth
        />
        <TextField
          label="Precio"
          type="number"
          value={formData.price}
          onChange={(e) => onChange('price', e.target.value)}
          error={!!formErrors.price}
          helperText={formErrors.price}
          fullWidth
        />
        <TextField
          label="Categoría"
          value={formData.category}
          onChange={(e) => onChange('category', e.target.value)}
          error={!!formErrors.category}
          helperText={formErrors.category}
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>
          {editing ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
