requirejs.config({

    baseUrl: 'src/app',
    paths: {
        'jquery': '../../vendor/jquery/jquery',
        'q': '../../vendor/q/q',
        'lodash': '../../vendor/lodash/dist/lodash',
        'webglUtils': '../../vendor/webgl-lib/webgl-utils',
        'webglDebug': '../../vendor/webgl-lib/webgl-debug',
        'cuonUtils': '../../vendor/webgl-lib/cuon-utils',
        'cuonMatrix': '../../vendor/webgl-lib/cuon-matrix'
    },
    shim: {
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

    }
});

//define a modernizer module
define('modernizr', [], Modernizr);


define(['viewer', 'common/viewUtil'], function(viewer, viewUtil) {
    viewUtil.showScreen('splash-screen');
    setTimeout(function() {
        viewer.initialize();
    }, 10000000);    
});