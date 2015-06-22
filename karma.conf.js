// Set `DEBUG=true karma start` to enable some debugging options.
var DEBUG = process.env.DEBUG;

module.exports = function(config) {

  config.set({
    basePath: '',

    // The test runner name. Change to jasmine, jest, whatever. Must load
    // a matching karma plugin later in the plugins array.
    frameworks: ['mocha'],

    // Can be a single file, array, or glob of files.
    files: [
      'test/ajax.js'
    ],

    // Any files to ignore.
    exclude: [],

    // Run webpack to give us module loader support, sourcemap to give us correct
    // line numbers for errors.
    preprocessors: {
      'test/ajax.js': ['webpack', 'sourcemap']
    },

    // Plugins loaded by karma.
    plugins: [
      require('karma-webpack'),
      require('karma-mocha'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-junit-reporter'),
      require('karma-sourcemap-loader')
    ],

    // Any options to webpack.
    webpack: {},

    webpackServer: {
      stats: {
        colors: true
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'junit'],

    junitReporter: {
      outputFile: 'reports/karma-test-results.xml',
      suite: '',
    },

    // Web server port.
    port: 9876,

    // Enable / disable colors in the output (reporters and logs).
    colors: true,

    // Level of logging
    // Possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    // Enable / disable watching file and executing tests whenever any file changes
    autoWatch: DEBUG,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Firefox', 'Chrome'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: !DEBUG
  });
};
