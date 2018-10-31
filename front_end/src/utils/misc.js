function offsetLeft(el) {
  let left = 0;
  while (el && el !== document) {
    left += el.offsetLeft;
    // eslint-disable-next-line no-param-reassign
    el = el.offsetParent;
  }
  return left;
}

function format2Number(num) {
  const str = `${num}`;
  if (str.length === 1) {
    return `0${str}`;
  }
  if (str.length === 0) {
    return '00';
  }
  return str;
}

function roundUp(num, precision) {
  return Math.ceil(num * precision) / precision;
}

function roundDown(num) {
  return Math.floor(num);
}

function formatTime(s) {
  if (!s || s < 0) {
    return '00:00';
  }
  const totalSeconds = Math.floor(s);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds / 60) - hours * 60;
  const seconds = totalSeconds - minutes * 60 - hours * 3600;

  if (hours) {
    return `${hours}:${format2Number(minutes)}:${format2Number(seconds)}`;
  }
  return `${format2Number(minutes)}:${format2Number(seconds)}`;
}

function isTouchDevice() {
  // this method was taken from Modernizr library
  const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  // eslint-disable-next-line func-names
  const mq = function (query) {
    return window.matchMedia(query).matches;
  };
  if ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch)) {
    return true;
  }
  const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

function getParameterByName(name, url) {
  let newUrl = url;
  if (!url) {
    newUrl = window.location.href;
  }
  const newName = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${newName}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(newUrl);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
  if (match) {
    return match[1];
  }
  return null;
}

function handleLogin() {
  localStorage.clear();
  window.location.replace('/oauth/login/facebook/');
}

function handleLogout(location) {
  let nextPage = location.pathname;
  // we are checking if we are on artst's detail page
  // and redirecting to the root url
  // because there could be hidden artists
  if (location.pathname.indexOf('/artist/') >= 0) {
    nextPage = '/';
  }
  localStorage.clear();
  window.location.replace(`/api/v0/accounts/logout/?next_page=${nextPage}`);
}

export {
  offsetLeft,
  format2Number,
  roundUp,
  formatTime,
  roundDown,
  isTouchDevice,
  handleErrors,
  getParameterByName,
  getCookie,
  handleLogout,
  handleLogin,
};
