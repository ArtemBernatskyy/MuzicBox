export default {
  songs: {
    count: null,
    next: null,
    previous: null,
    results: [],
  },
  playlist: {
    count: null,
    next: null,
    previous: null,
    results: [],
  },
  playNextList: [],
  searchSongValue: "",
  searchArtistValue: "",
  artists: {
    count: null,
    next: null,
    previous: null,
    results: [],
  },
  noSongs: false,
  filterTagValue: null,
  orderingType: null,
  activeSong: {
    id: "",
    name: "",
    length: 0,
    has_lyrics: false,
    slug: "",
    audio_file: "",
    bitrate: null,
    tags: [],
    playcount: 0,
    artist: { id: "", name: "", slug: "" },
    small_image_thumbnail: "",
    extra_sm_image_thumbnail: "",
  },
  progress: 0,
  isPlaying: false,
  isLoading: true,
  isRepeat: false,
  isMenuOpen: false,
  isAuthorSearch: false,
  isSearchSongLoading: false,
  isSearchArtistLoading: false,
  scrollIntoViewSong: null,
};
