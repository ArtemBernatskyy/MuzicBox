import * as types from "actions/action_types";
import initialState from "constants/initial_state";

export const isMenuOpen = (state = initialState.isMenuOpen, action) => {
  switch (action.type) {
    case types.TOGGLE_MENU:
      return action.payload;
    default:
      return state;
  }
};
