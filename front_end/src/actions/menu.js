import * as types from 'constants/action_types';

const toggleMenu = bool => ({
  type: types.TOGGLE_MENU,
  payload: bool,
});

export default toggleMenu;
