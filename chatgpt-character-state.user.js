// ==UserScript==
// @name         ChatGPT Character State
// @namespace    https://github.com/tsukao2240/chatgpt-character-images
// @version      1.1.0
// @description  Show character state images and compact ChatGPT character icons.
// @author       tsukao2240
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const IMAGE_BASE = 'https://tsukao2240.github.io/chatgpt-character-images/images/';
  const STATES = {
    normal: '01_normal.png',
    observe: '02_observe.png',
    think: '03_think.png',
    answer: '04_answer.png',
    question: '05_question.png',
    important: '06_important.png',
    deny: '07_deny.png',
    standby: '08_standby.png',
  };
  const STATE_NAMES = Object.keys(STATES).join('|');
  const STATE_PATTERN = new RegExp(`\\[\\[STATE:(${STATE_NAMES})\\]\\]`, 'i');
  const STATE_PATTERN_GLOBAL = new RegExp(`\\[\\[STATE:(?:${STATE_NAMES})\\]\\]`, 'gi');
  const ASSISTANT_SELECTORS = [
    '[data-message-author-role="assistant"]',
    '[data-author-role="assistant"]',
    '[data-role="assistant"]',
    'article[data-turn="assistant"]',
    '.assistant-message',
  ].join(',');
  const IMAGE_CLASS = 'chatgpt-character-state-image';
  const TAG_CLASS = 'chatgpt-character-state-tag';
  const STYLE_ID = 'chatgpt-character-custom-style';
  const AVATAR_URL = 'https://cdn-ak.f.st-hatena.com/images/fotolife/t/tsukaox/20260831/20260831075943.png';
  let scheduled = false;

  const installCustomStyle = () => {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      div.agent-turn,
      article[data-turn="assistant"],
      [data-message-author-role="assistant"] {
        position: relative;
      }

      div.agent-turn::before,
      article[data-turn="assistant"]::before,
      [data-message-author-role="assistant"]::before {
        background-image: url('${AVATAR_URL}');
        content: "";
        position: absolute;
        left: -50px;
        top: 5px;
        width: 40px;
        height: 40px;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 20%;
      }

      .markdown.prose img[src^="https://cdn-ak.f.st-hatena.com/images/fotolife/"],
      [data-message-author-role="assistant"] img[src^="https://cdn-ak.f.st-hatena.com/images/fotolife/"] {
        width: 200px !important;
        height: 200px !important;
        object-fit: contain;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  };

  const findResponses = () => {
    const responses = new Set(document.querySelectorAll(ASSISTANT_SELECTORS));

    // Fallback for a future DOM that keeps conversation turns but changes role attributes.
    document.querySelectorAll('article, [data-testid^="conversation-turn-"]').forEach((turn) => {
      if (turn.matches('[data-message-author-role="user"], [data-author-role="user"], [data-role="user"]')) return;
      const label = `${turn.getAttribute('aria-label') || ''} ${turn.getAttribute('data-testid') || ''}`;
      if (/assistant|chatgpt/i.test(label) && STATE_PATTERN.test(turn.textContent || '')) responses.add(turn);
    });

    return responses;
  };

  const hideTags = (response) => {
    const walker = document.createTreeWalker(response, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.closest(`.${IMAGE_CLASS}, .${TAG_CLASS}`)) continue;
      if (STATE_PATTERN.test(node.nodeValue || '')) textNodes.push(node);
    }

    textNodes.forEach((node) => {
      const value = node.nodeValue || '';
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;

      value.replace(STATE_PATTERN_GLOBAL, (tag, offset) => {
        if (offset > lastIndex) fragment.append(value.slice(lastIndex, offset));

        const hiddenTag = document.createElement('span');
        hiddenTag.className = TAG_CLASS;
        hiddenTag.hidden = true;
        hiddenTag.setAttribute('aria-hidden', 'true');
        hiddenTag.textContent = tag;
        fragment.append(hiddenTag);
        lastIndex = offset + tag.length;
        return tag;
      });

      if (lastIndex < value.length) fragment.append(value.slice(lastIndex));
      node.replaceWith(fragment);
    });
  };

  const showState = (response) => {
    const match = (response.textContent || '').match(STATE_PATTERN);
    if (!match) return;

    const state = match[1].toLowerCase();
    let image = response.querySelector(`:scope .${IMAGE_CLASS}`);

    if (!image) {
      image = document.createElement('img');
      image.className = IMAGE_CLASS;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.style.cssText = [
        'display:block',
        'width:min(200px, 100%)',
        'height:auto',
        'margin:0 0 16px 0',
        'border-radius:14px',
      ].join(';');

      const content = response.querySelector('[data-message-content], .markdown, [class*="markdown"]') || response;
      content.insertBefore(image, content.firstChild);
    }

    if (image.dataset.state !== state) {
      image.src = `${IMAGE_BASE}${STATES[state]}`;
      image.alt = `Character state: ${state}`;
      image.dataset.state = state;
    }

    hideTags(response);
  };

  const processResponses = () => {
    scheduled = false;
    findResponses().forEach(showState);
  };

  const scheduleProcessing = () => {
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(processResponses, 80);
  };

  const start = () => {
    installCustomStyle();
    scheduleProcessing();
    new MutationObserver(scheduleProcessing).observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  };

  if (document.body) start();
  else window.addEventListener('DOMContentLoaded', start, { once: true });
})();
