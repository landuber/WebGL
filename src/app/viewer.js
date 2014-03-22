define(['jquery',
        'screens/board'
    ],
    function($, board) {

        function initialize() {
            return board.load();
        }


        return {
            initialize: initialize
        };

    });