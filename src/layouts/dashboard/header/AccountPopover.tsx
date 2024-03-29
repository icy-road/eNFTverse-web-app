import { useEffect, useRef, useState } from 'react';
import {Typography, Button, MenuItem} from '@mui/material';
import { IconButtonAnimate } from '../../../components/animate';
import { useWeb3React } from '@web3-react/core';
import useENSName from '../../../hooks/useENSName';
import { UserRejectedRequestError } from '@web3-react/injected-connector';
import { injected } from '../../../connectors';
import useMetaMaskOnboarding from '../../../hooks/useMetaMaskOnboarding';
import { shortenHex } from '../../../utils/helper';
import MenuPopover from "../../../components/MenuPopover";

export default function AccountPopover() {
  const anchorRef = useRef(null);

  const { active, error, activate, account, setError, deactivate } = useWeb3React();

  const {
    isMetaMaskInstalled,
    isWeb3Available,
    startOnboarding,
    stopOnboarding,
    setMetamaskAddress,
  } = useMetaMaskOnboarding();

  const ENSName = useENSName(account);

  const [connecting, setConnecting] = useState(false);
  const [open, setOpen] = useState(false);

  if (error) {
    return null;
  }

  const handleOpen = () => {
    setOpen(true);
  };

  const handleConnectWallet = () => {
    setConnecting(true);

    activate(injected, undefined, true).catch((error) => {
      // ignore the error if it's a user rejected request
      if (error instanceof UserRejectedRequestError) {
        setConnecting(false);
      } else {
        setError(error);
      }
    });
  };

  useEffect(() => {
    if (active || error) {
      setConnecting(false);
      stopOnboarding();
    }
  }, [active, error, stopOnboarding]);

  useEffect(() => {
    if (account != null) {
      setMetamaskAddress(ENSName || account ? `${shortenHex(account, 4)}` : null);
    }
  }, [account]);

  if (typeof account !== 'string') {
    return (
      <>
        {isWeb3Available ? (
          <Button variant="contained" color="secondary" onClick={handleConnectWallet}>
            {isMetaMaskInstalled ? 'Connect Metamask' : 'Connect Wallet'}
          </Button>
        ) : (
          <Button variant="contained" color="secondary" onClick={startOnboarding}>
            Install Metamask
          </Button>
        )}
      </>
    );
  }

  return (
    <>
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
          <Typography noWrap> {ENSName || account}</Typography>
        </Button>
      </IconButtonAnimate>
      <MenuPopover
          open={open}
          onClose={() => {
            setOpen(false)
          }}
          anchorEl={anchorRef.current}
          sx={{width: 220}}
      >
        <MenuItem
            sx={{typography: 'body2', py: 1, px: 2, borderRadius: 1, m: 1}}
            onClick={() => {
              setOpen(false)

              deactivate()
            }}
        >
          Disconnect
        </MenuItem>
      </MenuPopover>
    </>
  );
}
