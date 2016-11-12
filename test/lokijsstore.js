'use strict';

var expect = require('chai').expect;
var uuid = require('node-uuid');
var chance = new require('chance')();

var LokiJSStore = require('../');
var TokenStore = require('passwordless-tokenstore');

var Loki = require('lokijs');

var standardTests = require('passwordless-tokenstore-test');

var testFile = 'tokenstore-test.json';
var testCollection = 'passwordless-token';

function TokenStoreFactory() {
	return new LokiJSStore(testFile);
}

var beforeEachTest = function(done) {
	var db = new Loki(testFile);
	db.loadDatabase({}, function() {
		db.deleteDatabase(null, function() {
			done();
		});
	})
}

var afterEachTest = function(done) {
	var db = new Loki(testFile);
	db.loadDatabase({}, function() {
		db.deleteDatabase(null, function() {
			done();
		});
	})
}

// Call all standard tests
standardTests(TokenStoreFactory, beforeEachTest, afterEachTest);

describe('Specific tests', function() {

	beforeEach(function(done) {
		beforeEachTest(done);
	})

	afterEach(function(done) {
		afterEachTest(done);
	})

	it('should not allow the instantiation with an empty constructor', function () {
		expect(function() { new LokiJSStore() }).to.throw(Error);
	})

	it('should not allow the instantiation with a wrongly instantiated constructor', function () {
		expect(function() { new LokiJSStore(123) }).to.throw(Error);
	})

	it('should allow proper instantiation', function () {
		expect(function() { TokenStoreFactory() }).to.not.throw();
	})

	it('should allow proper instantiation with options', function () {
		expect(function() { new LokiJSStore(testFile, { lokijsstore: {collection:'user'}}) }).to.not.throw();
	})

	it('should default to "passwordless-token" as collection name', function (done) {
		var store = TokenStoreFactory();

		store.storeOrUpdate(uuid.v4(), chance.email(), 
			1000*60, 'http://' + chance.domain() + '/page.html', 
			function() {
				var db = new Loki(testFile);
				db.loadDatabase({}, function() {
					var collection = db.getCollection('passwordless-token');
					var collection2 = db.getCollection('other');
					expect(collection).to.exist;
					expect(collection2).to.not.exist;
					done();
				})
		})
	})

	it('should change name of collection based on "lokijsstore.collection"', function (done) {
		var store = new LokiJSStore(testFile, { lokijsstore : { collection: 'othername' }});

		store.storeOrUpdate(uuid.v4(), chance.email(), 
			1000*60, 'http://' + chance.domain() + '/page.html', 
			function() {
				var db = new Loki(testFile);
				db.loadDatabase({}, function() {
					var collection = db.getCollection('passwordless-token');
					var collection2 = db.getCollection('othername');
					expect(collection).to.not.exist;
					expect(collection2).to.exist;
					done();
				})
		})
	})

	// it('should store tokens only in their hashed form', function (done) {
	// 	var store = TokenStoreFactory();
	// 	var token = uuid.v4();
	// 	var uid = chance.email();
	// 	store.storeOrUpdate(token, uid, 
	// 		1000*60, 'http://' + chance.domain() + '/page.html', 
	// 		function() {
	// 			MongoClient.connect(testUri, function(err, db) {
	// 				db.collection('passwordless-token', function(err, collection) {
	// 					collection.findOne({uid: uid}, function(err, item) {
	// 						expect(item.uid).to.equal(uid);
	// 						expect(item.hashedToken).to.not.equal(token);
	// 						done();
	// 					});
	// 				});
	// 			})
	// 		});
	// })

	// it('should store tokens not only hashed but also salted', function (done) {
	// 	var store = TokenStoreFactory();
	// 	var token = uuid.v4();
	// 	var uid = chance.email();
	// 	store.storeOrUpdate(token, uid, 
	// 		1000*60, 'http://' + chance.domain() + '/page.html', 
	// 		function() {
	// 			MongoClient.connect(testUri, function(err, db) {
	// 				db.collection('passwordless-token', function(err, collection) {
	// 					collection.findOne({uid: uid}, function(err, item) {
	// 						var hashedToken1 = item.hashedToken;
	// 						store.clear(function() {
	// 							store.storeOrUpdate(token, uid, 
	// 								1000*60, 'http://' + chance.domain() + '/page.html', 
	// 								function() {
	// 									collection.findOne({uid: uid}, function(err, item) {
	// 										var hashedToken2 = item.hashedToken;
	// 										expect(hashedToken2).to.not.equal(hashedToken1);
	// 										done();
	// 									});
	// 								});
	// 						})
	// 					});
	// 				});
	// 			})
	// 		});
	// })
})