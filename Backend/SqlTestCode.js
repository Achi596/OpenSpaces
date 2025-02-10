/* eslint-disable */

import mysql from 'mysql2/promise';

export { open, close, sqlInsert, sqlUpdate, sqlDelete, sqlSelect , sqlSelectAll};

const settings = {
  host: process.env.SQL_HOST || '10.16.0.5',
  user: process.env.SQL_USER || 'root',
  password: process.env.SQL_PASSWORD || 'm49C*CG^KMX%G*',
  database: process.env.SQL_DATABASE || 'SystemData'
};

async function open() {
  try {
    const connection = await mysql.createConnection(settings);
    return connection;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
}

async function close(connection) {
  try {
    await connection.end();
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
}

async function sqlInsert(tablename, parameters, values) {
  const connection = await open();
  try {
    const sql = `INSERT INTO ${tablename} (${parameters.join(', ')})
    VALUES (${values.map(() => '?').join(', ')})`;
    await connection.execute(sql, values);
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  } finally {
    await close(connection);
  }
}

async function sqlUpdate(tablename, parameters, values, condition) {
  const connection = await open();
  try {
    const operator = parameters.map(param => `${param} = ?`).join(', ');
    const sql = `UPDATE ${tablename} SET ${operator} WHERE ${condition}`;
    await connection.execute(sql, values);
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  } finally {
    await close(connection);
  }
}

async function sqlDelete(tablename, condition) {
  const connection = await open();
  try {
    const sql = `DELETE FROM ${tablename} WHERE ${condition}`;
    await connection.execute(sql);
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  } finally {
    await close(connection);
  }
}

async function sqlSelect(tablename, condition) {
  const connection = await open();
  try {
    const sql = `SELECT * FROM ${tablename} WHERE ${condition}`;
    const [results] = await connection.execute(sql);
    return results;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  } finally {
    await close(connection);
  }
}

async function sqlSelectAll(tablename) {
  const connection = await open();
  try {
    const sql = `SELECT * FROM ${tablename}`;
    const [results] = await connection.execute(sql);
    return results;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  } finally {
    await close(connection);
  }
}
