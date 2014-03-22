importScripts('../../../vendor/requirejs/require.js');



addEventListener('message', function(event) {
	var payload = event.data,
		command = payload.command,
		messageId = payload.message.id,
		param = payload.message.data,
		result;

	require({
		baseUrl: '../',
		paths: {
			'lodash': '../../../vendor/lodash/dist/lodash',
			'q': '../../../vendor/q/q'
		}
	}, [], function() {
		

		switch (command) {
			case "getData":
				result = {
					messageId: messageId,
					response: [1,2,3]
				};
				break;
		}
		postMessage(result);
	});
}, false);