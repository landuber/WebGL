requirejs.config({

    baseUrl: 'src/app',
    paths: {
        'jquery': '../../vendor/jquery/jquery',
        'q': '../../vendor/q/q',
        'lodash': '../../vendor/lodash/dist/lodash',
        'glm': '../../vendor/gl-matrix/dist/gl-matrix'
    }
});

//define a modernizer module
define('modernizr', [], Modernizr);


define(['viewer', 'common/viewUtil'], function(viewer, viewUtil) {
    viewUtil.showScreen('splash-screen');
    viewer.initialize().fail(function(error) {
         console.log(error);
    });
});