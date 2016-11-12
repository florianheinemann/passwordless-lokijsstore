'use strict';

var util = require('util');
var bcrypt = require('bcrypt');
var TokenStore = require('passwordless-tokenstore');
var Loki = require('lokijs');

/**
 * Constructor of LokiJSStore
 * @param {String} file filename of LokiJS database. Please refer to LokiJS 
 * documentation for details
 * @param {Object} [options] Combines both the options for LokiJS as well
 * as the options for LokiJSStore. For the LokiJS options please refer back to
 * the documentation. LokiJSStore understands the following options: 
 * (1) { lokijsstore: { collection: string }} to set the name of the collection
 * being used. Defaults to: 'passwordless-token'
 * @constructor
 */
function LokiJSStore(file, options) {
	if(arguments.length === 0 || typeof arguments[0] !== 'string') {
		throw new Error('A valid connection string has to be provided');
	}

	TokenStore.call(this);

	this._options = options || {};
	this._collectionName = 'passwordless-token';
	if(this._options.lokijsstore) {
		if(this._options.lokijsstore.collection) {
			this._collectionName = this._options.lokijsstore.collection;
		}
		delete this._options.lokijsstore;
	}

	this._file = file;
	this._db = null;
	this._collection = null;
}

util.inherits(LokiJSStore, TokenStore);

/**
 * Checks if the provided token / user id combination exists and is
 * valid in terms of time-to-live. If yes, the method provides the 
 * the stored referrer URL if any. 
 * @param  {String}   token to be authenticated
 * @param  {String}   uid Unique identifier of an user
 * @param  {Function} callback in the format (error, valid, referrer).
 * In case of error, error will provide details, valid will be false and
 * referrer will be null. If the token / uid combination was not found 
 * found, valid will be false and all else null. Otherwise, valid will 
 * be true, referrer will (if provided when the token was stored) the 
 * original URL requested and error will be null.
 */
LokiJSStore.prototype.authenticate = function(token, uid, callback) {
	if(!token || !uid || !callback) {
		throw new Error('TokenStore:authenticate called with invalid parameters');
	}

	this._get_collection(function(collection) {

		var item = collection.findOne({
			'$and': [
				{
					'uid': uid 
				}, {
					ttl: { $gt: new Date() }
				}
			]});

		if(item) {
			bcrypt.compare(token, item.hashedToken, function(err, res) {
				if(err) {
					callback(err, false, null);
				} else if(res) {
					callback(null, true, item.originUrl || "");
				} else {
					callback(null, false, null);
				}
			});
		} else {
			callback(null, false, null);
		}
	});
};

/**
 * Stores a new token / user ID combination or updates the token of an
 * existing user ID if that ID already exists. Hence, a user can only
 * have one valid token at a time
 * @param  {String}   token Token that allows authentication of _uid_
 * @param  {String}   uid Unique identifier of an user
 * @param  {Number}   msToLive Validity of the token in ms
 * @param  {String}   originUrl Originally requested URL or null
 * @param  {Function} callback Called with callback(error) in case of an
 * error or as callback() if the token was successully stored / updated
 */
LokiJSStore.prototype.storeOrUpdate = function(token, uid, msToLive, originUrl, callback) {
	if(!token || !uid || !msToLive || !callback) {
		throw new Error('TokenStore:storeOrUpdate called with invalid parameters');
	}
	this._get_collection(function(collection) {
		bcrypt.hash(token, 10, function(err, hashedToken) {
			if(err) {
				return callback(err);
			}

			collection.removeWhere({'uid': uid});

			var newRecord = {
				'hashedToken': hashedToken,
				'uid': uid,
				'ttl': new Date(Date.now() + msToLive),
				'originUrl': originUrl
			}

			collection.insert(newRecord);

			callback();
		});
	});
}

/**
 * Invalidates and removes a user and the linked token
 * @param  {String}   user ID
 * @param  {Function} callback called with callback(error) in case of an
 * error or as callback() if the uid was successully invalidated
 */
LokiJSStore.prototype.invalidateUser = function(uid, callback) {
	if(!uid || !callback) {
		throw new Error('TokenStore:invalidateUser called with invalid parameters');
	}
	this._get_collection(function(collection) {
		collection.removeWhere( { 'uid': uid});
		callback();
	});
}

/**
 * Removes and invalidates all token
 * @param  {Function} callback Called with callback(error) in case of an
 * error or as callback() if the collection was cleared successfully
 */
LokiJSStore.prototype.clear = function(callback) {
	if(!callback) {
		throw new Error('TokenStore:clear called with invalid parameters');
	}
	this._get_collection(function(collection) {
		collection.clear();
		callback();
	});
}

/**
 * Number of tokens stored (no matter the validity)
 * @param  {Function} callback Called with callback(null, count) in case
 * of success or with callback(error) in case of an error
 */
LokiJSStore.prototype.length = function(callback) {
	this._get_collection(function(collection) {
		var count = collection.count();
		callback(null, count);
	});
}

/**
 * Private method to connect to the database
 * @private
 */
LokiJSStore.prototype._connect = function(callback) {
	var self = this;
	if(!self._db) {
		self._db = new Loki(self._file);
	} 
	callback(self._db);
}

/**
 * Private method to connect to the right collection
 * @private
 */
LokiJSStore.prototype._get_collection = function(callback) {
	var self = this;
	if(self._collection) {
		callback(self._collection);
	} else {
		self._connect(function(db) {
			var collection = db.getCollection(self._collectionName);
			if(!collection) {
				self._collection = db.addCollection(self._collectionName, {
					unique: ['uid']
				});
			} else {
				self._collection = collection;
			}
			callback(self._collection);
		})		
	}
}

module.exports = LokiJSStore;