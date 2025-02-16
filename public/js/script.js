/**
 * Get the token payload
 * @returns {object|null} The token payload
 */
window.tokenPayload = () => {
	const token = localStorage.getItem('token');
	if (!token) return null;
	const payload = JSON.parse(atob(token.split('.')[1]));
	return payload;
};

/**
 * Check if the token is valid
 * @returns {boolean}
 */
window.isTokenValid = () => {
	try {
		const payload = window.tokenPayload();
		if (!payload) return false;
		const currentTime = Math.floor(Date.now() / 1000);
		return payload.exp > currentTime;
	} catch (error) {
		return false;
	}
};

/**
 * Start the scripts
 */
window.startScripts = () => {
	let isDocumentLoaded = false;
	const interval = setInterval(() => {
		if (document.readyState === 'complete') {
			isDocumentLoaded = true;
			// load the gui
			window.guiLoader();

			clearInterval(interval);
		}
	}, 100);
};

/**
 * Load the GUI
 */
window.guiLoader = () => {
	/**
	 * If token is valid, unhide the auth-ok elements
	 * If token is invalid, unhide the auth-not-ok elements
	 */
	if (window.isTokenValid()) {
		document.querySelectorAll('.auth-ok').forEach((e) => {
			e.classList.remove('hidden');
		});
	} else {
		document.querySelectorAll('.auth-not-ok').forEach((e) => {
			e.classList.remove('hidden');
		});
	}
};

window.startScripts();

/**
 * API wrapper
 * @param {string} url - The URL to fetch
 * @param {string} method - The HTTP method to use
 * @param {object} data - The data to send
 * @returns {Promise<object>} The response from the API
 */
window.api = async (url, method = 'GET', data = null) => {
	try {
		const token = localStorage.getItem('token');
		const headers = {
			'Content-Type': 'application/json',
		};

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const options = {
			method,
			headers,
		};

		if (data) {
			options.body = JSON.stringify(data);
		}

		const response = await fetch(url, options);
		return response;
	} catch (error) {
		console.error('Fetch error:', error);
		alert(error.message);
	}
};
/**
 * Listen for an event on a parent element
 * @param {string} parentSelector - The parent element selector
 * @param {string} childSelector - The child element selector
 * @param {string} eventType - The event type
 * @param {function} handler - The handler function
 */
window.listen = (parentSelector, childSelector, eventType, handler) => {
	document.querySelectorAll(parentSelector).forEach((parent) => {
		parent.addEventListener(eventType, function (e) {
			if (e.target.matches(childSelector) || e.target.closest(childSelector)) {
				handler(e);
			}
		});
	});
};
