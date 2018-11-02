import SongApi from 'api/song_api';
import { getParameterByName } from 'utils/misc';
import * as types from 'constants/action_types';
import { playNext, emitIsLoading } from './player';
import { setPlaylist } from './playlist';

export const emitNoSongs = bool => ({
  type: types.NO_SONGS,
  payload: bool,
});

export const setFilterTagValue = value => ({
  type: types.SET_FILTER_TAG_VALUE,
  payload: value,
});

export const setAuthorSearchValue = bool => ({
  type: types.IS_AUTHOR_SEARCH,
  payload: bool,
});

export const setSearchSongValue = value => ({
  type: types.SET_SEARCH_SONG_VALUE,
  payload: value,
});

export const setSearchSongLoading = bool => ({
  type: types.TOGGLE_SEARCH_SONG_LOADING,
  payload: bool,
});

export const setOrderingType = value => ({
  type: types.SET_ORDER_TYPE,
  payload: value,
});

export const setSongs = songObjects => ({
  type: types.SET_SONGS,
  songObjects,
});

export const mergeSongs = (songObjects, oldSongObjects) => ({
  type: types.MERGE_SONGS,
  songObjects,
  oldSongObjects,
});

export function setNoSongs(bool) {
  return (dispatch) => {
    dispatch(emitNoSongs(bool));
    // if we don't have ANY songs then we will set all loaders to false
    if (bool === true) {
      dispatch(emitIsLoading(false));
    }
  };
}

export function initialLoadSongs() {
  return (dispatch, getState) => {
    const oldActiveSong = getState().activeSong;
    const search = getParameterByName('search');
    const isAuthorSearch = getParameterByName('author');
    const tagSlug = getParameterByName('tag');
    const ordering = getParameterByName('o');
    const hasUrlParams = search || isAuthorSearch || tagSlug || ordering;
    // if we have oldActiveSong then it means that we have localStorage
    const isLocalStorage = oldActiveSong ? oldActiveSong.id !== '' : false;

    if (hasUrlParams) {
      // have SEARCH PARAMS -> trying to load from that params
      SongApi.fetchSongs(ordering, search, { name: tagSlug, slug: tagSlug }, isAuthorSearch)
        .then((songObjects) => {
          dispatch(setSongs(songObjects));
          if (songObjects.results.length > 0) {
            // have SEARCH RESULTS -> setting them
            dispatch(setPlaylist(songObjects)); // loading songs into playlist
            dispatch(playNext(songObjects.results[0])); // setting active first song during onLoad
          } else if (!isLocalStorage) {
            // no SEARCH RESULTS AND no localStorage -> loading DEFAULT PLAYLIST
            SongApi.getNextSongs()
              .then((songObjects) => {
                if (songObjects.results.length > 0) {
                  // have DEFAULT PLAYLIST -> setting songs from it
                  dispatch(setPlaylist(songObjects)); // loading songs into playlist
                  dispatch(playNext(songObjects.results[0])); // setting active first song during onLoad
                } else {
                  // no DEFAULT PLAYLIST -> signaling setNoSongs
                  dispatch(setNoSongs(true));
                }
              });
          }
          // else {
          //   no SEARCH RESULTS AND have localStorage -> loaded from localStorage during initialisation
          // }
        })
        .catch((error) => {
          throw error;
        });
    } else if (!isLocalStorage) {
      // no SEARCH PARAMS AND no localStorage -> loading DEFAULT PLAYLIST
      SongApi.getNextSongs()
        .then((songObjects) => {
          dispatch(setSongs(songObjects));
          if (songObjects.results.length > 0) {
            // have DEFAULT PLAYLIST -> setting songs from it
            dispatch(setPlaylist(songObjects)); // loading songs into playlist
            dispatch(playNext(songObjects.results[0])); // setting active first song during onLoad
          } else {
            // no DEFAULT PLAYLIST -> signaling setNoSongs
            dispatch(setNoSongs(true));
          }
        })
        .catch((error) => {
          throw error;
        });
    }
    // else {
    //   no SEARCH PARAMS AND have localStorage -> loaded from localStorage during initialisation
    // }
  };
}

export function mergeNextSongs(pageUrl) {
  return (dispatch, getState) => {
    const oldSongObjects = getState().songs;
    SongApi.getNextSongs(pageUrl)
      .then((songObjects) => {
        dispatch(mergeSongs(songObjects, oldSongObjects));
      })
      .catch((error) => {
        throw error;
      });
  };
}

export function orderSongByValue(orderingType) {
  return (dispatch, getState) => {
    const { searchSongValue, filterTagValue, isAuthorSearch } = getState();
    dispatch(setSearchSongLoading(true)); // setting search loading to ON
    dispatch(setOrderingType(orderingType));
    SongApi.fetchSongs(orderingType, searchSongValue, filterTagValue, isAuthorSearch)
      .then((songs) => {
        dispatch(setSongs(songs));
      })
      .finally(() => {
        dispatch(setSearchSongLoading(false)); // setting search loading to OFF
      });
  };
}

export function searchSong(song, isAuthorSearch) {
  return (dispatch, getState) => {
    const { filterTagValue, orderingType } = getState();
    dispatch(setSearchSongLoading(true)); // setting search loading to ON
    dispatch(setSearchSongValue(song));
    dispatch(setAuthorSearchValue(isAuthorSearch));
    SongApi.fetchSongs(orderingType, song, filterTagValue, isAuthorSearch)
      .then((songs) => {
        dispatch(setSongs(songs));
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        dispatch(setSearchSongLoading(false)); // setting search loading to OFF
      });
  };
}

export function filterSongByTag(filterTagValue) {
  return (dispatch, getState) => {
    const { searchSongValue, orderingType, isAuthorSearch } = getState();
    dispatch(setSearchSongLoading(true)); // setting search loading to ON
    dispatch(setFilterTagValue(filterTagValue));
    SongApi.fetchSongs(orderingType, searchSongValue, filterTagValue, isAuthorSearch)
      .then((songs) => {
        dispatch(setSongs(songs));
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        dispatch(setSearchSongLoading(false)); // setting search loading to OFF
      });
  };
}
