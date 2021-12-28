import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, MenuItem, Typography, Stack, Avatar, Button } from '@mui/material';
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
  const [walletConnected, setWalletConnected] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleConnectWallet = () => {
    setWalletConnected(true);
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
  };

  return (
    <>
      {walletConnected ? (
        <IconButtonAnimate
          ref={anchorRef}
          onClick={handleOpen}
          sx={{
            padding: 0,
            width: 120,
            ...(open && {
              '&:before': {
                zIndex: 1,
                content: "''",
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                position: 'absolute',
              },
            }),
          }}
        >
          <Button variant="contained" color="primary">
            <Typography noWrap>0xCC07e9C9C79caae41306C94E1b597B9712c86FF7</Typography>
          </Button>
        </IconButtonAnimate>
      ) : (
        <Button variant="contained" color="secondary" onClick={handleConnectWallet}>
          Connect Wallet
        </Button>
      )}
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

        <MenuItem sx={{ typography: 'body2', py: 1, px: 2, borderRadius: 1, m: 1 }} onClick={() => {
            handleClose()
            handleDisconnectWallet()
        }}>
          Disconnect
        </MenuItem>
      </MenuPopover>
    </>
  );
}
