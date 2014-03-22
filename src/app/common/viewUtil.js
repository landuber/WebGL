define(['jquery'], function($) {

	function showScreen(screenId) {
		var activeScreen = $('#viewer .screen.active'),
			screen = $('#' + screenId),
			that = this;

		if (activeScreen.length) {
			activeScreen.removeClass('active');
		}

		screen.addClass('active');
	}

	return {
		showScreen: showScreen
	};

});