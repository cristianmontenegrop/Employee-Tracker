var connection = require("./connection")


// require("dotenv").config();
// var eptCode = require("../CMS.js");
// var mysql = require("mysql");
// const {
//     promisify
// } = require('util')

// var databaseConfig = {
//     connectionLimit: 10,
//     host: "localhost",
//     port: 3306,
//     user: "root",
//     password: process.env.MYSQL_PASSWORD,
//     database: "employee_trackerDB"
// };

// const pool = mysql.createPool(databaseConfig)
// const promiseQuery = promisify(pool.query).bind(pool)
// const promisePoolEnd = promisify(pool.end).bind(pool)

// const query = `select * from mock_table limit 1;`
// const result = await promiseQuery(query) // use in async function
// promisePoolEnd()

class CRUD {
    constructor(table, columns, data, sqlSwitch) {
        this.table = table;
        this.columns = columns;
        this.data = data;
        this.sqlSwitch = sqlSwitch;
    }

    async create() {
        var sql = "INSERT INTO ?? (??) VALUES (?);"
        if (this.sqlSwitch === true) {
            sql = this.data;
        };
        var result = await connection.promiseQuery(sql, [this.table, this.columns, this.data, this.sqlSwitch])
        return result;
    }

    async read() {
        var sql = "SELECT ?? FROM ??;"
        if (this.sqlSwitch === true) {
            sql = this.data;
        };
        var result = await connection.promiseQuery(sql, [this.columns, this.table, this.sqlSwitch])
        return result;
    };

    async update() {
        var sql = "UPDATE ?? SET ?? WHERE ??;"
        if (this.sqlSwitch === true) {
            sql = this.data;
        };
        var result = await connection.promiseQuery(sql, [this.table, this.columns, this.data, this.sqlSwitch])
        return result;
    };

    async delete() {
        var sql = "DELETE FROM ?? WHERE ?? = ?;"
        if (this.sqlSwitch === true) {
            sql = this.data;
        };
        var result = await connection.promiseQuery(sql, [this.table, this.columns, this.data, this.sqlSwitch])
        return result;
    };
    async end() {
        connection.promisePoolEnd();
    }

};

module.exports = CRUD;