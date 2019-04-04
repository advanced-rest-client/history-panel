[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/history-panel.svg)](https://www.npmjs.com/package/@advanced-rest-client/history-panel)

[![Build Status](https://travis-ci.org/advanced-rest-client/history-panel.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/history-panel)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/history-panel)

# history-panel

ARC&#39;s requests history view

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/history-panel
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import './node_modules/@advanced-rest-client/history-panel/history-panel.js';
      import './node_modules/@advanced-rest-client/arc-models/project-model.js';
      import './node_modules/@advanced-rest-client/arc-models/request-model.js';
      import './node_modules/@advanced-rest-client/arc-data-export/arc-data-export.js';
    </script>
  </head>
  <body>
    <history-panel></history-panel>
    <project-model></project-model>
    <request-model></request-model>
    <arc-data-export></arc-data-export>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from './node_modules/@polymer/polymer';
import './node_modules/@advanced-rest-client/history-panel/history-panel.js';
import './node_modules/@advanced-rest-client/arc-models/project-model.js';
import './node_modules/@advanced-rest-client/arc-models/request-model.js';
import './node_modules/@advanced-rest-client/arc-data-export/arc-data-export.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`<history-panel></history-panel>
    <project-model></project-model>
    <request-model></request-model>
    <arc-data-export></arc-data-export>`;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/history-panel
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
