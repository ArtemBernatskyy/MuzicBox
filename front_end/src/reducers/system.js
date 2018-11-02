import * as types from 'constants/action_types';
import initialState from 'constants/initial_state';

const isStorageSync = (state = initialState.isStorageSync, action) => {
  switch (action.type) {
    case types.SET_STORAGE_SYNC:
      return action.payload;
    default:
      return state;
  }
};

export default isStorageSync;
