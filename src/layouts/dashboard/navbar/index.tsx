import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Stack, Drawer, Button } from '@mui/material';
import useResponsive from '../../../hooks/useResponsive';
import useCollapseDrawer from '../../../hooks/useCollapseDrawer';
import cssStyles from '../../../utils/cssStyles';

import { DASHBOARD_NAVBAR_WIDTH, DASHBOARD_NAVBAR_COLLAPSE_WIDTH } from '../../../config';
import Logo from '../../../components/Logo';
import Scrollbar from '../../../components/Scrollbar';
import NavSection from '../../../components/nav-section';
import navConfig from './NavConfig';
import { useWeb3React } from '@web3-react/core';
import useMetaMaskOnboarding from '../../../hooks/useMetaMaskOnboarding';
import CreateNFTDialog from '../../../components/CreateNFTDialog';
import useENSName from '../../../hooks/useENSName';

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    transition: theme.transitions.create('width', {
      duration: theme.transitions.duration.shorter,
    }),
  },
}));

// ----------------------------------------------------------------------

type Props = {
  isOpenSidebar: boolean;
  onCloseSidebar: VoidFunction;
};

export default function DashboardNavbar({ isOpenSidebar, onCloseSidebar }: Props) {
  const theme = useTheme();

  const { pathname } = useLocation();

  const { account } = useWeb3React();

  const { isMetaMaskInstalled, isWeb3Available } = useMetaMaskOnboarding();

  const isDesktop = useResponsive('up', 'lg');

  const { isCollapse, collapseClick, collapseHover, onToggleCollapse, onHoverEnter, onHoverLeave } =
    useCollapseDrawer();

  const [openCreateNftDialog, setOpenCreateNftDialog] = useState(false);
  const [metamaskAddress, setMetamaskAddress] = useState<any>('');

  const ENSName = useENSName(account);


    useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (account) {
      setMetamaskAddress(ENSName || account ? account : null);
    }
  }, [account]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          pt: 3,
          pb: 2,
          px: 2.5,
          flexShrink: 0,
          ...(isCollapse && { alignItems: 'center' }),
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Logo />
        </Stack>
      </Stack>

      <NavSection navConfig={navConfig} isCollapse={isCollapse} />

      <Box sx={{ flexGrow: 1 }} />

      <Stack sx={{ m: 2, flexGrow: 1 }} justifyContent="flex-end">
        <Button
          disabled={!isMetaMaskInstalled || !isWeb3Available || typeof account !== 'string'}
          variant="contained"
          color="secondary"
          onClick={() => {
            setOpenCreateNftDialog(true);
          }}
        >
          {!isMetaMaskInstalled || !isWeb3Available || typeof account !== 'string'
            ? 'Connect Wallet to create NFT'
            : 'Create NFT'}
        </Button>
      </Stack>
    </Scrollbar>
  );

  return (
    <RootStyle
      sx={{
        width: {
          lg: isCollapse ? DASHBOARD_NAVBAR_COLLAPSE_WIDTH : DASHBOARD_NAVBAR_WIDTH,
        },
        ...(collapseClick && {
          position: 'absolute',
        }),
      }}
    >
      {!isDesktop && (
        <Drawer
          open={isOpenSidebar}
          onClose={onCloseSidebar}
          PaperProps={{ sx: { width: DASHBOARD_NAVBAR_WIDTH } }}
        >
          {renderContent}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          onMouseEnter={onHoverEnter}
          onMouseLeave={onHoverLeave}
          PaperProps={{
            sx: {
              width: DASHBOARD_NAVBAR_WIDTH,
              borderRightStyle: 'dashed',
              bgcolor: 'background.default',
              transition: (theme) =>
                theme.transitions.create('width', {
                  duration: theme.transitions.duration.standard,
                }),
              ...(isCollapse && {
                width: DASHBOARD_NAVBAR_COLLAPSE_WIDTH,
              }),
              ...(collapseHover && {
                ...cssStyles(theme).bgBlur(),
                boxShadow: (theme) => theme.customShadows.z24,
              }),
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
      <CreateNFTDialog
        metamaskAddress={metamaskAddress}
        openCreateNftDialog={openCreateNftDialog}
        setOpenCreateNftDialog={setOpenCreateNftDialog}
      />
    </RootStyle>
  );
}
