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
		var collection = db.getCollection(testCollection);
		if(collection) {
			db.removeCollection(testCollection);
		}
		done();
	})
}

var afterEachTest = function(done) {
	done();
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

	// it('should default to "passwordless-token" as collection name', function (done) {
	// 	var store = TokenStoreFactory();

	// 	MongoClient.connect(testUri, function(err, db) {
	// 		db.collection('passwordless-token', {strict:true}, function(err, collection) {
	// 			expect(err).to.exist;

	// 			store.storeOrUpdate(uuid.v4(), chance.email(), 
	// 				1000*60, 'http://' + chance.domain() + '/page.html', 
	// 				function() {
	// 					db.collection('passwordless-token', {strict:true}, function(err, collection) {
	// 						expect(collection).to.exist;
	// 						expect(err).to.not.exist;
	// 						done();
	// 					});
	// 				});
	// 		});
	// 	})
	// })

	// it('should change name of collection based on "mongostore.collection"', function (done) {
	// 	var store = new LokiJSStore(testUri, { mongostore : { collection: 'whatsup' }});

	// 	MongoClient.connect(testUri, function(err, db) {
	// 		db.collection('whatsup', {strict:true}, function(err, collection) {
	// 			expect(err).to.exist;

	// 			store.storeOrUpdate(uuid.v4(), chance.email(), 
	// 				1000*60, 'http://' + chance.domain() + '/page.html', 
	// 				function() {
	// 					db.collection('whatsup', {strict:true}, function(err, collection) {
	// 						expect(collection).to.exist;
	// 						expect(err).to.not.exist;
	// 						done();
	// 					});
	// 				});
	// 		});
	// 	})
	// })

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