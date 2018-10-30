import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import App from 'components/app';
import { initialLoadSongs } from 'actions';
import configureStore from 'store/configure_store';

const store = configureStore();

store.dispatch(initialLoadSongs());

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
