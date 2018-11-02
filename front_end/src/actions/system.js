import * as types from 'constants/action_types';

export const setIsStorageSync = bool => ({
  type: types.SET_STORAGE_SYNC,
  payload: bool,
});

export function handleLogin() {
  return (dispatch) => {
    // stopping syncing state to localStorage to prevent race conditions after localStorage.clear
    // also in the future this option will be configurable via user in settings, so we need it in redux
    dispatch(setIsStorageSync(false));
    localStorage.clear();
    window.location.replace('/oauth/login/facebook/');
  };
}

export function handleLogout() {
  return (dispatch) => {
    const currentUrl = window.location.pathname;
    let nextPage = currentUrl;
    // we are checking if we are on artists's detail page
    // and redirecting to the root url
    // because there could be hidden artists
    if (currentUrl.indexOf('/artist/') >= 0) {
      nextPage = '/';
    }
    // stopping syncing state to localStorage to prevent race conditions after localStorage.clear
    // also in the future this option will be configurable via user in settings, so we need it in redux
    dispatch(setIsStorageSync(false));
    localStorage.clear();
    window.location.replace(`/api/v0/accounts/logout/?next_page=${nextPage}`);
  };
}
