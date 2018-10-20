import { combineReducers } from "redux";
import { songs, active_song, no_songs } from "./song";
import { isPlaying, isLoading, is_repeat, progress } from "./player";
import {
  playlist,
  searchSongValue,
  filterTagValue,
  orderingType,
  play_next_list,
  isAuthorSearch,
  is_search_song_loading,
  scroll_to_song,
} from "./playlist";
import { is_menu_open } from "./menu";
import { artists, search_artist_value, is_search_artist_loading } from "./artist";

const rootReducer = combineReducers({
  filterTagValue,
  play_next_list,
  orderingType,
  artists,
  no_songs,
  songs,
  search_artist_value,
  searchSongValue,
  playlist,
  active_song,
  isPlaying,
  isLoading,
  is_repeat,
  is_menu_open,
  isAuthorSearch,
  is_search_song_loading,
  is_search_artist_loading,
  scroll_to_song,
  progress,
});

export default rootReducer;
