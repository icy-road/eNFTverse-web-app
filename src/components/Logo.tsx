import { Link as RouterLink } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, BoxProps, Typography } from '@mui/material';
import React from 'react';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
  disabledLink?: boolean;
}

export default function Logo({ disabledLink = false, sx }: Props) {
  const theme = useTheme();
  const PRIMARY_LIGHT = theme.palette.primary.light;
  const PRIMARY_MAIN = theme.palette.primary.main;
  const PRIMARY_DARKER = theme.palette.primary.darker;

  const logo = (
    <Box sx={{ width: 40, height: 40, ...sx }}>
      <Typography
        variant="h5"
        component="h5"
        style={{
          color: PRIMARY_DARKER,
          textDecoration: 'none',
        }}
      >
        eNFTiverse
      </Typography>
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return (
    <RouterLink
      to="/marketplace"
      style={{
        textDecoration: 'none',
      }}
    >
      {logo}
    </RouterLink>
  );
}
