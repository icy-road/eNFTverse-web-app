import Router from './routes';
import ThemeProvider from './theme';
import GlobalStyles from './theme/globalStyles';
import RtlLayout from './components/RtlLayout';
import ScrollToTop from './components/ScrollToTop';
import { ProgressBarStyle } from './components/ProgressBar';
import ThemeColorPresets from './components/ThemeColorPresets';
import MotionLazyContainer from './components/animate/MotionLazyContainer';
import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider } from '@web3-react/core';

export function getLibrary(provider: any) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemeColorPresets>
        <RtlLayout>
          <MotionLazyContainer>
            <Web3ReactProvider getLibrary={getLibrary}>
              <GlobalStyles />
              <ProgressBarStyle />
              <ScrollToTop />
              <Router />
            </Web3ReactProvider>
          </MotionLazyContainer>
        </RtlLayout>
      </ThemeColorPresets>
    </ThemeProvider>
  );
}
