import 'antd/dist/antd.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import url from './assets/fusion-pixel.ttf';

import App from './App';
import { Bus } from './bus';

const sel = document.getElementById('customized-css') as HTMLStyleElement;

sel.sheet.insertRule(`@font-face {
  font-family: 'Fusion Pixel';
  src: url(${url}) format('truetype');
}`, 0);
sel.sheet.insertRule(`body {
  font-family: 'Fusion Pixel' !important;
}`, 0);

const bus = (window as any).bus = new Bus();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.Fragment>
    <App bus={bus} />
  </React.Fragment>
);
