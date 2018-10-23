import SongApi from 'api/song_api';
import { getParameterByName } from 'utils/misc';
import { playNext } from './player';
import * as types from './action_types';
import { setPlaylist } from './playlist';

export const setNoSongs = bool => ({
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
      // because we don't know name of tag then we will populate it with slug )
      SongApi.fetchSongs(ordering, search, { name: tagSlug, slug: tagSlug }, isAuthorSearch)
        .then((songObjects) => {
          dispatch(setSongs(songObjects));
          if (songObjects.results.length > 0) {
            // checking if user has at least one song
            dispatch(setPlaylist(songObjects)); // loading songs in to playlist
            dispatch(playNext(songObjects.results[0])); // setting active first song during onLoad
          } else {
            dispatch(setNoSongs(true));
          }
        })
        .catch((error) => {
          throw error;
        });
    } else if (!isLocalStorage) {
      SongApi.getNextSongs()
        .then((songObjects) => {
          dispatch(setSongs(songObjects));
          if (songObjects.results.length > 0) {
            // checking if user has at least one song
            dispatch(setPlaylist(songObjects)); // loading songs in to playlist
            dispatch(playNext(songObjects.results[0])); // setting active first song during onLoad
          } else {
            dispatch(setNoSongs(true));
          }
        })
        .catch((error) => {
          throw error;
        });
    } else {
      dispatch(playNext(oldActiveSong)); // setting song from localStorage
    }
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
