// ==UserScript==
// @name         ChatGPT Character State
// @namespace    https://github.com/tsukao2240/chatgpt-character-images
// @version      1.0.0
// @description  Show a character image for the state tag in each ChatGPT response.
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
  let scheduled = false;

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
      if (node.parentElement?.closest(`.${IMAGE_CLASS}`)) continue;
      if (STATE_PATTERN.test(node.nodeValue || '')) textNodes.push(node);
    }

    textNodes.forEach((node) => {
      node.nodeValue = (node.nodeValue || '').replace(STATE_PATTERN_GLOBAL, '');
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
