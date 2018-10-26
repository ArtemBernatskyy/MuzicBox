import { combineReducers } from "redux";
import { songs, activeSong, noSongs } from "./song";
import { isPlaying, isLoading, isRepeat, progress } from "./player";
import {
  playlist,
  searchSongValue,
  filterTagValue,
  orderingType,
  playNextList,
  isAuthorSearch,
  isSearchSongLoading,
  scrollIntoViewSong,
} from "./playlist";
import { isMenuOpen } from "./menu";
import { artists, searchArtistValue, isSearchArtistLoading } from "./artist";

const rootReducer = combineReducers({
  filterTagValue,
  playNextList,
  orderingType,
  artists,
  noSongs,
  songs,
  searchArtistValue,
  searchSongValue,
  playlist,
  activeSong,
  isPlaying,
  isLoading,
  isRepeat,
  isMenuOpen,
  isAuthorSearch,
  isSearchSongLoading,
  isSearchArtistLoading,
  scrollIntoViewSong,
  progress,
});

export default rootReducer;
