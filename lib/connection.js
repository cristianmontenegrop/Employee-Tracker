require("dotenv").config();
// var eptCode = require("../CMS.js");
var mysql = require("mysql");
const {
    promisify
} = require('util')


var databaseConfig = {
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

const pool = mysql.createPool(databaseConfig)
const promiseQuery = promisify(pool.query).bind(pool)
const promisePoolEnd = promisify(pool.end).bind(pool)


module.exports = {
    promiseQuery,
    promisePoolEnd
}