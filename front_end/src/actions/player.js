import * as types from "./action_types";
import { loadSongDetailsSuccess } from "./song";

export const emitIsPlaying = bool => {
  return {
    type: types.SET_IS_PLAYING,
    payload: bool,
  };
};

export const emitIsLoading = bool => {
  return {
    type: types.SET_IS_LOADING,
    payload: bool,
  };
};

export function setIsPlaying(is_playing) {
  return (dispatch, getState) => {
    const is_loading = getState().is_loading;
    // not playing if we are loading
    if (!is_loading) {
      dispatch(emitIsPlaying(is_playing));
    }
  };
}

export function playNext(song_object, playing = false) {
  return dispatch => {
    dispatch(emitIsLoading(true));
    dispatch(loadSongDetailsSuccess(song_object));
    if (playing) {
      dispatch(emitIsPlaying(true));
    }
  };
}
