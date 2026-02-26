import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Logout } from '@mui/icons-material';

/**
 * Navbar – Barra de navegación superior con info del usuario y botón de logout.
 *
 * Props:
 *  - user        {object}   Datos del usuario (firstName, lastName, image)
 *  - onLogout    {function} Callback al presionar cerrar sesión
 */
export default function Navbar({ user, onLogout }) {
  return (
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
          <IconButton color="inherit" onClick={onLogout}>
            <Logout />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
