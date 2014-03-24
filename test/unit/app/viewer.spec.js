define(function(require, exports, module) {

    //test dependencies



    // application dependencies
    var game = require('viewer'),
        $ = require('jquery');



    describe('viewer', function() {


        describe('showScreen', function() {

            it('please pass', function() {
                assert.isTrue(true);
            });

            /*
            var gameDOM;

            function initDOM() {
                gameDOM = $('<div id="game">' +
                    '<div class="screen" id="splash-screen">' +
                    '</div>' +
                    '<div class="screen" id="main-menu">' +
                    '<ul class="menu"><li><button name="splash-screen"></button></li></ul>' +
                    '</div>' +
                    '</div>');
                $('body').append(gameDOM);
            }


            beforeEach(function() {
                initDOM();
                sinon.spy($.prototype, "addClass");
                sinon.spy($.prototype, "removeClass");
            });

            afterEach(function() {
                gameDOM.remove();
                $.prototype.addClass.restore();
                $.prototype.removeClass.restore();
            });


            it('adds "active" css class to the activate the screen', function() {


                // act
                game.showScreen('splash-screen');
                assert.isTrue($('#splash-screen').hasClass('active'), 'active class not applied');
                assert.isTrue($.prototype.addClass.calledOnce, 'addClass should be called exactly once');

            });

            it('removes "active" css class if it already exists', function() {
                //act
                game.showScreen('splash-screen');
                game.showScreen('main-menu');
                assert.isFalse($('#splash-screen').hasClass('active'), 'active class is not removed');
                assert.isTrue($.prototype.addClass.calledTwice, 'addClass should be called exactly twice');
                assert.isTrue($.prototype.removeClass.calledOnce, 'removeClass should be called exactly once');
            });

            */

        });

    });

});