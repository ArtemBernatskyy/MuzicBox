import * as types from "actions/action_types";
import initialState from "./initial_state";

export function menuOpenReducer(state = initialState.is_menu_open, action) {
  switch (action.type) {
    case types.TOGGLE_MENU:
      return action.payload;
    default:
      return state;
  }
}
