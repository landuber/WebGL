var tests = [];
for (var file in window.__karma__.files) {
    if (/spec\.js$/.test(file)) {
        tests.push(file);
    }
}

require.config({
    // Karma serves files from '/base'
    baseUrl: '/base/src/app',

    paths: {
        //test libraries
        'chai': '../../vendor/chai/chai',
        'sinon-chai': '../../vendor/sinon-chai/lib/sinon-chai',
        'sinon': '../../vendor/sinon/sinon',

        // application libraries
        'jquery': '../../vendor/jquery/jquery',
        'q': '../../vendor/q/q',
        'lodash': '../../vendor/lodash/dist/lodash',
        'webglUtils': '../../vendor/webgl-lib/webgl-utils',
        'webglDebug': '../../vendor/webgl-lib/webgl-debug',
        'cuonUtils': '../../vendor/webgl-lib/cuon-utils',
        'cuonMatrix': '../../vendor/webgl-lib/cuon-matrix'
    },

    shim: {
        'sinon': {
            exports: 'sinon'
        },
        'webglUtils': {
            exports: 'webglUtils'
        },
        'webglDebug': {
            exports: 'webglDebug'
        },
        'cuonUtils': {
            exports: 'cuonUtils'
        },
        'cuonMatrix': {
            exports: 'cuonMatrix'
        }
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});

