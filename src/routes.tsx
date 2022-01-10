import React, { Suspense, lazy, ElementType } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';

import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
import LoadingScreen from './components/LoadingScreen';

const Loadable = (Component: ElementType) => (props: any) => {
  const { pathname } = useLocation();

  return (
    <Suspense fallback={<LoadingScreen isDashboard={pathname.includes('/dashboard')} />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/marketplace" replace /> },
        { path: '/marketplace', element: <Marketplace /> },
        { path: '/', element: <Navigate to="/marketplace" replace /> },
        { path: '/marketplace/nft/:id', element: <ProductDetails /> },
        { path: '/explore-nfts', element: <ExploreNFTs />}
      ],
    },
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// Dashboard
const Marketplace = Loadable(lazy(() => import('./pages/Marketplace')));
const ProductDetails = Loadable(lazy(() => import('./pages/NFTDetails')));
const ExploreNFTs = Loadable(lazy(() => import('./pages/ExploreNFTs')));
const NotFound = Loadable(lazy(() => import('./pages/Page404')));
