import { combineReducers } from "redux";
import { songs, active_song, no_songs } from "./song";
import { is_playing, is_loading, is_repeat, progress } from "./player";
import {
  playlist,
  search_song_value,
  filter_tag_value,
  ordering_type,
  play_next_list,
  is_author_search,
  is_search_song_loading,
  scroll_to_song,
} from "./playlist";
import { is_menu_open } from "./menu";
import { artists, search_artist_value, is_search_artist_loading } from "./artist";

const rootReducer = combineReducers({
  filter_tag_value,
  play_next_list,
  ordering_type,
  artists,
  no_songs,
  songs,
  search_artist_value,
  search_song_value,
  playlist,
  active_song,
  is_playing,
  is_loading,
  is_repeat,
  is_menu_open,
  is_author_search,
  is_search_song_loading,
  is_search_artist_loading,
  scroll_to_song,
  progress,
});

export default rootReducer;
