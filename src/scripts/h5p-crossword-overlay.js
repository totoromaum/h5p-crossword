import Util from './h5p-crossword-util';

/** Class representing the content */
export default class Overlay {
  /**
   * @constructor
   * @param {object} params Parameters.
   * @param {HTMLElement} params.content Content to set.
   * @param {object} callbacks, Callbacks.
   */
  constructor(params, callbacks = {}) {
    this.params = Util.extend({
      container: document.body,
      content: document.createElement('div'),
      styleBase: 'h5p-crossword-overlay',
      position: {
        offsetHorizontal : 0,
        offsetVertical : 0
      },
      l10n: {
        closeWindow: 'Close'
      }
    }, params);

    this.callbacks = callbacks;
    this.callbacks.onClose = callbacks.onClose || (() => {});

    this.isVisible = false;
    this.focusableElements = [];

    this.overlay = document.createElement('div');
    this.overlay.classList.add(`${this.params.styleBase}-outer-wrapper`);
    this.overlay.classList.add('h5p-crossword-invisible');
    this.overlay.setAttribute('role', 'dialog');
    if (this.params.l10n.title) {
      this.overlay.setAttribute('aria-label', this.params.l10n.title);
    }
    this.overlay.setAttribute('aria-modal', 'true');

    this.content = document.createElement('div');
    this.content.classList.add(`${this.params.styleBase}-content`);
    this.content.appendChild(this.params.content);
    this.overlay.appendChild(this.content);

    this.buttonClose = document.createElement('button');
    this.buttonClose.classList.add(`${this.params.styleBase}-button-close`);
    this.buttonClose.setAttribute('title', this.params.l10n.closeWindow);
    this.buttonClose.addEventListener('click', () => {
      this.callbacks.onClose();
    });
    this.overlay.appendChild(this.buttonClose);

    // Trap focus if overlay is visible
    document.addEventListener('focus', event => {
      if (!this.isVisible || this.focusableElements.length === 0) {
        return;
      }

      this.trapFocus(event);
    }, true);

    // Blocker
    this.blocker = document.createElement('div');
    this.blocker.classList.add('h5p-crossword-overlay-blocker');
    this.blocker.classList.add('h5p-crossword-display-none');
  }

  /**
   * Return the DOM for this class.
   * @return {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.overlay;
  }

  /**
   * Set overlay content.
   * @param {HTMLElement} content Content to set.
   */
  setContent(content) {
    while (this.content.firstChild) {
      this.content.removeChild(this.content.firstChild);
    }
    this.content.appendChild(content);
  }

  /**
   * Trap focus in overlay.
   * @param {Event} event Focus event.
   */
  trapFocus(event) {
    if (this.isChild(event.target)) {
      this.currentFocusElement = event.target;
      return; // Focus is inside overlay
    }

    // Focus was either on first or last overlay element
    if (this.currentFocusElement === this.focusableElements[0]) {
      this.currentFocusElement = this.focusableElements[this.focusableElements.length - 1];
    }
    else {
      this.currentFocusElement = this.focusableElements[0];
    }
    this.currentFocusElement.focus();
  }

  /**
   * Check whether an HTML element is a child of the overlay.
   * @param {HTMLElement} element.
   * @return {boolean} True, if element is a child.
   */
  isChild(element) {
    const parent = element.parentNode;

    if (!parent) {
      return false;
    }

    if (parent === this.overlay) {
      return true;
    }

    return this.isChild(parent);
  }

  /**
   * Update list of focusable elements.
   */
  updateFocusableElements() {
    this.focusableElements = []
      .slice.call(this.overlay.querySelectorAll('video, audio, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(element => element.getAttribute('disabled') !== 'true' && element.getAttribute('disabled') !== true);
  }

  /**
   * Show overlay.
   */
  show() {
    if (!this.blockerAppended) {
      this.container = document.body.querySelector('.h5p-container');
      this.container.appendChild(this.blocker);
    }
    this.blockerAppended = true;

    this.overlay.classList.remove('h5p-crossword-invisible');
    this.blocker.classList.remove('h5p-crossword-display-none');

    setTimeout(() => {
      this.updateFocusableElements();
      if (this.focusableElements.length > 0) {
        this.focusableElements[0].focus();
      }

      this.isVisible = true;

      this.resize();
    }, 0);
  }

  /**
   * Hide overlay.
   */
  hide() {
    this.isVisible = false;
    this.overlay.classList.add('h5p-crossword-invisible');
    this.blocker.classList.add('h5p-crossword-display-none');
  }

  /**
   * Resize.
   */
  resize() {
    if (this.container) {
      this.content.style.maxHeight = `calc(${this.container.offsetHeight}px - 7em)`;
    }
  }
}
