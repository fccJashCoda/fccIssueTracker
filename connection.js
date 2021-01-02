'use strict';
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main(cb) {
  const URI = process.env.DB;
  const client = new MongoClient(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();

    await cb(client);
  } catch (e) {
    console.log(e);
    throw new Error('Unable to connect to database');
  }
}

module.exports = main;
