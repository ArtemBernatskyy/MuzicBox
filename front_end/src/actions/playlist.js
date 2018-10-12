import SongApi from "api/song_api";
import * as types from "./action_types";
import { setSongs } from "./song";

export const setPlaylist = songs => ({
  type: types.SET_PLAYLIST,
  payload: songs,
});

export const setSearchSongValue = value => ({
  type: types.SET_SEARCH_SONG_VALUE,
  payload: value,
});

export const setSearchSongLoading = bool => ({
  type: types.TOGGLE_SEARCH_SONG_LOADING,
  payload: bool,
});

export const setAuthorSearchValue = bool => ({
  type: types.IS_AUTHOR_SEARCH,
  payload: bool,
});

export const setFilterTagValue = value => ({
  type: types.SET_FILTER_TAG_VALUE,
  payload: value,
});

export const setOrderingType = value => ({
  type: types.SET_ORDER_TYPE,
  payload: value,
});

export const scrollToSong = song_id => ({
  type: types.SCROLL_TO_SONG,
  payload: song_id,
});

export const togglePlayNextItemAction = (song, old_play_next) => ({
  type: types.TOGGLE_PLAYNEXT_ITEM,
  song: song,
  old_play_next: old_play_next,
});

export function togglePlayNextItem(song) {
  return (dispatch, getState) => {
    const old_play_next = getState().play_next_list;
    dispatch(togglePlayNextItemAction(song, old_play_next));
  };
}

export function orderSongByValue(ordering_type) {
  return (dispatch, getState) => {
    const search_song_value = getState().search_song_value;
    const filter_tag_value_object = getState().filter_tag_value;
    const is_author_search = getState().is_author_search;
    dispatch(setSearchSongLoading(true)); // setting search loading to ON
    dispatch(setOrderingType(ordering_type));
    SongApi.fetchSongs(ordering_type, search_song_value, filter_tag_value_object, is_author_search)
      .then(songs => {
        dispatch(setSongs(songs));
      })
      .finally(() => {
        dispatch(setSearchSongLoading(false)); // setting search loading to OFF
      });
  };
}

export function searchSong(song, is_author_search) {
  return (dispatch, getState) => {
    const filter_tag_value_object = getState().filter_tag_value;
    const ordering_type = getState().ordering_type;
    dispatch(setSearchSongLoading(true)); // setting search loading to ON
    dispatch(setSearchSongValue(song));
    dispatch(setAuthorSearchValue(is_author_search));
    SongApi.fetchSongs(ordering_type, song, filter_tag_value_object, is_author_search)
      .then(songs => {
        dispatch(setSongs(songs));
      })
      .catch(error => {
        throw error;
      })
      .finally(() => {
        dispatch(setSearchSongLoading(false)); // setting search loading to OFF
      });
  };
}

export function filterSongByTag(filter_tag_value_object) {
  return (dispatch, getState) => {
    const search_song_value = getState().search_song_value;
    const ordering_type = getState().ordering_type;
    const is_author_search = getState().is_author_search;
    dispatch(setSearchSongLoading(true)); // setting search loading to ON
    dispatch(setFilterTagValue(filter_tag_value_object));
    SongApi.fetchSongs(ordering_type, search_song_value, filter_tag_value_object, is_author_search)
      .then(songs => {
        dispatch(setSongs(songs));
      })
      .catch(error => {
        throw error;
      })
      .finally(() => {
        dispatch(setSearchSongLoading(false)); // setting search loading to OFF
      });
  };
}

export const mergePlaylist = (playlist_object, old_playlist_object) => ({
  type: types.MERGE_PLAYLIST,
  playlist_object: playlist_object,
  old_playlist_object: old_playlist_object,
});

export function mergeNextPlaylist(page_url) {
  return (dispatch, getState) => {
    const old_playlist_object = getState().playlist;
    SongApi.getNextSongs(page_url)
      .then(playlist_object => {
        dispatch(mergePlaylist(playlist_object, old_playlist_object));
      })
      .catch(error => {
        throw error;
      });
  };
}
