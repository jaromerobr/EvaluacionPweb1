import { Avatar, Box, Paper, Typography } from '@mui/material';
import { Person } from '@mui/icons-material';

/**
 * UserInfoCard – Tarjeta que muestra los datos del usuario logueado.
 *
 * Props:
 *  - user {object} Datos del usuario desde localStorage
 */
export default function UserInfoCard({ user }) {
  return (
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
  );
}
