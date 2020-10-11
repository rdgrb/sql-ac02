const sql = require('mssql');

function saveConnectionConfig(config) {
    localStorage.setItem("sql-config", JSON.stringify(config));
}

async function queryData(config, sqlQuery) {
    try {
        let pool = await sql.connect(config);
        let resultado = await pool.request()
            .query(sqlQuery);

        return resultado;
    } catch (erro) {
        console.log(erro);
    }
}
