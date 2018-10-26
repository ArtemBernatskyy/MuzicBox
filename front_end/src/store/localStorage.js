import Raven from 'raven-js';

import { getParameterByName } from 'utils/misc';

const filterState = state => ({
  songs: state.songs,
  playlist: state.playlist,
  playNextList: state.playNextList,
  searchSongValue: state.searchSongValue,
  searchArtistValue: state.searchArtistValue,
  artists: state.artists,
  noSongs: state.noSongs,
  filterTagValue: state.filterTagValue,
  orderingType: state.orderingType,
  activeSong: state.activeSong,
  isAuthorSearch: state.isAuthorSearch,
  isRepeat: state.isRepeat,
  progress: state.progress,
});

export const loadState = () => {
  try {
    let state = {};
    const serializedState = localStorage.getItem('mboxState');
    if (serializedState !== null) {
      state = JSON.parse(serializedState);
    }
    const search = getParameterByName('search');
    const isAuthorSearch = getParameterByName('author');
    const tagSlug = getParameterByName('tag');
    const ordering = getParameterByName('o');
    // if we have url params then injecting them in state
    if (search) {
      state.searchSongValue = search;
    }
    if (isAuthorSearch) {
      state.isAuthorSearch = isAuthorSearch;
    }
    if (tagSlug) {
      // feels kind of hack but it's a middle of the night so ...
      state.filterTagValue = { name: tagSlug, slug: tagSlug };
    }
    if (ordering) {
      state.orderingType = ordering;
    }
    return state;
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const filteredState = filterState(state);
    const serializedState = JSON.stringify(filteredState);
    localStorage.setItem('mboxState', serializedState);
  } catch (err) {
    Raven.captureException(err);
  }
};
