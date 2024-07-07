const dotenv = require('dotenv').config();

const { MongoClient } = require('mongodb');
const mysql = require('mysql2');

let mongodb;
let mysqldb;



module.exports = setup;