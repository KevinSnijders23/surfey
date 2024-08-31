import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import store, { persistor } from './store';
import './index.css';
import 'virtual:svg-icons-register';

const routeDOM = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

import * as Buffer from 'buffer';
import * as process from 'process';

window.global = window;
window.Buffer = window.Buffer || Buffer;
window.process = process;

const RootRender = (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);

routeDOM.render(RootRender);
