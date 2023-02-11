class Fetch {
	static async get(route, body) {
		return await this._request(route, body, 'GET')
	}

	static async post(route, body) {
		return await this._request(route, body, 'POST')
	}

	static async put(route, body) {
		return await this._request(route, body, 'PUT')
	}

	static async delete(route, body) {
		return await this._request(route, body, 'DELETE')
	}

	static async _request(route, body, method = 'GET') {
		return await fetch(route, {
			body: JSON.stringify(body),
			method,
			headers: {
				'Content-Type': 'application/json'
			}
		})
	}
}