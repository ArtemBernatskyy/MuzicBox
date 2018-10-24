import * as types from "actions/action_types";
import initialState from "constants/initial_state";

export const isPlaying = (state = initialState.isPlaying, action) => {
  switch (action.type) {
    case types.SET_IS_PLAYING:
      return action.payload;
    default:
      return state;
  }
};

export const isLoading = (state = initialState.isLoading, action) => {
  switch (action.type) {
    case types.SET_IS_LOADING:
      return action.payload;
    default:
      return state;
  }
};

export const isRepeat = (state = initialState.isRepeat, action) => {
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
