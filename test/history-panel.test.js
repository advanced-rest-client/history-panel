import { fixture, assert, aTimeout, nextFrame, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../history-panel.js';

describe('<history-panel>', function() {
  async function basicFixture(requests) {
    return await fixture(html`<history-panel noauto noautoprojects></history-panel>`);
  }

  describe('get listHidden', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns false when isSearch is true', () => {
      element.isSearch = true;
      assert.isFalse(element.listHidden);
    });

    it('Returns true when hasRequests is false', () => {
      element._hasRequests = false;
      assert.isTrue(element.listHidden);
    });
  });

  describe('_navigateHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets detailsOpened to false', () => {
      element.detailsOpened = true;
      element._navigateHandler();
      assert.isFalse(element.detailsOpened);
    });
  });

  describe('_onDetails()', () => {
    let element;
    let eData;
    beforeEach(async () => {
      element = await basicFixture();
      eData = {
        detail: {
          request: DataGenerator.generateHistoryObject()
        }
      };
    });

    it('Sets request on request details dialog', () => {
      element._onDetails(eData);
      const node = element.shadowRoot.querySelector('#requestDetails');
      assert.deepEqual(eData.detail.request, node.request);
    });

    it('Opens request details dialog', async () => {
      element._onDetails(eData);
      await aTimeout();
      assert.isTrue(element.detailsOpened);
    });
  });

  describe('_loadRequestDetails()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.detailsOpened = true;
      const node = element.shadowRoot.querySelector('#requestDetails');
      node.request = {
        _id: 'test'
      };
    });

    it('calls _openRequest()', () => {
      // event fireing is defined in the mixin
      const spy = sinon.spy(element, '_openRequest');
      element._loadRequestDetails();
      assert.isTrue(spy.called);
    });

    it('re-sets detailsOpened', () => {
      element._loadRequestDetails();
      assert.isFalse(element.detailsOpened);
    });
  });

  describe('_searchHandler()', () => {
    let element;
    let arg;
    beforeEach(async () => {
      element = await basicFixture();
      arg = {
        target: {
          value: 'test'
        }
      };
    });

    it('Calls query() function', () => {
      let called = false;
      element.query = () => called = true;
      element._searchHandler(arg);
      assert.isTrue(called);
    });

    it('Passes value to query function', () => {
      let value;
      element.query = (input) => value = input;
      element._searchHandler(arg);
      assert.equal(value, 'test');
    });
  });

  describe('Data export', () => {
    describe('All data export', () => {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('opens export options from main menu', () => {
        const node = element.shadowRoot.querySelector('[data-action="export-all"]');
        MockInteractions.tap(node);
        assert.isTrue(element._exportOptionsOpened);
      });

      it('sets export items to all (true flag)', () => {
        const node = element.shadowRoot.querySelector('[data-action="export-all"]');
        MockInteractions.tap(node);
        assert.isTrue(element._exportItems);
      });

      it('opening export dialog closes main menu and removes selection', async () => {
        const menu = element.shadowRoot.querySelector('#mainMenu');
        MockInteractions.tap(menu);
        // This won't full open the dropdown but it is not relevant
        await aTimeout();
        const node = element.shadowRoot.querySelector('[data-action="export-all"]');
        MockInteractions.tap(node);
        await aTimeout();
        assert.isFalse(menu.opened);
        const opts = element.shadowRoot.querySelector('#mainMenuOptions');
        assert.equal(opts.selected, null);
      });

      it('opens export dialog', async () => {
        const node = element.shadowRoot.querySelector('[data-action="export-all"]');
        MockInteractions.tap(node);
        await aTimeout(100);
        const dialog = element.shadowRoot.querySelector('#exportOptionsContainer');
        const display = getComputedStyle(dialog).display;
        assert.notEqual(display, 'none');
      });

      it('requests data export when export dialog is accepted', async () => {
        element.openExportAll();
        // the export event is handled by a mixin and it is tested there.
        // This tests for calling the export function.
        const spy = sinon.spy(element, '_dispatchExportData');
        const node = element.shadowRoot.querySelector('export-options');
        node.dispatchEvent(new CustomEvent('accept', {
          detail: {
            options: {}
          }
        }));
        assert.isTrue(spy.calledOnce);
        const requestArg = spy.args[0][0];
        assert.isTrue(requestArg, 'requests are set to true');
        const detailArg = spy.args[0][1];
        assert.typeOf(detailArg, 'object', 'has the detail argument');
        assert.equal(detailArg.options.kind, 'ARC#HistoryExport', 'has "kind" property on the options');
      });

      it('opens drive export toast conformation', async () => {
        element.addEventListener('arc-data-export', (e) => {
          e.detail.result = Promise.resolve();
        });
        element._doExportItems(true, {
          options: {
            provider: 'drive'
          }
        });
        await aTimeout();
        const toast = element.shadowRoot.querySelector('#driveSaved');
        assert.isTrue(toast.opened);
      });

      it('clears _exportItems when export finishes', async () => {
        element._doExportItems(true, {
          options: {
            provider: 'file'
          }
        });
        await aTimeout();
        assert.isUndefined(element._exportItems);
      });

      it('opens error toast when export error', async () => {
        element.addEventListener('arc-data-export', (e) => {
          e.detail.result = Promise.reject(new Error('test'));
        });
        element._doExportItems(true, {
          options: {
            provider: 'drive'
          }
        });
        await aTimeout();
        const toast = element.shadowRoot.querySelector('#errorToast');
        assert.isTrue(toast.opened, 'the toast is opened');
        assert.equal(toast.text, 'test', 'Error message is set');
      });

      it('closes export dialog when it is accepted', async () => {
        element.openExportAll();
        await aTimeout();
        const node = element.shadowRoot.querySelector('export-options');
        node.dispatchEvent(new CustomEvent('accept', {
          detail: {
            options: {}
          }
        }));
        assert.isFalse(element._exportOptionsOpened);
      });

      it('cancels export when export dialog is cancelled', async () => {
        element.openExportAll();
        await aTimeout();
        const node = element.shadowRoot.querySelector('export-options');
        node.dispatchEvent(new CustomEvent('cancel'));
        assert.isFalse(element._exportOptionsOpened, 'dialog is closed');
        assert.isUndefined(element._exportItems, 'items are cleared');
      });
    });

    describe('Selected data export', () => {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
        element.requests = DataGenerator.generateHistoryRequestsData({
          requestsSize: 2
        });
        element.selectedItems = element.requests;
        await nextFrame();
      });

      it('opens export options from selection menu', () => {
        const node = element.shadowRoot.querySelector('[data-action="export-selected"]');
        MockInteractions.tap(node);
        assert.isTrue(element._exportOptionsOpened);
      });

      it('sets export items to selected', () => {
        const node = element.shadowRoot.querySelector('[data-action="export-selected"]');
        MockInteractions.tap(node);
        assert.equal(element._exportItems, element.selectedItems);
      });

      it('opens export dialog', async () => {
        const node = element.shadowRoot.querySelector('[data-action="export-selected"]');
        MockInteractions.tap(node);
        await aTimeout(100);
        const dialog = element.shadowRoot.querySelector('#exportOptionsContainer');
        const display = getComputedStyle(dialog).display;
        assert.notEqual(display, 'none');
      });

      it('requests data export when export dialog is accepted', async () => {
        element._onExportSelected();
        const spy = sinon.spy(element, '_dispatchExportData');
        const node = element.shadowRoot.querySelector('export-options');
        node.dispatchEvent(new CustomEvent('accept', {
          detail: {
            options: {}
          }
        }));
        assert.isTrue(spy.calledOnce);
        const requestArg = spy.args[0][0];
        assert.equal(requestArg, element.selectedItems);
      });
    });
  });

  describe('Data delete', () => {
    describe('All data delete', () => {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('opens delete confirmation dialog', () => {
        const node = element.shadowRoot.querySelector('[data-action="delete-all"]');
        MockInteractions.tap(node);
        const dialog = element.shadowRoot.querySelector('#dataClearDialog');
        assert.isTrue(dialog.opened);
      });

      it('opening delete dialog closes main menu and removes selection', async () => {
        const menu = element.shadowRoot.querySelector('#mainMenu');
        MockInteractions.tap(menu);
        await aTimeout();
        const node = element.shadowRoot.querySelector('[data-action="delete-all"]');
        MockInteractions.tap(node);
        await aTimeout();
        assert.isFalse(menu.opened);
        const opts = element.shadowRoot.querySelector('#mainMenuOptions');
        assert.equal(opts.selected, null);
      });

      it('requests file export for all requests', async () => {
        const spy = sinon.spy(element, '_dispatchExportData');
        const node = element.shadowRoot.querySelector('[data-action="delete-export-all"]');
        MockInteractions.tap(node);
        assert.isTrue(spy.calledOnce);
        const requestArg = spy.args[0][0];
        assert.isTrue(requestArg, 'requests are set to true');
        const detailArg = spy.args[0][1];
        assert.typeOf(detailArg, 'object', 'has the detail argument');
        assert.equal(detailArg.options.kind, 'ARC#HistoryExport', 'has "kind" property on the options');
        assert.equal(detailArg.options.provider, 'file', 'has "provider" property on the options');
        assert.notEmpty(detailArg.options.file, 'has "file" property on the options');
      });

      it('does not delete data when dialog is cancelled', async () => {
        const dialog = element.shadowRoot.querySelector('#dataClearDialog');
        dialog.opened = true;
        await aTimeout();
        const spy = sinon.spy(element, '_clearDatastore');
        MockInteractions.click(element);
        await aTimeout(100);
        assert.isFalse(dialog.opened);
        assert.isFalse(spy.called);
      });

      it('clears the data store when accepted', async () => {
        const spy = sinon.spy();
        element.addEventListener('destroy-model', spy);
        const dialog = element.shadowRoot.querySelector('#dataClearDialog');
        dialog.opened = true;
        await aTimeout();
        const node = element.shadowRoot.querySelector('[dialog-confirm]');
        MockInteractions.tap(node);
        await aTimeout(100);
        assert.isFalse(dialog.opened, 'dialog is not opened');
        assert.isTrue(spy.calledOnce, 'delete event is dispatched');
        assert.deepEqual(spy.args[0][0].detail.models, ['history'], 'delete event is dispatched');
      });

      it('opens error toast when delete error', async () => {
        element.addEventListener('destroy-model', (e) => {
          e.detail.result = [Promise.reject(new Error('test'))];
        });
        const dialog = element.shadowRoot.querySelector('#dataClearDialog');
        dialog.opened = true;
        await aTimeout();
        const node = element.shadowRoot.querySelector('[dialog-confirm]');
        MockInteractions.tap(node);
        await aTimeout(100);
        const toast = element.shadowRoot.querySelector('#dataClearErrorToast');
        assert.isTrue(toast.opened, 'delete error toast is rendered');
      });
    });

    describe('Selected data delete', () => {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
        element.requests = DataGenerator.generateHistoryRequestsData({
          requestsSize: 2
        });
        element.selectedItems = element.requests;
        await nextFrame();
      });

      it('closes the menu when delete option is clicked', async () => {
        element._delete = () => {};
        const node = element.shadowRoot.querySelector('[data-action="delete-selected"]');
        const options = element.shadowRoot.querySelector('#historyListMenuOptions');
        MockInteractions.tap(node);
        await aTimeout();
        assert.equal(options.selected, null);
      });

      it('calls delete() with selected items', () => {
        let items;
        element._delete = (arg) => items = arg;
        const node = element.shadowRoot.querySelector('[data-action="delete-selected"]');
        MockInteractions.tap(node);
        assert.equal(items, element.selectedItems);
      });
    });

    describe('_delete()', () => {
      let element;
      beforeEach(async () => {
        const requests = await DataGenerator.insertHistoryRequestData({
          requestsSize: 3
        });
        element = await basicFixture();
        await element._loadPage();
        /* eslint-disable-next-line */
        element.requests = requests;
        /* eslint-disable-next-line */
        element.selectedItems = requests.slice(0, 2);
        await nextFrame();
      });

      afterEach(async () => {
        await DataGenerator.destroyHistoryData();
      });

      it('deletes selected requests', async () => {
        await element._delete(element.selectedItems);
        element.reset();
        await element._loadPage();
        assert.lengthOf(element.requests, 1);
      });

      it('sets _latestDeleted', async () => {
        const id = element.selectedItems[0]._id;
        await element._delete(element.selectedItems);
        assert.lengthOf(element._latestDeleted, 2, '_latestDeleted is set');
        const item = element._latestDeleted[0];
        assert.equal(item._id, id, 'sets _id proeprty');
        assert.include(item._rev, '2-', 'sets updated _rev proeprty');
      });

      it('opens confirmation toast', async () => {
        await element._delete(element.selectedItems);
        const toast = element.shadowRoot.querySelector('#deleteToast');
        assert.isTrue(toast.opened);
      });

      it('clears the selection', async () => {
        await element._delete(element.selectedItems);
        assert.isUndefined(element.selecteditems);
      });

      it('reverts the delete', async () => {
        await element._delete(element.selectedItems);
        await element.revertDeleted();
        element.reset();
        await element._loadPage();
        assert.lengthOf(element.requests, 3);
      });
    });
  });

  describe('revertDeleted()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('closes delete toast', async () => {
      const toast = element.shadowRoot.querySelector('#deleteToast');
      toast.opened = true;
      await element.revertDeleted();
      assert.isFalse(toast.opened);
    });

    it('does nothing when no items to revert', async () => {
      const model = element.requestModel;
      const spy = sinon.spy(model, 'revertRemove');
      await element.revertDeleted();
      assert.isFalse(spy.called);
    });

    it('renders error toast when revering error', async () => {
      const model = element.requestModel;
      model.revertRemove = () => Promise.reject(new Error('test'));
      element._latestDeleted = [{ _id: 'test' }];
      try {
        await element.revertDeleted();
      } catch (e) {
        // ..
      }
      const toast = element.shadowRoot.querySelector('#revertError');
      assert.isTrue(toast.opened);
    });
  });

  describe('_generateFileName()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Generates file name', () => {
      const result = element._generateFileName();
      assert.match(result, /^arc-history-export-[0-9]{4}-[0-9]{2}-[0-9]{2}.arc$/);
    });
  });

  describe('_updateListStyles()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.requests = DataGenerator.generateHistoryRequestsData({
        requestsSize: 2
      });
      await nextFrame();
    });

    it('Calls _applyListStyles() for default type', () => {
      const spy = sinon.spy(element, '_applyListStyles');
      element._updateListStyles('default');
      assert.equal(spy.args[0][0], 56);
      assert.ok(spy.args[0][1]);
    });

    it('Calls _applyListStyles() for comfortable type', () => {
      const spy = sinon.spy(element, '_applyListStyles');
      element._updateListStyles('comfortable');
      assert.equal(spy.args[0][0], 40);
      assert.ok(spy.args[0][1]);
    });

    it('Calls _applyListStyles() for compact type', () => {
      const spy = sinon.spy(element, '_applyListStyles');
      element._updateListStyles('compact');
      assert.equal(spy.args[0][0], 36);
      assert.ok(spy.args[0][1]);
    });
  });

  describe('DOM manipulation', () => {
    describe('No data', () => {
      before(async () => {
        await DataGenerator.destroyHistoryData();
      });

      let element;
      beforeEach(async () => {
        element = await basicFixture();
        await element._loadPage();
        await nextFrame();
      });

      it('hasRequests is false', () => {
        assert.isFalse(element.hasRequests);
      });

      it('empty message is rendered', () => {
        const node = element.shadowRoot.querySelector('.empty-info');
        assert.ok(node);
      });

      it('The list is not rendered', () => {
        const list = element.shadowRoot.querySelector('history-panel-list');
        assert.notOk(list);
      });

      it('Selection menu is not rendered', () => {
        const node = element.shadowRoot.querySelector('.selection-options');
        assert.notOk(node);
      });
    });

    describe('With data', () => {
      before(async () => {
        await DataGenerator.insertHistoryRequestData();
      });

      after(async () => {
        await DataGenerator.destroyHistoryData();
      });

      let element;
      beforeEach(async () => {
        element = await basicFixture();
        await element._loadPage();
        await nextFrame();
      });

      it('hasRequests is true', () => {
        assert.isTrue(element.hasRequests);
      });

      it('empty message is not rendered', () => {
        const node = element.shadowRoot.querySelector('.empty-info');
        assert.notOk(node);
      });

      it('The list is rendered', () => {
        const list = element.shadowRoot.querySelector('history-panel-list');
        assert.ok(list);
      });

      it('Selection menu is rendered', () => {
        const node = element.shadowRoot.querySelector('.selection-options');
        assert.ok(node);
      });
    });
  });

  describe('_editRequestDetails()', () => {
    let request;
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await element._loadPage();
      await nextFrame();
      request = DataGenerator.generateHistoryObject();
      const details = element.shadowRoot.querySelector('#requestDetails');
      details.request = request;
      /* eslint-disable-next-line */
      element.detailsOpened = true;
    });

    it('Closes request details dialog', () => {
      element._editRequestDetails();
      assert.isFalse(element.detailsOpened);
    });

    it('Opens request editor dialog', () => {
      element._editRequestDetails();
      assert.isTrue(element.editorOpened);
    });

    it('Clears request on detail dialog', () => {
      element._editRequestDetails();
      const details = element.shadowRoot.querySelector('#requestDetails');
      assert.isUndefined(details.request);
    });

    it('Sets request on editor dialog', () => {
      element._editRequestDetails();
      const editor = element.shadowRoot.querySelector('#requestEditor');
      assert.typeOf(editor.request, 'object');
    });

    it('Set request is a shallow copy', () => {
      element._editRequestDetails();
      const editor = element.shadowRoot.querySelector('#requestEditor');
      editor.request.url = 'test';
      assert.notEqual(request.url, 'test');
    });
  });

  describe('_cancelRequestEdit()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.editorOpened = true;
      await element._loadPage();
      await nextFrame();
    });

    it('Closes editor dialog', () => {
      element._cancelRequestEdit();
      assert.isFalse(element.editorOpened);
    });
  });

  describe('_saveRequestEdit()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.editorOpened = true;
      await element._loadPage();
      const editor = element.shadowRoot.querySelector('#requestEditor');
      editor.request = DataGenerator.generateHistoryObject();
      await nextFrame();
    });

    it('Closes editor dialog', () => {
      element._saveRequestEdit();
      assert.isFalse(element.editorOpened);
    });

    it('Clears request from the editor', () => {
      element._saveRequestEdit();
      const editor = element.shadowRoot.querySelector('#requestEditor');
      assert.isUndefined(editor.request);
    });
  });

  describe('Export panel propertis', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await element._loadPage();
      element.openExportAll();
      await nextFrame();
    });

    it('_exportOptions are set on the panel', () => {
      assert.typeOf(element._exportOptions, 'object', 'Object is set');
      assert.match(element._exportOptions.file,
        /^arc-history-export-[0-9]{4}-[0-9]{2}-[0-9]{2}.arc$/, 'File name is set');
      assert.equal(element._exportOptions.provider, 'file', 'Export provider is set');
      assert.typeOf(element._exportOptions.providerOptions, 'object', 'provider options is set');
      assert.deepEqual(element._exportOptions.providerOptions.parents, ['My Drive'], 'Default parent is set');
    });

    it('File property is set on export panel', () => {
      const node = element.shadowRoot.querySelector('export-options');
      assert.match(node.file,
        /^arc-history-export-[0-9]{4}-[0-9]{2}-[0-9]{2}.arc$/);
    });

    it('Provider property is set on export panel', () => {
      const node = element.shadowRoot.querySelector('export-options');
      assert.equal(node.provider, 'file');
    });

    it('provider-options property is set on export panel', () => {
      const node = element.shadowRoot.querySelector('export-options');
      assert.deepEqual(node.providerOptions, {
        parents: ['My Drive']
      });
    });
  });
});
