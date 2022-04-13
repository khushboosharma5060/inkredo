
const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

let db;
async function connect() {
  await client.connect();
  console.log('Connected successfully to mongodb');
  db = client.db('Inkredo');
} 

function employeeCollection() {
  return db.collection('employee');
}

function companyCollection() {
  return db.collection('company');
};

function historyCollection() {
  return db.collection('history');
};

module.exports = {
  connect, employeeCollection, companyCollection, historyCollection
};    


