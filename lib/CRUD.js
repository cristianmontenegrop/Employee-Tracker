const connection = require('./connection');

class CRUD {
  constructor(table, columns, data, sqlSwitch) {
    this.table = table;
    this.columns = columns;
    this.data = data;
    this.sqlSwitch = sqlSwitch;
  }

  async create() {
    let sql = 'INSERT INTO ?? (??) VALUES (?);';
    if (this.sqlSwitch === true) {
      sql = this.data;
    }
    const result = await connection.promiseQuery(sql,
      [this.table, this.columns, this.data, this.sqlSwitch]);
    return result;
  }

  async read() {
    let sql = 'SELECT ?? FROM ??;';
    if (this.sqlSwitch === true) {
      sql = this.data;
    }
    const result = await connection.promiseQuery(sql, [this.columns, this.table, this.sqlSwitch]);
    return result;
  }

  async update() {
    let sql = 'UPDATE ?? SET ?? WHERE ??;';
    if (this.sqlSwitch === true) {
      sql = this.data;
    }
    const result = await connection.promiseQuery(sql,
      [this.table, this.columns, this.data, this.sqlSwitch]);

    return result;
  }

  async delete() {
    let sql = 'DELETE FROM ?? WHERE ?? = ?;';
    if (this.sqlSwitch === true) {
      sql = this.data;
    }
    const result = await connection.promiseQuery(sql,
      [this.table, this.columns, this.data, this.sqlSwitch]);
    return result;
  }

  async end() { connection.promisePoolEnd(this.data); }
}

module.exports = CRUD;
