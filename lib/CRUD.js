require("dotenv").config();
var eptCode = require("../eptCode.js");
var mysql = require("mysql");

var connection = mysql.createConnection({

    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.MYSQL_PASSWORD,
    database: "employee_trackerDB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connection with localhost initiated")
    eptCode.runInquirer();
});


class CRUD {
    constructor(table, columns, data, cb) {
        this.table = table;
        this.columns = columns;
        this.data = data;
        this.cb = cb;
    }

    create() {
        const cb = this.cb;
        var sql = "INSERT INTO ?? (??) VALUES (?);"

        connection.query(sql, [this.table, this.columns, this.data], function (err, res) {
            if (err) throw err;
            cb(res);
        });
    }

    read() {
        const cb = this.cb;
        var sql = "SELECT ?? FROM ??;"
        connection.query(sql, [this.columns, this.table], function (err, res) {
            if (err) throw err;
            // console.log(JSON.stringify(res));
            cb(res);
        });

    };
    update() {
        const cb = this.cb;
        var sql = "INSERT INTO ?? (??) VALUES (?);"
        connection.query(sql, [this.table, this.columns, this.data], function (err, result) {
            if (err) {
                // If an error occurred, send a generic server failure
                return res.status(500).end();
            } else if (result.changedRows === 0) {
                // If no rows were changed, then the ID must not exist, so 404
                return res.status(404).end();
            }
            res.status(200).end();

            return res;
        });

    }
    delete() {
        const cb = this.cb;
        var sql = "DELETE FROM ?? WHERE ?? = ?;"
        connection.query(sql, [this.table, this.columns, this.data], function (err, res) {
            if (err) {
                throw err;
            } else if (res.affectedRows === 0) {
                throw err;
            }
            cb(res)
        });

    }

}

module.exports = {
    CRUD,
    connection
};