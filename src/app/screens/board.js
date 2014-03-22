define(['lodash', 'q', 'common/viewUtil', 'facades/boardFacade'],
    function(_, Q, viewUtil, boardFacade) {

        // Public Methods
        function load() {
            return boardFacade.getData().then(function() {
                viewUtil.showScreen('home-screen');
            });
        }

        return {
            load: load
        };

    });