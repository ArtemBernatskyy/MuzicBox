import * as types from "./action_types";

export const toggleMenu = bool => {
  return {
    type: types.TOGGLE_MENU,
    payload: bool,
  };
};
