# Passwordless-LokiJSStore

This module provides token storage for [Passwordless](https://github.com/florianheinemann/passwordless) -- a node.js module for express that allows website authentication without passwords. Visit the project's website https://passwordless.net for more details.

This module allows token to be stored in a [LokiJS](http://lokijs.org/) database. Tokens are hashed and salted using [bcrypt](https://github.com/ncb000gt/node.bcrypt.js/).

## Usage

First, install the module:

`$ npm install passwordless-lokijsstore --save`

Afterwards, follow the guide for [Passwordless](https://github.com/florianheinemann/passwordless). A typical implementation may look like this:

```javascript
var passwordless = require('passwordless');
var LokiJSStore = require('passwordless-lokijsstore');

passwordless.init(new LokiJSStore('tokens.json'));

passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
        // Send out a token
    });
    
app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken());
```

## Initialization

```javascript
new LokiJSStore(file, [options]);
```
* **file:** *(string)* Name of the file to be saved to. Further documentation can be found on the [LokiJS website](https://rawgit.com/techfort/LokiJS/master/jsdoc/Loki.html)
* **[options]:** *(object)* Optional. This can include LokiJS options as described in the [docs](https://rawgit.com/techfort/LokiJS/master/jsdoc/Loki.html#Loki) as well as LokiJSStore-specific ones as described below. All options are combined in one object as shown in the example below:

Example:
```javascript
passwordless.init(new LokiJSStore('tokens.json', {
    verbose: true,
    lokijsstore: {
        collection: 'tokens'
    }
}));
```

### Options
* **[lokijsstore.collection]:** *(string)* Optional. Name of the collection to be used. Default: 'passwordless-token'

## Hash and salt
As the tokens are equivalent to passwords (even though they do have the security advantage of only being valid for a limited time) they have to be protected the same way. passwordless-lokijsstore uses [bcryptjs](https://github.com/dcodeIO/bcrypt.js) with automatically created random salts (10 rounds).

## Tests

`$ npm test`

## License

[MIT License](http://opensource.org/licenses/MIT)

## Author
Florian Heinemann [@thesumofall](http://twitter.com/thesumofall/)
