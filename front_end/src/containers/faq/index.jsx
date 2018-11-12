import React from 'react';
import CSSModules from 'react-css-modules';
import { Link } from 'react-router-dom';

import styles from './faq.css';

const FAQPage = () => (
  <div className="app__container" styleName="faq-wrapper">
    <h3 styleName="h3-custom">FAQ</h3>
    <p styleName="question">WHAT IS MUZICBOX?</p>
    <ul styleName="answer_block">
      <li styleName="answer">
        MUZICBOX is an&nbsp;
        <a rel="noopener noreferrer" target="_blank" href="https://github.com/ArtemBernatskyy/MuzicBox">
          open source
        </a>
        &nbsp;music website where you can upload songs and listen to them. It automatically
        downloads songs lyrics, author and other info for you.
      </li>
    </ul>
    <p styleName="question">HOW DO I UPLOAD SONG TO MUZICBOX?</p>
    <ul styleName="answer_block">
      <li styleName="answer">
        You should create an account and visit&nbsp;
        <Link to="/upload/">upload page.</Link>
      </li>
    </ul>
    <p styleName="question">WHY SHOULD I CREATE AN ACCOUNT?</p>
    <ul styleName="answer_block">
      <li styleName="answer">
        MUZICBOX accounts are free and let you save all of your uploaded and favorite songs to one easy-to-find place.
        To create an account, visit&nbsp;
        <Link to="/auth/">register page.</Link>
      </li>
    </ul>
    <p styleName="question">WHAT CAN I UPLOAD?</p>
    <ul styleName="answer_block">
      <li styleName="answer">You can upload anything, which is in mp3 format and you have rights to that.</li>
    </ul>
    <p styleName="question">I CAN&#39;T UPLOAD DUE TO ERROR</p>
    <ul styleName="answer_block">
      <li styleName="answer">
        If you see errors like this&nbsp;
        <span>No name/artist was found in ID3 data or in song file name</span>
        &nbsp;you need to ensure that song has&nbsp;
        <a rel="noopener noreferrer" target="_blank" href="https://en.wikipedia.org/wiki/ID3">
          ID3
        </a>
        &nbsp; metadata, or name song correctly like&nbsp;
        <span>Artist name - Song name.mp3 </span>
        and we will parse the rest for you.
      </li>
    </ul>
    <p styleName="question">WHY IS THIS PROJECT FREE?</p>
    <ul styleName="answer_block">
      <li styleName="answer">
        I&#39;ve done this for myself and close friends, so for the first users, it will always stay free.
      </li>
    </ul>
    <p styleName="question">KEEP IN TOUCH</p>
    <ul styleName="answer_block">
      <li styleName="answer">
        Contact me via&nbsp;
        <a rel="noopener noreferrer" target="_blank" href="https://www.linkedin.com/in/artembernatskyy/">
          LinkedIn
        </a>
        ,&nbsp;or follow&nbsp;
        <a rel="noopener noreferrer" target="_blank" href="https://www.linkedin.com/company/muzicbox/">
          our updates.
        </a>
      </li>
    </ul>
  </div>
);

export default CSSModules(FAQPage, styles, { allowMultiple: true });
