import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, MenuItem, Typography, Stack, Avatar } from '@mui/material';
// components
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Wallet',
    linkTo: '#',
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const anchorRef = useRef(null);

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButtonAnimate
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <Avatar
          src="https://minimal-assets-api.vercel.app/assets/images/avatars/avatar_5.jpg"
          alt="Rayan Moran"
        />
      </IconButtonAnimate>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 220 }}
      >
        <Stack spacing={0.5} sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem
              key={option.label}
              to={option.linkTo}
              component={RouterLink}
              onClick={handleClose}
              sx={{ typography: 'body2', py: 1, px: 2, borderRadius: 1 }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Stack>
        <Divider />

        <MenuItem sx={{ typography: 'body2', py: 1, px: 2, borderRadius: 1, m: 1 }}>
          Disconnect
        </MenuItem>
      </MenuPopover>
    </>
  );
}
