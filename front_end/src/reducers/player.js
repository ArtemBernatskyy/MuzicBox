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
