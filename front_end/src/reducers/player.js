import * as types from "actions/action_types";
import initialState from "./initial_state";

export function isPlayingReducer(state = initialState.is_playing, action) {
  switch (action.type) {
    case types.SET_IS_PLAYING:
      return action.payload;
    default:
      return state;
  }
}


export function isLoadingReducer(state = initialState.is_loading, action) {
  switch (action.type) {
    case types.SET_IS_LOADING:
      return action.payload;
    default:
      return state;
  }
}
