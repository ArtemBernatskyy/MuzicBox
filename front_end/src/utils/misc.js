function offsetLeft(el) {
  let left = 0;
  while (el && el !== document) {
    left += el.offsetLeft;
    el = el.offsetParent;
  }
  return left;
}

function format2Number(num) {
  let str = num + "";
  if (str.length === 1) {
    return "0" + str;
  }
  if (str.length === 0) {
    return "00";
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
    return "00:00";
  }
  let total_seconds = Math.floor(s);
  let hours = Math.floor(total_seconds / 3600);
  let minutes = Math.floor(total_seconds / 60) - hours * 60;
  let seconds = total_seconds - minutes * 60 - hours * 3600;

  if (hours) {
    return hours + ":" + format2Number(minutes) + ":" + format2Number(seconds);
  }

  return format2Number(minutes) + ":" + format2Number(seconds);
}

function isTouchDevice() {
  // this method was taken from Modernizr library
  let prefixes = " -webkit- -moz- -o- -ms- ".split(" ");
  let mq = function(query) {
    return window.matchMedia(query).matches;
  };
  if ("ontouchstart" in window || (window.DocumentTouch && document instanceof DocumentTouch)) {
    return true;
  }
  let query = ["(", prefixes.join("touch-enabled),("), "heartz", ")"].join("");
  return mq(query);
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

export { offsetLeft, format2Number, roundUp, formatTime, roundDown, isTouchDevice, handleErrors };
