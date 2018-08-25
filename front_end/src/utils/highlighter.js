import PropTypes from "prop-types";
import React from "react";

/**
 * Creates an array of chunk objects representing both higlightable and non highlightable pieces of text that match each search word.
 * @return Array of "chunks" (where a Chunk is { start:number, end:number, highlight:boolean })
 */
const findAll = ({ autoEscape, sanitize, searchWords, textToHighlight }) =>
  fillInChunks({
    chunksToHighlight: combineChunks({
      chunks: findChunks({
        autoEscape,
        sanitize,
        searchWords,
        textToHighlight,
      }),
    }),
    totalLength: textToHighlight.length,
  });

/**
 * Takes an array of {start:number, end:number} objects and combines chunks that overlap into single chunks.
 * @return {start:number, end:number}[]
 */
const combineChunks = ({ chunks }) => {
  chunks = chunks.sort((first, second) => first.start - second.start).reduce((processedChunks, nextChunk) => {
    // First chunk just goes straight in the array...
    if (processedChunks.length === 0) {
      return [nextChunk];
    } else {
      // ... subsequent chunks get checked to see if they overlap...
      const prevChunk = processedChunks.pop();
      if (nextChunk.start <= prevChunk.end) {
        // It may be the case that prevChunk completely surrounds nextChunk, so take the
        // largest of the end indeces.
        const endIndex = Math.max(prevChunk.end, nextChunk.end);
        processedChunks.push({ start: prevChunk.start, end: endIndex });
      } else {
        processedChunks.push(prevChunk, nextChunk);
      }
      return processedChunks;
    }
  }, []);

  return chunks;
};

/**
 * Examine text for any matches.
 * If we find matches, add them to the returned array as a "chunk" object ({start:number, end:number}).
 * @return {start:number, end:number}[]
 */
const findChunks = ({ autoEscape, sanitize = identity, searchWords, textToHighlight }) => {
  textToHighlight = sanitize(textToHighlight);

  return searchWords
    .filter(searchWord => searchWord) // Remove empty words
    .reduce((chunks, searchWord) => {
      searchWord = sanitize(searchWord);

      if (autoEscape) {
        searchWord = escapeRegExpFn(searchWord);
      }

      const regex = new RegExp(searchWord, "gi");

      let match;
      while ((match = regex.exec(textToHighlight))) {
        chunks.push({
          start: match.index,
          end: regex.lastIndex,
        });
      }

      return chunks;
    }, []);
};

/**
 * Given a set of chunks to highlight, create an additional set of chunks
 * to represent the bits of text between the highlighted text.
 * @param chunksToHighlight {start:number, end:number}[]
 * @param totalLength number
 * @return {start:number, end:number, highlight:boolean}[]
 */
const fillInChunks = ({ chunksToHighlight, totalLength }) => {
  const allChunks = [];
  const append = (start, end, highlight) => {
    if (end - start > 0) {
      allChunks.push({
        start,
        end,
        highlight,
      });
    }
  };

  if (chunksToHighlight.length === 0) {
    append(0, totalLength, false);
  } else {
    let lastIndex = 0;
    chunksToHighlight.forEach(chunk => {
      append(lastIndex, chunk.start, false);
      append(chunk.start, chunk.end, true);
      lastIndex = chunk.end;
    });
    append(lastIndex, totalLength, false);
  }
  return allChunks;
};

function identity(value) {
  return value;
}

function escapeRegExpFn(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}

Highlighter.propTypes = {
  activeClassName: PropTypes.string,
  activeIndex: PropTypes.number,
  activeStyle: PropTypes.object,
  autoEscape: PropTypes.bool,
  className: PropTypes.string,
  highlightClassName: PropTypes.string,
  highlightStyle: PropTypes.object,
  highlightTag: PropTypes.oneOfType([PropTypes.node, PropTypes.func, PropTypes.string]),
  sanitize: PropTypes.func,
  searchWords: PropTypes.arrayOf(PropTypes.string).isRequired,
  textToHighlight: PropTypes.string.isRequired,
  unhighlightClassName: PropTypes.string,
  unhighlightStyle: PropTypes.object,
};

/**
 * Highlights all occurrences of search terms (searchText) within a string (textToHighlight).
 * This function returns an array of strings and <span>s (wrapping highlighted words).
 */
export default function Highlighter({
  activeClassName = "",
  activeIndex = -1,
  activeStyle,
  autoEscape,
  className,
  highlightClassName = "",
  highlightStyle = {},
  highlightTag = "mark",
  sanitize,
  searchWords,
  textToHighlight,
  unhighlightClassName = "",
  unhighlightStyle,
}) {
  const chunks = findAll({
    autoEscape,
    sanitize,
    searchWords,
    textToHighlight,
  });
  const HighlightTag = highlightTag;
  let highlightCount = -1;
  let highlightClassNames = "";
  let highlightStyles;

  return (
    <span className={className}>
      {chunks.map((chunk, index) => {
        const text = textToHighlight.substr(chunk.start, chunk.end - chunk.start);

        if (chunk.highlight) {
          highlightCount++;

          const isActive = highlightCount === +activeIndex;

          highlightClassNames = `${highlightClassName} ${isActive ? activeClassName : ""}`;
          highlightStyles =
            isActive === true && activeStyle != null ? Object.assign({}, highlightStyle, activeStyle) : highlightStyle;

          return (
            <HighlightTag className={highlightClassNames} key={index} style={highlightStyles}>
              {text}
            </HighlightTag>
          );
        } else {
          return (
            <span className={unhighlightClassName} key={index} style={unhighlightStyle}>
              {text}
            </span>
          );
        }
      })}
    </span>
  );
}
