'use strict';

class ValidatorResult {

	/**
     * @param {SpecialChannel} restriction
     * @param {Message} message
     * @param {boolean} result
     */
	constructor(restriction, message) {
		this.restriction = restriction;
		this.message = message;
		this.errors = [];
	}

	set error(error) {
		this.errors.push(error);
	}

	get isValid() {
		return !this.errors.length;
	}

}

module.exports = ValidatorResult;
