module.exports = {
    create: (connection, body, callback) => {
        connection.query('insert into users SET ?', body, (err, results) => {
            if(err) {
                console.log("Error en la insercion");
                callback({ array: null, id: null, success: false, err: JSON.stringify(err) });
                return;
            }
            callback({ array: null, id: null, success: true })
        });
    },

    getAll: (connection, callback) => { 
        connection.query('select * from users', (err, results) => { 
            if(err) {
                console.log("Error en la consulta");
                callback({ array: null, id: null, success: false, err: JSON.stringify(err) });
                return;
            }
            callback({ array: results, id: null, success: true });
        })
    }
}