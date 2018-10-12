import * as types from "actions/action_types";
import initialState from "./initial_state";

export const is_menu_open = (state = initialState.is_menu_open, action) => {
  switch (action.type) {
    case types.TOGGLE_MENU:
      return action.payload;
    default:
      return state;
  }
};
