import * as types from "./action_types";
import { loadSongDetailsSuccess } from "./song";

export const emitIsPlaying = bool => ({
  type: types.SET_IS_PLAYING,
  payload: bool,
});

export const emitIsLoading = bool => ({
  type: types.SET_IS_LOADING,
  payload: bool,
});

export const toggleRepeat = bool => ({
  type: types.TOGGLE_REPEAT,
  payload: bool,
});

export const setProgress = unitInterval => ({
  type: types.SET_PROGRESS,
  payload: unitInterval,
});

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
