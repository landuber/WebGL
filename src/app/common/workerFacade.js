define(['jquery', 'q'], function($, Q) {


	var worker = new Worker('src/app/common/worker.js');
	var promiseMap = {};

	worker.addEventListener('message', function(result) {
		promiseMap[result.data.messageId].resolve(result.data.response);
	});

	function handleMessage(command, message) {
		var defer = Q.defer();
		promiseMap[message.id] = defer;

		worker.postMessage({
			message: message,
			command: command
		});

		return defer.promise;
	}


	return {
		handleMessage: handleMessage
	};

});