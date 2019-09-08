/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html, css } from 'lit-element';
import { AnypointMenuMixin } from '@anypoint-web-components/anypoint-menu-mixin/anypoint-menu-mixin.js';
import styles from '@advanced-rest-client/requests-list-mixin/requests-list-styles.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-item/anypoint-item-body.js';
import '@api-components/http-method-label/http-method-label.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';

class HistoryPanelListWrapper extends AnypointMenuMixin(LitElement) {
  render() {
    return html`<slot></slot>`;
  }
}
window.customElements.define('history-panel-list-wrapper', HistoryPanelListWrapper);

/**
 * `history-panel-list`
 *
 * @customElement
 * @demo demo/index.html
 * @demo demo/dnd.html Drag and drop
 * @memberof ApiElements
 */
class HistoryPanelList extends LitElement {
  static get styles() {
    return [
      styles,
      css`
      :host {
        display: block;
        --anypoint-item-icon-width: 56px;
        font-size: 1rem;
        font-weight: var(--arc-font-body1-font-weight);
        line-height: var(--arc-font-body1-line-height);
        overflow: auto;
      }

      .url {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: 0.84rem;
      }
      `
    ];
  }

  _listTemplate() {
    const items = this.requests || [];
    const selected = this.selectedIndexes || [];
    const { draggableEnabled, hasTwoLines, compatibility } = this;
    return items.map((item, index) => html`
      ${item.hasHeader ? html`<div class="history-group-header">${item.header}</div>` : ''}
      <anypoint-icon-item
        data-index="${index}"
        data-id="${item._id}"
        class="request-list-item"
        draggable="${draggableEnabled ? 'true' : 'false'}"
        @dragstart="${this._dragStart}"
        tabindex="-1"
        title="${item.url}"
        role="menuitem"
        ?compatibility="${compatibility}">
        <anypoint-checkbox
          slot="item-icon"
          .checked="${selected.indexOf(index) !== -1}"></anypoint-checkbox>
        <http-method-label
          method="${item.method}"></http-method-label>
        <anypoint-item-body
          ?twoline="${hasTwoLines}"
          ?compatibility="${compatibility}">
          <div class="url">${item.url}</div>
          <div secondary="">${item.timeLabel}</div>
        </anypoint-item-body>
        <anypoint-button
          data-index="${index}"
          class="list-action-button list-secondary-action"
          data-action="item-detail"
          ?compatibility="${compatibility}"
          @click="${this._requestDetails}">Details</anypoint-button>
        <anypoint-button
          data-index="${index}"
          class="list-action-button list-main-action"
          data-action="open-item"
          @click="${this._navigateItem}"
          ?compatibility="${compatibility}"
          emphasis="high">Open</anypoint-button>
      </anypoint-icon-item>`);
  }

  render() {
    return html`
    <history-panel-list-wrapper
      class="list"
      selectable="anypoint-icon-item"
      multi
      @selectedvalues-changed="${this._selectedHandler}">
      ${this._listTemplate()}
    </history-panel-list-wrapper>`;
  }

  static get properties() {
    return {
      requests: { type: Array },
      // List of selected items on the list.
      selectedItems: { type: Array },
      selectedIndexes: { type: Array },
      hasTwoLines: { type: Boolean },
      /**
       * Enables the comonent to accept drop action with a request.
       */
      draggableEnabled: { type: Boolean }
    };
  }

  get _list() {
    if (!this.__list) {
      this.__list = this.shadowRoot.querySelector('.list');
    }
    return this.__list;
  }

  get selectedItems() {
    return this._selectedItems;
  }

  set selectedItems(value) {
    const old = this._selectedItems;
    if (old === value) {
      return;
    }
    this._selectedItems = value;
    this.dispatchEvent(new CustomEvent('selecteditems-changed', {
      detail: {
        value
      }
    }));
  }

  constructor() {
    super();
    this._scrollHandler = this._scrollHandler.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.addEventListener('scroll', this._scrollHandler);
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.removeEventListener('scroll', this._scrollHandler);
  }

  clearSelection() {
    this._list.selectedValues = [];
  }
  /**
   * Called every time the element changed it's scroll position. It will call the `makeQuery`
   * function when there's less than 120px left to scroll. (also it must be opened and must not
   * already querying).
   */
  _scrollHandler() {
    if (this.querying) {
      return;
    }
    const delta = this.scrollHeight - (this.scrollTop + this.offsetHeight);
    if (delta < 120) {
      this.loadNext();
    }
  }

  loadNext() {
    this.dispatchEvent(new CustomEvent('list-items-threshold'));
  }

  _requestDetails(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const index = Number(e.currentTarget.dataset.index);
    const request = this.requests[index];

    this.dispatchEvent(new CustomEvent('list-item-details', {
      detail: {
        request
      }
    }));
  }

  _navigateItem(e) {
    e.preventDefault();
    e.stopPropagation();

    const index = Number(e.currentTarget.dataset.index);
    const request = this.requests[index];
    const id = request._id;
    this.dispatchEvent(new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        base: 'request',
        type: 'history',
        id
      }
    }));
  }

  _selectedHandler(e) {
    const value = e.detail.value || [];
    this.selectedIndexes = value;
    const requests = this.requests;
    this.selectedItems = value.map((i) => requests[i]);
  }

  /**
   * Handler for the `dragstart` event added to the list item when `draggableEnabled`
   * is set to true.
   * This function sets request data on the `dataTransfer` object with `arc/request-object`
   * mime type. The request data is a serialized JSON with request model.
   * @param {Event} e
   */
  _dragStart(e) {
    if (!this.draggableEnabled) {
      return;
    }
    const index = Number(e.currentTarget.dataset.index);
    const request = this.requests[index];
    const data = JSON.stringify(request);
    e.dataTransfer.setData('arc/request-object', data);
    e.dataTransfer.setData('arc/history-request', request._id);
    e.dataTransfer.setData('arc-source/history-panel', request._id);
    e.dataTransfer.effectAllowed = 'copy';
  }
}
window.customElements.define('history-panel-list', HistoryPanelList);
