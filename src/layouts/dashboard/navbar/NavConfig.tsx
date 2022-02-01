// components
import SvgIconStyle from '../../../components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name: string) => (
  <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  user: getIcon('ic_user'),
  ecommerce: getIcon('ic_ecommerce'),
  analytics: getIcon('ic_analytics'),
  dashboard: getIcon('ic_dashboard'),
  search: getIcon('ic_search'),
  wallet: getIcon('ic_wallet'),
};

const sidebarConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: '',
    items: [
      { title: 'Marketplace', path: '/marketplace', icon: ICONS.ecommerce },
      { title: 'Owned NFTs', path: '/owned', icon: ICONS.wallet },
      { title: 'Explore', path: '/explore-nfts', icon: ICONS.search },
    ],
  },
];

export default sidebarConfig;
