import Express from './app.js';

const express = new Express();
express.listen();
express.onError();
express.onListening();