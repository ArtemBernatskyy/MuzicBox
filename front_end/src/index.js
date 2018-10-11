import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import throttle from "lodash/throttle";

import App from "components/app";
import { initialLoadSongs } from "actions";
import configureStore from "store/configure_store";
import { saveState } from "store/localStorage";

const store = configureStore();

store.dispatch(initialLoadSongs());

store.subscribe(
  throttle(() => {
    saveState({
      play_next_list: store.getState().play_next_list,
    });
  }, 1000)
);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
