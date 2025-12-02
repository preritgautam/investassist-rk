import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import React from 'react';
import App, { AppProps } from 'next/app';
import { Store } from 'redux';
import * as PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { ChakraProvider } from '@chakra-ui/react';
import nextWithRedux from '../src/bootstrap/hoc/nextWithRedux';
import { QueryClient, QueryClientProvider } from 'react-query';

import '../styles/index.css';

import { PageComponent } from '../src/bootstrap/types';
import { defaultTheme } from '../src/bootstrap/chakra';
import Head from 'next/head';
import { appConfig } from '../src/config';
import { adminSession, userSession } from '../src/userSession';
import { AppContext } from 'next/dist/pages/_app';
import 'ag-grid-enterprise';
import { LicenseManager } from 'ag-grid-enterprise';

LicenseManager.setLicenseKey(appConfig.agGridLicense);


const queryClient: QueryClient = new QueryClient();

type ReduxAppProps = AppProps & {
  reduxStore: Store,
  Component: PageComponent,
};

function MainApp({ Component, pageProps, reduxStore }: ReduxAppProps) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <>
      <Head>
        <title>{appConfig.appName}</title>
      </Head>
      <ChakraProvider resetCSS theme={defaultTheme}>
        <Provider store={reduxStore}>
          <QueryClientProvider client={queryClient}>
            {getLayout(<Component {...pageProps} />)}
          </QueryClientProvider>
        </Provider>
      </ChakraProvider>
    </>
  );
}

MainApp.getInitialProps = (appContext: AppContext) => {
  userSession.authManager.startSSRSession(appContext.ctx);
  adminSession.authManager.startSSRSession(appContext.ctx);
  const ret = App.getInitialProps(appContext);
  return ret;
};

MainApp.propTypes = {
  Component: PropTypes.elementType,
  pageProps: PropTypes.object,
  reduxStore: PropTypes.object,
};

// noinspection JSUnusedGlobalSymbols
export default nextWithRedux(MainApp);
