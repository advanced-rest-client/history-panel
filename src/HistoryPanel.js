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
import { RequestsListMixin } from '@advanced-rest-client/requests-list-mixin/requests-list-mixin.js';
import { HistoryListMixin } from '@advanced-rest-client/history-list-mixin/history-list-mixin.js';
import { cache } from 'lit-html/directives/cache.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-menu-button/anypoint-menu-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-dialog/anypoint-dialog.js';
import '@advanced-rest-client/bottom-sheet/bottom-sheet.js';
import '@advanced-rest-client/saved-request-detail/saved-request-detail.js';
import '@advanced-rest-client/saved-request-editor/saved-request-editor.js';
import '@advanced-rest-client/export-options/export-options.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-progress/paper-progress.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-fab/paper-fab.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '../history-panel-list.js';
/**
 * History panel screen for Advanced REST Client.
 *
 * ### Styling
 * `<history-panel>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--history-panel` | Mixin applied to the element | `{}`
 * `--arc-font-headline` | Mixin applied to the header | `{}`
 * `--arc-font-subhead` | Mixin applied to the subheader | `{}`
 * `--history-panel-loader` | Mixin applied to the loader element | `{}`
 * `--history-panel-list` | Mixin apllied to the list element | `{}`
 * `--history-panel-toast-revert-button` | Mixin appllied to the rever button | `{}`
 * `--warning-primary-color` | Main color of the warning messages | `#FF7043`
 * `--warning-contrast-color` | Contrast color for the warning color | `#fff`
 * `--error-toast` | Mixin applied to the error toast | `{}`
 * `--empty-info` | Mixin applied to the label rendered when no data is available. | `{}`
 * `--history-panel-fab-background-color` | Bg color of fab button | `--primary-color`
 * `--history-panel-bottom-sheet` | Mixin apllied to the `<bottom-sheet>` elements | `{}`
 * `--context-menu-item-color` | Color of the dropdown menu items | ``
 * `--context-menu-item-background-color` | Background olor of the dropdown menu items | ``
 * `--context-menu-item-color-hover` | Color of the dropdown menu items when hovering | ``
 * `--context-menu-item-background-color-hover` | Background olor of the dropdown menu items when hovering | ``
 * `--bottom-sheet-width` | Width of the `<bottom-sheet>` element | `100%`
 * `--bottom-sheet-max-width` | Max width of the `<bottom-sheet>` element | `700px`
 * `--history-panel-bottom-sheet-right` | Right position of the `<bottom-sheet>` element | `40px`
 * `--history-panel-bottom-sheet-left` | Left position of the `<bottom-sheet>` element | `auto`
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 * @demo demo/dnd.html Drag and drop
 * @appliesMixin RequestsListMixin
 * @appliesMixin HistoryListMixin
 */
export class HistoryPanel extends HistoryListMixin(RequestsListMixin(LitElement)) {
  static get styles() {
    return css`
    :host {
      flex-direction: column;
      display: flex;

      font-size: var(--arc-font-body1-font-size);
      font-weight: var(--arc-font-body1-font-weight);
      line-height: var(--arc-font-body1-line-height);
      position: relative;
    }

    .header {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    h2 {
      font-size: var(--arc-font-headline-font-size);
      font-weight: var(--arc-font-headline-font-weight);
      letter-spacing: var(--arc-font-headline-letter-spacing);
      line-height: var(--arc-font-headline-line-height);
      flex: 1;
      flex-basis: 0.000000001px;
    }

    h3 {
      font-size: var(--arc-font-subhead-font-size);
      font-weight: var(--arc-font-subhead-font-weight);
      line-height: var(--arc-font-subhead-line-height);
    }

    .menu-item iron-icon {
      color: var(--context-menu-item-color);
    }

    .menu-item {
      color: var(--context-menu-item-color);
      background-color: var(--context-menu-item-background-color);
      cursor: pointer;
    }

    .menu-item:hover {
      color: var(--context-menu-item-color-hover);
      background-color: var(--context-menu-item-background-color-hover);
    }

    .menu-item:hover iron-icon {
      color: var(--context-menu-item-color-hover);
    }

    paper-progress {
      width: 100%;
    }

    history-panel-list {
      overflow: auto;
      flex: 1;
    }

    .revert-button {
      height: 38px;
    }

    .error-toast {
      background-color: var(--warning-primary-color, #FF7043);
      color: var(--warning-contrast-color, #fff);
    }

    .empty-info {
      font-size: var(--empty-info-font-size, 16px);
      color: var(--empty-info-color, rgba(0, 0, 0, 0.74));
    }

    #requestDetailsContainer,
    #requestEditorContainer,
    #exportOptionsContainer {
      width: var(--bottom-sheet-width, 100%);
      max-width: var(--bottom-sheet-max-width, 700px);
      right: var(--history-panel-bottom-sheet-right, 40px);
      left: var(--history-panel-bottom-sheet-left, auto);
    }

    #requestDetailsContainer paper-fab {
      position: absolute;
      right: 16px;
      top: -28px;
      --paper-fab-background: var(--history-panel-fab-background-color, var(--primary-color));
    }

    .selection-options {
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 56px;
    }

    .spacer {
      flex: 1;
      flex-basis: 0.000000001px;
    }`;
  }

  _headerTemplate() {
    const { compatibility } = this;
    return html`<div class="header">
      <h2>History</h2>
      <div class="header-actions">
        <anypoint-menu-button
          dynamicalign
          closeOnActivate
          id="mainMenu"
          ?compatibility="${compatibility}">
          <anypoint-icon-button
            aria-label="Activate to open context menu"
            slot="dropdown-trigger"
            ?compatibility="${compatibility}">
            <iron-icon icon="arc:more-vert" alt="more"></iron-icon>
          </anypoint-icon-button>
          <anypoint-listbox
            slot="dropdown-content"
            id="mainMenuOptions"
            ?compatibility="${compatibility}">
            <anypoint-icon-item
              class="menu-item"
              data-action="export-all"
              @click="${this.openExportAll}">
              <iron-icon icon="arc:export-variant" slot="item-icon"></iron-icon>Export all
            </anypoint-icon-item>
            <anypoint-icon-item
              class="menu-item"
              data-action="delete-all"
              @click="${this._deleteAllClick}">
              <iron-icon icon="arc:delete" slot="item-icon"></iron-icon>Delete all
            </anypoint-icon-item>
          </anypoint-listbox>
        </anypoint-menu-button>
      </div>
    </div>`;
  }

  _busyTemplate() {
    if (!this.querying) {
      return '';
    }
    return html`<paper-progress indeterminate></paper-progress>`;
  }

  _unavailableTemplate() {
    const { dataUnavailable } = this;
    if (!dataUnavailable) {
      return '';
    }
    return html`<p class="empty-info">The requests list is empty.</p>
    <p class="empty-info">Send a request from the request panel and it will appear here.</p>`;
  }

  _selectionOptionsTemplate() {
    return html`<anypoint-icon-item
      class="menu-item"
      data-action="export-selected"
      @click="${this._onExportSelected}">
      <iron-icon icon="arc:export-variant" slot="item-icon"></iron-icon>Export selected
    </anypoint-icon-item>
    <anypoint-icon-item
      class="menu-item"
      data-action="delete-selected"
      @click="${this._deleteSelected}">
      <iron-icon icon="arc:delete" slot="item-icon"></iron-icon>
      Delete selected
    </anypoint-icon-item>`;
  }

  _selectionTemplate() {
    const { listHidden, hasSelection, compatibility } = this;
    const selectedItems = this.selectedItems || [];
    return cache(listHidden ? '' : html`
    <section class="selection-options">
      <p class="selection-label">Selected: ${selectedItems.length}</p>
      ${cache(hasSelection ? html`
      <anypoint-menu-button
        dynamicalign
        ?compatibility="${compatibility}"
        closeOnActivate
        id="historyListMenu">
        <anypoint-icon-button
          ?compatibility="${compatibility}"
          aria-label="Activate to open context menu"
          slot="dropdown-trigger">
          <iron-icon icon="arc:more-vert" alt="more"></iron-icon>
        </anypoint-icon-button>
        <anypoint-listbox
          slot="dropdown-content"
          ?compatibility="${compatibility}"
          id="historyListMenuOptions">
          ${this._selectionOptionsTemplate()}
        </anypoint-listbox>
      </anypoint-menu-button>` : '')}
      <div class="spacer"></div>
      <anypoint-input
        type="search"
        nolabelfloat
        @search="${this._searchHandler}"
        ?compatibility="${compatibility}">
        <label slot="label">Search</label>
      </anypoint-input>
    </section>`);
  }

  _listTemplate() {
    const {
      listHidden,
      compatibility,
      requests,
      draggableEnabled,
      listType,
      _hasTwoLines
    } = this;
    return cache(listHidden ? '' : html`<history-panel-list
      ?compatibility="${compatibility}"
      .requests="${requests}"
      .draggableEnabled="${draggableEnabled}"
      listtype="${listType}"
      ?hastwolines="${_hasTwoLines}"
      @list-items-threshold="${this.loadNext}"
      @list-item-details="${this._onDetails}"
      @selecteditems-changed="${this._selectionHandler}"></history-panel-list>`);
  }

  _requestDetailsTemplate() {
    const { detailsOpened, compatibility } = this;
    return html`<bottom-sheet
      id="requestDetailsContainer"
      data-open-property="detailsOpened"
      @overlay-opened="${this._resizeSheetContent}"
      @overlay-closed="${this._sheetOpenedHandler}"
      .opened="${detailsOpened}">
      <paper-fab
        icon="arc:keyboard-arrow-right"
        data-action="load-request-detail"
        title="Load request"
        @click="${this._loadRequestDetails}"></paper-fab>
      <saved-request-detail
        id="requestDetails"
        ?compatibility="${compatibility}"
        @delete-request="${this._deleteRequestDetails}"
        @edit-request="${this._editRequestDetails}"></saved-request-detail>
    </bottom-sheet>`;
  }

  _requestEditorTemplate() {
    const { editorOpened, compatibility, noAutoProjects } = this;
    return html`<bottom-sheet
      id="requestEditorContainer"
      data-open-property="editorOpened"
      @overlay-opened="${this._resizeSheetContent}"
      @overlay-closed="${this._sheetOpenedHandler}"
      .opened="${editorOpened}">
      <h3>Save history request</h3>
      <saved-request-editor
        id="requestEditor"
        ?compatibility="${compatibility}"
        ?noautoprojects="${noAutoProjects}"
        @cancel="${this._cancelRequestEdit}"
        @save-request="${this._saveRequestEdit}"></saved-request-editor>
    </bottom-sheet>`;
  }

  _exportOptionsTemplate() {
    const {
      _exportOptionsOpened,
      _exportOptions,
      compatibility,
      withEncrypt
    } = this;
    return html`<bottom-sheet
      id="exportOptionsContainer"
      .opened="${_exportOptionsOpened}"
      data-open-property="_exportOptionsOpened"
      @overlay-opened="${this._resizeSheetContent}"
      @overlay-closed="${this._sheetOpenedHandler}">
      <export-options
        ?compatibility="${compatibility}"
        ?withEncrypt="${withEncrypt}"
        .file="${_exportOptions.file}"
        .provider="${_exportOptions.provider}"
        .providerOptions="${_exportOptions.providerOptions}"
        @accept="${this._acceptExportOptions}"
        @cancel="${this._cancelExportOptions}"></export-options>
    </bottom-sheet>`;
  }

  _toastsTemplate() {
    return html`<paper-toast id="errorToast" class="error-toast" duration="5000"></paper-toast>
    <paper-toast id="revertError" class="error-toast"
      text="Unable to revert changes. Please, report an issue."></paper-toast>
    <paper-toast id="noExport" class="error-toast"
      text="Export module not found. Please, report an issue."></paper-toast>
    <paper-toast id="dataClearErrorToast" class="error-toast"
      text="Datasore delete error. Please report an issue"></paper-toast>
    <paper-toast id="driveSaved" text="Requests saved on Google Drive."></paper-toast>
    <paper-toast id="deleteToast" duration="7000">
      <anypoint-button class="revert-button" @click="${this.revertDeleted}">Revert</anypoint-button>
    </paper-toast>`;
  }

  _clearDialogTemplate() {
    const {
      compatibility
    } = this;
    return html`<anypoint-dialog
      id="dataClearDialog"
      ?compatibility="${compatibility}"
      @overlay-closed="${this._onClearDialogResult}">
      <h2>Remove all data?</h2>
      <p>Maybe you should create a backup first?</p>
      <div class="buttons">
        <anypoint-button
          ?compatibility="${compatibility}"
          data-action="delete-export-all"
          @click="${this._exportAllFile}">Create backup file</anypoint-button>
        <anypoint-button
          ?compatibility="${compatibility}"
          dialog-dismiss>Cancel</anypoint-button>
        <anypoint-button
          ?compatibility="${compatibility}"
          dialog-confirm
          class="action-button" autofocus>Confirm</anypoint-button>
      </div>
    </anypoint-dialog>`;
  }

  _searchEmptyTemplate() {
    if (this.isSearch && this.searchListEmpty) {
      return html`<p>No search results.</p>`;
    }
    return '';
  }

  render() {
    return html`
    ${this.modelTemplate}
    ${this._headerTemplate()}
    ${this._busyTemplate()}
    ${this._unavailableTemplate()}
    ${this._selectionTemplate()}
    ${this._searchEmptyTemplate()}
    ${this._listTemplate()}
    ${this._requestDetailsTemplate()}
    ${this._requestEditorTemplate()}
    ${this._exportOptionsTemplate()}
    ${this._toastsTemplate()}
    ${this._clearDialogTemplate()}
    `;
  }

  static get properties() {
    return {
      /**
       * Selected items list.
       * @type {Array<Object>}
       */
      selectedItems: { type: Array },
      /**
       * When true the editor panel is rendered
       */
      editorOpened: { type: Boolean },
      /**
       * When true the details panel is rendered
       */
      detailsOpened: { type: Boolean },
      /**
       * Passed to the request editor
       */
      noAutoProjects: { type: Boolean },
      /**
       * Enables the comonent to accept drop action with a request.
       */
      draggableEnabled: { type: Boolean },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * When set is enables encryption options.
       * Currently only in the export panel.
       */
      withEncrypt: { type: Boolean },
      /**
       * Indicates that the export options panel is currently rendered.
       */
      _exportOptionsOpened: { type: Boolean },
      _exportOptions: { type: Object }
    };
  }
  /**
   * Computed value, true if the requests lists is hidden.
   * @return {Boolean}
   */
  get listHidden() {
    const { hasRequests, isSearch } = this;
    if (isSearch) {
      return false;
    }
    return !hasRequests;
  }

  get hasSelection() {
    const items = this.selectedItems;
    return !!(items && items.length);
  }

  get _requestDetails() {
    return this.shadowRoot.querySelector('#requestDetails');
  }

  get _requestEditor() {
    return this.shadowRoot.querySelector('#requestEditor');
  }

  get _list() {
    return this.shadowRoot.querySelector('history-panel-list');
  }

  constructor() {
    super();
    this._navigateHandler = this._navigateHandler.bind(this);

    this._exportOptions = {
      file: this._generateFileName(),
      provider: 'file',
      providerOptions: {
        parents: ['My Drive']
      }
    }
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.type = 'history';
    this._exportKind = 'ARC#HistoryExport';
    this.addEventListener('navigate', this._navigateHandler);
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.removeEventListener('navigate', this._navigateHandler);
  }
  /**
   * Handler for navigate action from the list
   */
  _navigateHandler() {
    if (this.detailsOpened) {
      this.detailsOpened = false;
    }
  }
  /**
   * Handles items delete event from item click.
   * @return {Promise}
   */
  async _deleteSelected() {
    this._deselectSelectionMenu();
    const data = this.selectedItems;
    if (!data.length) {
      return;
    }
    return await this._delete(data);
  }
  /**
   * Deletes a request from the details panel.
   * @return {Promise}
   */
  async _deleteRequestDetails() {
    const data = [this._requestDetails.request];
    this.detailsOpened = false;
    return await this._delete(data);
  }
  /**
   * Performs a delete action of request items.
   *
   * @param {Array<Object>} items List of deleted items.
   * @return {Promise}
   */
  async _delete(items) {
    const model = this.requestModel;
    const updated = await model.bulkDelete(this.type, items.map((item) => item._id));
    const deleted = Object.keys(updated).map((id) => {
      return {
        _id: id,
        _rev: updated[id]
      };
    });
    this._latestDeleted = deleted;
    let msg;
    if (deleted.length === 1) {
      msg = 'The request has been removed.';
    } else {
      msg = deleted.length + ' requests has been removed.';
    }
    const toast = this.shadowRoot.querySelector('#deleteToast');
    toast.text = msg;
    toast.opened = true;
    this._list.clearSelection();
  }
  /**
   * Restores removed requests.
   * It does nothing if `_latestDeleted` is not set or empty.
   *
   * @return {Promise} A promise resolved when objects were restored
   */
  async revertDeleted() {
    const toast = this.shadowRoot.querySelector('#deleteToast');
    toast.opened = false;
    const deleted = this._latestDeleted;
    if (!deleted || !deleted.length) {
      return;
    }
    const model = this.requestModel;
    try {
      await model.revertRemove(this.type, deleted);
    } catch (e) {
      const toast = this.shadowRoot.querySelector('#revertError');
      toast.opened = true;
      this._handleError(e);
    }
  }
  /**
   * Forces selection menu to close.
   */
  _deselectSelectionMenu() {
    setTimeout(() => {
      const options = this.shadowRoot.querySelector('#historyListMenuOptions');
      options.selected = null;
    });
  }
  /**
   * Removes selection from screen's main menu dropdown
   */
  _deselectMainMenu() {
    setTimeout(() => {
      const menuOptions = this.shadowRoot.querySelector('#mainMenuOptions');
      menuOptions.selected = null;
    });
  }
  /**
   * Toggles export options panel and sets export items to all currently loaded requests.
   */
  openExportAll() {
    this._exportOptionsOpened = true;
    this._exportItems = true;
    this._deselectMainMenu();
  }

  _cancelExportOptions() {
    this._exportOptionsOpened = false;
    this._exportItems = undefined;
  }
  /**
   * Creates export file for all items.
   * @return {Promise} Result of calling `_doExportItems()`
   */
  _exportAllFile() {
    const detail = {
      options: {
        file: this._generateFileName(),
        provider: 'file'
      }
    };
    return this._doExportItems(true, detail);
  }
  /**
   * Handler for `accept` event dispatched by export options element.
   * @param {CustomEvent} e
   * @return {Promise} Result of calling `_doExportItems()`
   */
  _acceptExportOptions(e) {
    this._exportOptionsOpened = false;
    const { detail } = e;
    return this._doExportItems(this._exportItems, detail);
  }
  /**
   * Calls `_dispatchExportData()` from requests lists mixin with
   * prepared arguments
   *
   * @param {Array<Object>} requests List of request to export with the project.
   * @param {String} detail Export configuration
   * @return {Promise}
   */
  async _doExportItems(requests, detail) {
    detail.options.kind = this._exportKind;
    const request = this._dispatchExportData(requests, detail);
    try {
      await request.detail.result;
      if (detail.options.provider === 'drive') {
        // TODO: Render link to the folder
        this.shadowRoot.querySelector('#driveSaved').opened = true;
      }
    } catch(cause) {
      const toast = this.shadowRoot.querySelector('#errorToast');
      toast.text = cause.message;
      toast.opened = true;
    }
    this._exportItems = undefined;
  }

  _onExportSelected() {
    this._deselectSelectionMenu();
    this._exportOptionsOpened = true;
    this._exportItems = this.selectedItems || [];
  }
  /**
   * Opens the request details applet with the request.
   * @param {CustomEvent} e
   */
  _onDetails(e) {
    this._requestDetails.request = e.detail.request;
    this.detailsOpened = false;
    setTimeout(() => {
      this.detailsOpened = true;
    });
  }
  /**
   * Fires `navigate` event for currently loaded in the details request.
   */
  _loadRequestDetails() {
    this._openRequest(this._requestDetails.request._id);
    this.detailsOpened = false;
  }
  /**
   * Handler for the `search` event on the search input.
   * Calls `query()` with input's value as argument.
   * @param {Event} e
   */
  async _searchHandler(e) {
    const { value } = e.target;
    await this.query(value);
    const list = this._list;
    if (list) {
      list.clearSelection();
    }
  }
  /**
   * Handler for delete all menu option click.
   */
  _deleteAllClick() {
    const dialog = this.shadowRoot.querySelector('#dataClearDialog');
    dialog.opened = true;
    this._deselectMainMenu();
  }
  /**
   * Called when delete datastore dialog is closed.
   * @param {CustomEvent} e
   */
  _onClearDialogResult(e) {
    if (!e.detail.confirmed) {
      return;
    }
    this._clearDatastore();
  }
  /**
   * Removes all data from the datastore and then fires
   */
  async _clearDatastore() {
    const e = this._dispatchDeleteModel();
    if (!e.detail.result) {
      return;
    }
    try {
      const result = e.detail.result;
      for(const item of result) {
        await item;
      }
    } catch (e) {
      const toast = this.shadowRoot.querySelector('#dataClearErrorToast');
      toast.opened = true;
      this._handleError(e);
    }
  }
  /**
   * Dispatches `destroy-model` with `saved` on the models list.
   * @return {CustomEvent}
   */
  _dispatchDeleteModel() {
    const e = new CustomEvent('destroy-model', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        models: [this.type],
        result: []
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Opens request details editor in place of the request details applet.
   */
  _editRequestDetails() {
    const request = Object.assign({}, this._requestDetails.request);
    this._resetHistoryObject(request);
    this._requestEditor.request = request;
    this._requestDetails.request = undefined;
    this.detailsOpened = false;
    this.editorOpened = true;
  }

  _cancelRequestEdit() {
    this.editorOpened = false;
  }
  /**
   * Handler fro save request event from the editor.
   */
  _saveRequestEdit() {
    this.editorOpened = false;
    this._requestEditor.request = undefined;
  }
  /**
   * Updates icon size CSS variable and notifies resize on the list when
   * list type changes.
   * @param {?String} type
   */
  _updateListStyles(type) {
    let size;
    switch (type) {
      case 'comfortable': size = 40; break;
      case 'compact': size = 36; break;
      default: size = 56; break;
    }
    const list = this.shadowRoot.querySelector('history-panel-list');
    this._applyListStyles(size, list);
  }
  /**
   * Generates file name for the export options panel.
   * @return {String}
   */
  _generateFileName() {
    const d = new Date();
    const year = d.getFullYear();
    let month = d.getMonth() + 1;
    let day = d.getDate();
    if (month < 10) {
      month = '0' + month;
    }
    if (day < 10) {
      day = '0' + day;
    }
    return `arc-history-export-${year}-${month}-${day}.arc`;
  }

  _selectionHandler(e) {
    this.selectedItems = e.detail.value;
  }

  _sheetOpenedHandler(e) {
    const prop = e.target.dataset.openProperty;
    this[prop] = e.detail.value;
  }
  /**
   * Resizes `bottom-sheet` content by calling `notifyResize()` on each content panel.
   * @param {CustomEvent} e
   */
  _resizeSheetContent(e) {
    const panel = e.target.querySelector(
        'saved-request-editor,saved-request-detail,export-options');
    if (panel && panel.notifyResize) {
      panel.notifyResize();
    }
  }
  /**
   * Fired when navigation was requested
   *
   * @event navigate
   * @param {String} base The base route. It's always `request`
   * @param {String} type Type of the request to open. It's always `history`
   * @param {String} id ID of the request to open.
   */
  /**
   * Fired when requests are to be deleted. Informs the model to delete items.
   *
   * @event request-objects-deleted
   * @param {Array} items List of ids to delete
   * @param {String} type Always `history-requests`
   */
  /**
   * Fired when the "revert" delete button has been used.
   * Informs the requests model to restore the data.
   *
   * @event request-objects-undeleted
   * @param {Array} items List of requests to delete
   * @param {String} type Always `history-requests`
   */
  /**
   * Dispatched when the user requested to clear the data.
   * @event destroy-model
   * @param {Array<String>} models
   */
  /**
   * Dispatched to export history data to file / drive
   *
   * @event export-data
   * @param {String} type Depending on user selection it can be `history`
   * to export all history data or `items-export` to export specific items.
   * @param {String} destination Either `drive` or `file`
   * @param {String} file Export file name
   * @param {String} kind For selection export, data kind.
   * @param {Object} items For selection export, data to export.
   */
}
