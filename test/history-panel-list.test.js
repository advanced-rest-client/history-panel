import { fixture, assert, nextFrame, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../history-panel-list.js';

describe('<history-panel-list>', function() {
  async function basicFixture(requests) {
    return await fixture(html`<history-panel-list
      style="height: 300px;overflow: auto"
      .requests="${requests}"></history-panel-list>`);
  }

  async function draggableFixture(requests) {
    return await fixture(html`<history-panel-list
      draggableenabled
      .requests="${requests}"></history-panel-list>`);
  }

  // DataTransfer polyfill
  if (typeof DataTransfer === 'undefined') {
    class DataTransfer {
      setData(type, data) {
        this._data[type] = data;
      }
      getData(type) {
        if (!this._data) {
          return null;
        }
        return this._data[type];
      }
    }
    window.DataTransfer = DataTransfer;
  }

  describe('no items', () => {
    it('can be created without items', async () => {
      await basicFixture();
    });
  });

  describe('_scrollHandler()', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateHistoryRequestsData({
        requestsSize: 30
      });
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture(requests);
    });

    it('Does nothing when scroll treshold is not reached', async () => {
      const spy = sinon.spy();
      element.addEventListener('list-items-threshold', spy);
      element._scrollHandler();
      assert.isFalse(spy.called);
    });

    it('Calls loadNext() when scroll treshold is reached', () => {
      const spy = sinon.spy();
      element.addEventListener('list-items-threshold', spy);
      element.scrollTop = element.scrollHeight;
      element._scrollHandler();
      assert.isTrue(spy.called);
    });
  });

  describe('_navigateItem()', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateHistoryRequestsData({
        requestsSize: 30
      });
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture(requests);
    });

    it('Dispatches "navigate" event when opend button click', () => {
      const node = element.shadowRoot.querySelector('[data-action="open-item"]');
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      MockInteractions.tap(node);
      assert.isTrue(spy.called);
    });

    it('Base is set', () => {
      const node = element.shadowRoot.querySelector('[data-action="open-item"]');
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      MockInteractions.tap(node);
      assert.equal(spy.args[0][0].detail.base, 'request');
    });

    it('Type is set', () => {
      const node = element.shadowRoot.querySelector('[data-action="open-item"]');
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      MockInteractions.tap(node);
      assert.equal(spy.args[0][0].detail.type, 'history');
    });

    it('Id is set', () => {
      const node = element.shadowRoot.querySelector('[data-action="open-item"]');
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      MockInteractions.tap(node);
      assert.typeOf(spy.args[0][0].detail.id, 'string');
    });
  });

  describe('_requestDetails()', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateHistoryRequestsData({
        requestsSize: 30
      });
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture(requests);
    });

    it('Dispatches "list-item-details"', () => {
      const node = element.shadowRoot.querySelector('[data-action="item-detail"]');
      const spy = sinon.spy();
      element.addEventListener('list-item-details', spy);
      MockInteractions.tap(node);
      assert.isTrue(spy.called);
    });

    it('Request is set', () => {
      const node = element.shadowRoot.querySelector('[data-action="item-detail"]');
      const spy = sinon.spy();
      element.addEventListener('list-item-details', spy);
      MockInteractions.tap(node);
      assert.typeOf(spy.args[0][0].detail.request, 'object');
    });
  });

  describe('selection handling', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateHistoryRequestsData({
        requestsSize: 30
      });
      requests[0].hasHeader = true;
      requests[0].header = 'test';
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture(requests);
    });

    it('sets selectedIndexes', async () => {
      const items = element._list.items;
      MockInteractions.tap(items[0]);
      await nextFrame();
      assert.deepEqual(element.selectedIndexes, [0], 'first item is selected');
      MockInteractions.tap(items[2]);
      await nextFrame();
      assert.deepEqual(element.selectedIndexes, [0, 2], 'third item is selected');
    });

    it('sets selectedItems', async () => {
      const items = element._list.items;
      MockInteractions.tap(items[0]);
      await nextFrame();
      assert.deepEqual(element.selectedItems, [requests[0]], 'first item is selected');
      MockInteractions.tap(items[2]);
      await nextFrame();
      assert.deepEqual(element.selectedItems, [requests[0], requests[2]], 'third item is selected');
    });

    it('selects a checkbox with item selection', async () => {
      const items = element._list.items;
      MockInteractions.tap(items[1]);
      await nextFrame();
      const node = items[1].querySelector('anypoint-checkbox');
      assert.isTrue(node.checked);
    });

    it('dispatches selecteditems-changed with selection', async () => {
      const items = element._list.items;
      const spy = sinon.spy();
      element.addEventListener('selecteditems-changed', spy);
      MockInteractions.tap(items[1]);
      assert.isTrue(spy.called, 'event is called');
      assert.deepEqual(spy.args[0][0].detail.value, [requests[1]], 'has value');
    });

    it('history header cannot be selected', async () => {
      const node = element.shadowRoot.querySelector('.history-group-header');
      MockInteractions.tap(node);
      assert.isUndefined(element.selectedIndexes);
    });

    it('clears selection via clearSelection()', async () => {
      const items = element._list.items;
      MockInteractions.tap(items[0]);
      MockInteractions.tap(items[1]);
      await nextFrame();
      element.clearSelection();
      assert.deepEqual(element.selectedIndexes, []);
    });
  });

  describe('_dragStart()', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateHistoryRequestsData({
        requestsSize: 30
      });
    });

    let element;
    beforeEach(async () => {
      element = await draggableFixture(requests);
    });

    function dispatch(element) {
      const node = element.shadowRoot.querySelector('anypoint-icon-item');
      const e = new Event('dragstart');
      e.dataTransfer = new DataTransfer();
      node.dispatchEvent(e);
      return e;
    }

    it('sets arc/request-object transfer data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc/request-object');
      assert.typeOf(data, 'string');
    });

    it('Sets arc/history-request data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc/history-request');
      assert.equal(data, element.requests[0]._id);
    });

    it('Sets arc-source/history-panel transfer data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc-source/history-panel');
      assert.equal(data, element.requests[0]._id);
    });

    it('Ignores event when draggableEnabled not set', () => {
      element.draggableEnabled = false;
      const e = dispatch(element);
      assert.isUndefined(e.dropEffect);
    });

    it('Ignores event when draggableEnabled not set', () => {
      element.draggableEnabled = false;
      const e = dispatch(element);
      assert.isUndefined(e.dropEffect);
    });
  });

  describe('a11y', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateHistoryRequestsData({
        requestsSize: 3
      });
    });

    let element;
    beforeEach(async () => {
      element = await draggableFixture(requests);
    });

    it('is accessible with list items', async () => {
      await assert.isAccessible(element);
    });

    it('is accessible with selected items', async () => {
      const items = element._list.items;
      MockInteractions.tap(items[0]);
      MockInteractions.tap(items[2]);
      await nextFrame();
      await assert.isAccessible(element);
    });
  });
});
