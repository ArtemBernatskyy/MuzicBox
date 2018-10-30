import * as types from './action_types';

const toggleMenu = bool => ({
  type: types.TOGGLE_MENU,
  payload: bool,
});

export default toggleMenu;
