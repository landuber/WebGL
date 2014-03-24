requirejs.config({

    baseUrl: 'src/app',
    paths: {
        'jquery': '../../vendor/jquery/jquery',
        'q': '../../vendor/q/q',
        'lodash': '../../vendor/lodash/dist/lodash'
    }
});

//define a modernizer module
define('modernizr', [], Modernizr);


define(['viewer', 'common/viewUtil'], function(viewer, viewUtil) {
    viewUtil.showScreen('splash-screen');
    viewer.initialize();
});