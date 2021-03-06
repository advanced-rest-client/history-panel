/* eslint-disable import/no-extraneous-dependencies */
const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('deepmerge');

module.exports = (config) => {
  config.set(
    merge(createDefaultConfig(config), {
      files: [
        // runs all files ending with .test in the test folder,
        // can be overwritten by passing a --grep flag. examples:
        //
        // npm run test -- --grep test/foo/bar.test.js
        // npm run test -- --grep test/bar/*
        {
          pattern: config.grep ? config.grep : 'test/**/*.test.js',
          type: 'module'
        },
        {
          pattern: require.resolve('web-animations-js/web-animations.min.js')
        },
        {
          pattern: require.resolve('codemirror/lib/codemirror.js')
        },
        {
          pattern: require.resolve('codemirror/mode/markdown/markdown.js')
        }
      ],

      // see the karma-esm docs for all options
      esm: {
        // if you are using 'bare module imports' you will need this option
        nodeResolve: true
      },

      client: {
        mocha: {
          timeout: 5000
        }
      },

      coverageIstanbulReporter: {
        thresholds: {
          global: {
            statements: 80,
            branches: 80,
            functions: 90,
            lines: 80
          }
        }
      },
    })
  );
  return config;
};
