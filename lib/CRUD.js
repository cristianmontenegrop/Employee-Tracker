var connection = require("./connection")


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