import * as types from "./action_types";

export const toggleMenu = bool => ({
  type: types.TOGGLE_MENU,
  payload: bool,
});
