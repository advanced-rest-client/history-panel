[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/history-panel.svg)](https://www.npmjs.com/package/@advanced-rest-client/history-panel)

[![Build Status](https://travis-ci.org/advanced-rest-client/history-panel.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/history-panel)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/history-panel)

# history-panel

Advanced REST Client history requests screen.

## Usage

### Installation
```
npm install --save @advanced-rest-client/history-panel
```

History screen comes with 2 predefied styles:

-   Material - Normal state
-   Compatibility - To provide compatibility with Anypoint design

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/history-panel/history-panel.js';
import './node_modules/@advanced-rest-client/arc-models/project-model.js';
import './node_modules/@advanced-rest-client/arc-models/request-model.js';
import './node_modules/@advanced-rest-client/arc-data-export/arc-data-export.js';

class SampleElement extends LitElement {
  get styles() {
    return css`
      history-menu {
        height: 500px;
      }
    `;
  }

  render() {
    return html`
    <history-panel draggableenabled></history-menu>

    <!-- Handles datastore and export events -->
    <project-model></project-model>
    <request-model></request-model>
    <arc-data-export></arc-data-export>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### List sizing

It is important to set implicit height of the element. It can be static value like `500px`, relative value like `100%` as long as a parent is sized for height, or a flex value, as long as parent is sized for height.
The list of requests is set to load only portion of the requests from the data store and load more when list scroll is near end. If there's no scroll then the element will load whole data store at initialization time.

### Drag and drop

API components related to a request object support drag and drop. Set `draggableenabled` property to enable the support.

The `DataTransfer` property of the drag event contains `effectAllowed` set to `copy` as this is only allowed operation on a history object. Only targets that allow the same effect will accept the history item.
The same propery contains serialized request data under `arc/request-object` media type. It contains request ID under `arc/history-request` and `arc-source/history-panel` media types.

```javascript
_dropHandler(e) {
  e.preventDefault();
  const data = e.dataTransfer.getData('arc/request-object');
  const request = JSON.parse(data);
  const id = e.dataTransfer.getData('arc/history-request');
  console.log(request, id);
}
```

## Development

```sh
git clone https://github.com/advanced-rest-client/history-panel
cd history-panel
npm install
```

### Running the tests

```sh
npm test
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
