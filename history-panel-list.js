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
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {afterNextRender} from '../../@polymer/polymer/lib/utils/render-status.js';
import '../../@polymer/paper-item/paper-icon-item.js';
import '../../@polymer/paper-item/paper-item-body.js';
import '../../@polymer/paper-ripple/paper-ripple.js';
import '../../@advanced-rest-client/requests-list-mixin/requests-list-styles.js';
import '../../@polymer/iron-list/iron-list.js';
import '../../@api-components/http-method-label/http-method-label.js';
import '../../@polymer/iron-scroll-threshold/iron-scroll-threshold.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@polymer/paper-checkbox/paper-checkbox.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
/**
 * `history-panel-list`
 *
 * ## Styling
 *
 * `<history-panel-list>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--history-panel-list` | Mixin applied to this elment | `{}`
 * `--history-panel-list-list` | Mixin applied to the list container | `{}`
 * `--history-panel-list-secondary-action-color` | Color of the secondary action button | `--primary-color`
 * `--history-panel-list-url-label` | Mixin applied to the URL label | `{}`
 * `--history-panel-list-method-label` | Mixin applied to the method label | `{}`
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @demo demo/dnd.html Drag and drop
 * @memberof ApiElements
 */
class HistoryPanelList extends PolymerElement {
  static get template() {
    return html`
    <style include="requests-list-styles">
    :host {
      display: block;
      position: relative;
      --paper-item-icon-width: 56px;
      font-size: var(--arc-font-body1-font-size);
      font-weight: var(--arc-font-body1-font-weight);
      line-height: var(--arc-font-body1-line-height);
      flex: 1;
      flex-basis: 0.000000001px;
      display: flex;
      flex-direction: column;
    };

    iron-list {
      flex: 1 1 auto;
    }

    .url {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 14px;
    }
    </style>
    <iron-list items="[[requests]]" id="list" selected-items="{{selectedItems}}" multi-selection="">
      <template>
        <div data-index\$="[[index]]" title\$="[[item.url]]">
          <template is="dom-if" if="[[item.hasHeader]]">
            <div class="history-group-header">[[item.header]]</div>
          </template>
          <paper-icon-item
            on-click="_toggleSelection"
            class\$="request-list-item [[_computeRowClass(selected)]]"
            draggable\$="[[_computeDraggableValue(draggableEnabled)]]" on-dragstart="_dragStart">
            <paper-checkbox slot="item-icon" checked="{{selected}}"></paper-checkbox>
            <http-method-label method="[[item.method]]"></http-method-label>
            <paper-item-body two-line\$="[[hasTwoLines]]">
              <div class="url">[[item.url]]</div>
              <div secondary="">[[item.timeLabel]]</div>
              <paper-ripple></paper-ripple>
            </paper-item-body>
            <paper-button
              class="list-action-button list-secondary-action"
              data-action="item-detail"
              on-click="_requestDetails">Details</paper-button>
            <paper-button
              class="list-action-button list-main-action"
              data-action="open-item"
              on-click="_navigateItem"
              raised="">Open</paper-button>
          </paper-icon-item>
        </div>
      </template>
    </iron-list>
    <iron-scroll-threshold
      id="scrollTheshold"
      lower-threshold="[[threshold]]"
      on-lower-threshold="_thresholdHandler"
      scroll-target="[[_scrollTarget]]"></iron-scroll-threshold>`;
  }

  static get properties() {
    return {
      requests: Array,
      /**
       * A list lower treshold when the `history-list-threshold` will be
       * fired. It should informa the app that the user nearly reached
       * the end of the list and new items should be loaded.
       */
      threshold: {
        type: Number,
        value: 120
      },
      /**
       * Scroll target for `iron-scroll-threshold`.
       * This is set in connectedCallback as the DOM has to be initialized
       * before setting this property.
       * @type {Element}
       */
      _scrollTarget: Object,
      // List of selected items on the list.
      selectedItems: {
        type: Array,
        notify: true
      },

      hasTwoLines: Boolean,
      /**
       * Enables the comonent to accept drop action with a request.
       */
      draggableEnabled: {type: Boolean, value: false}
    };
  }

  static get observers() {
    return ['_requestsChanged(requests.*)'];
  }

  connectedCallback() {
    super.connectedCallback();
    this._scrollTarget = this.$.list;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._scrollTarget = undefined;
  }

  /**
   * Notifies the list that the resize event occurred.
   * Should be called whhen content of the list changed but the list wasn't
   * visible at the time.
   */
  notifyResize() {
    this.$.list.notifyResize();
  }

  _thresholdHandler(e) {
    if (this.__ignoreTreshold) {
      e.target.clearTriggers();
      return;
    }
    const r = this.requests;
    if (!r || !r.length) {
      return;
    }
    this.dispatchEvent(new CustomEvent('list-items-threshold'));
  }

  _requestsChanged(record) {
    if (!this.__ignoreTreshold && record &&
      (record.path === 'requests.length' || record.path === 'requests')) {
      this.$.scrollTheshold.clearTriggers();
      this.__ignoreTreshold = true;
      afterNextRender(this, () => {
        this.__ignoreTreshold = false;
      });
    }
  }

  _requestDetails(e) {
    e.preventDefault();
    e.stopPropagation();

    this.dispatchEvent(new CustomEvent('list-item-details', {
      detail: {
        request: e.model.get('item')
      }
    }));
  }

  _navigateItem(e) {
    e.preventDefault();
    e.stopPropagation();

    const id = e.model.get('item._id');
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

  _toggleSelection(e) {
    this.$.list.toggleSelectionForIndex(e.model.get('index'));
  }

  /**
   * Computes list item row class
   * @param {Boolean} selected True if the item was selected
   * @return {String} Item class name dependeing on selection state
   */
  _computeRowClass(selected) {
    return selected ? 'iron-selected' : '';
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
    const request = e.model.get('item');
    const data = JSON.stringify(request);
    e.dataTransfer.setData('arc/request-object', data);
    e.dataTransfer.setData('arc/history-request', request._id);
    e.dataTransfer.setData('arc-source/history-panel', request._id);
    e.dataTransfer.effectAllowed = 'copy';
  }
  /**
   * Computes value for the `draggable` property of the list item.
   * When `draggableEnabled` is set it returns true which is one of the
   * conditions to enable drag and drop on an element.
   * @param {Boolean} draggableEnabled Current value of `draggableEnabled`
   * @return {String} `true` or `false` (as string) depending on the argument.
   */
  _computeDraggableValue(draggableEnabled) {
    return draggableEnabled ? 'true' : 'false';
  }
}
window.customElements.define('history-panel-list', HistoryPanelList);
