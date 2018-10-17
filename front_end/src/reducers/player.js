import * as types from "actions/action_types";
import initialState from "constants/initial_state";

export const is_playing = (state = initialState.is_playing, action) => {
  switch (action.type) {
    case types.SET_IS_PLAYING:
      return action.payload;
    default:
      return state;
  }
};

export const is_loading = (state = initialState.is_loading, action) => {
  switch (action.type) {
    case types.SET_IS_LOADING:
      return action.payload;
    default:
      return state;
  }
};

export const is_repeat = (state = initialState.is_repeat, action) => {
  switch (action.type) {
    case types.TOGGLE_REPEAT:
      return action.payload;
    default:
      return state;
  }
};

export const progress = (state = initialState.progress, action) => {
  switch (action.type) {
    case types.SET_PROGRESS:
      return action.payload;
    default:
      return state;
  }
};
