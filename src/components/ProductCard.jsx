import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

/**
 * ProductCard – Tarjeta individual de producto con acciones de editar y eliminar.
 *
 * Props:
 *  - product  {object}   Objeto producto (id, title, price, category, thumbnail)
 *  - onEdit   {function} Callback al presionar editar
 *  - onDelete {function} Callback al presionar eliminar
 */
export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      {product.thumbnail && (
        <Box
          component="img"
          src={product.thumbnail}
          alt={product.title}
          sx={{ height: 160, objectFit: 'cover', width: '100%' }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {product.title}
        </Typography>
        <Chip label={product.category} size="small" color="secondary" sx={{ mb: 1 }} />
        <Typography variant="h6" color="primary">
          ${product.price}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Tooltip title="Editar">
          <IconButton color="primary" onClick={() => onEdit(product)}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton color="error" onClick={() => onDelete(product)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
