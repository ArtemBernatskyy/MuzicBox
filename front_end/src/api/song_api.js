class SongApi {
  static getNextSongs(pageUrl) {
    let fetchUrl;
    if (pageUrl) {
      fetchUrl = pageUrl;
    } else {
      fetchUrl = '/api/v0/audio/';
    }
    return fetch(fetchUrl, { cache: 'no-cache', credentials: 'same-origin' })
      .then(response => response.json())
      .catch((error) => {
        throw error;
      });
  }

  static getTags() {
    return fetch('/api/v0/tags/', { cache: 'no-cache', credentials: 'same-origin' })
      .then(response => response.json())
      .catch((error) => {
        throw error;
      });
  }

  static fetchSongs(oType, searchSongValue, filterObject, author) {
    let fetchUrl = '';
    if (oType) {
      fetchUrl += `o=${oType}&`;
    }
    if (searchSongValue) {
      fetchUrl += `search=${searchSongValue}&`;
    }
    if (author) {
      fetchUrl += 'author=true&';
    }
    if (filterObject && filterObject.slug) {
      fetchUrl += `tag=${filterObject.slug}&`;
    }
    // keep url in sync to allow loading state from Url
    window.history.pushState(null, '', `?${fetchUrl}`);
    fetchUrl = `/api/v0/audio/?${fetchUrl}`;
    return fetch(fetchUrl, { cache: 'no-cache', credentials: 'same-origin' })
      .then(response => response.json())
      .catch((error) => {
        throw error;
      });
  }

  static getSongLyrics(songId) {
    return fetch(`/api/v0/audio/${songId}/lyrics/`, {
      cache: 'no-cache',
      credentials: 'same-origin',
    })
      .then(response => response.json())
      .catch((error) => {
        throw error;
      });
  }
}

export default SongApi;
