import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
// import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
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
});
