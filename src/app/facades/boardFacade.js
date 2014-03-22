define(['jquery', 'common/workerFacade'], function($, workerFacade) {

	function getData() {
		return workerFacade.handleMessage('getData',{
			id: '123',
			data: {}
		});
	}

	return {
		getData: getData
	};

});