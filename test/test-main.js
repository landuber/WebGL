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
        //'chai': '../../vendor/chai/chai',
        //'sinon-chai': '../../vendor/sinon-chai/lib/sinon-chai',
        //'sinon': '../../vendor/sinon/sinon',

        // application libraries
        'jquery': '../../vendor/jquery/jquery',
        'q': '../../vendor/q/q',
        'lodash': '../../vendor/lodash/dist/lodash'
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});

