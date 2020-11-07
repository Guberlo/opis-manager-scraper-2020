const mysql = require('mysql')
const util = require('util')
const year = "2020/2021"
const {user, pass } = require('./config')

const config = {
    user: user,
    password: pass,
    database: 'opis_manager',
    connectionLimit: 5,
    connectionTimeout: 10000,
    acquireTimeout: 10000,
    waitForConnections: true,
    queueLimit: 0
};

const pool = mysql.createPool(config)


pool.getConnection( (err, connection) => {
    if(err) throw err;

    if(connection) connection.release()

    return 
})

pool.query = util.promisify(pool.query)


const get_primary_id = async (unict_id, table) => {
    console.log("ENTERING PRIMARY ID")
    const query_string = "SELECT id FROM ?? WHERE unict_id = ? AND anno_accademico = ?";
    const res = pool.query(query_string, [table, unict_id, year], (err, result, fields) => {
        if(err) throw err;
        if(result) return result;
    })

    console.log(res)
    return res;
}
module.exports = {
    pool,
    get_primary_id
}