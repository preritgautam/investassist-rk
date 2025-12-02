// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MainDocument extends Document {
  render() {
    return (
      <Html prefix="og: https://ogp.me/ns#">
        <Head>
          <link rel="icon" href={'/assets/Logo/logo_icon.svg'}/>
        </Head>
        <body style={{ margin: 0, height: '100vh', overflow: 'hidden' }}>
          <Main/>
          <NextScript/>
        </body>
      </Html>
    );
  }
}

// noinspection JSUnusedGlobalSymbols
export default MainDocument;
