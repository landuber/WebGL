define(['modernizr'], function(Modernizr) {
	Modernizr.addTest('standalone', function() {
		return (window.navigator.standalone !== false);
	});

	return Modernizr;
});