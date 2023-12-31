const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();

app.use(cors());
const port = 3000;

const connectionPool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'Maazmysql#1',
    database: 'solemate_finder'
});

app.get('/shoe_models/:id?', (req, res) => {
    const shoeModelsId = req.params.id;
    let sql;

    if (shoeModelsId) {
        sql = `SELECT * FROM shoe_model WHERE sku_base = ?`;
        connectionPool.query(sql, [shoeModelsId], (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json(results);
        });
    } else {
        sql = 'SELECT * FROM shoe_model';
        connectionPool.query(sql, (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json(results);
        });
    }
});
app.get('/shoes/:id?', (req, res) => {
    const shoeId = req.params.id;
    let sql;

    if (shoeId) {
        if(shoeId.toString().includes('-')){
            sql = `SELECT * FROM shoes, shoe_model, comparison WHERE shoes.sku_base = shoe_model.sku_base AND shoes.sku_full = comparison.sku_full AND shoes.sku_full = ? ORDER BY CASE WHEN image_url LIKE 'https://s%' THEN 1 WHEN image_url LIKE 'https://im%' THEN 2 WHEN image_url LIKE 'https://t%' THEN 3 ELSE 4 END ASC`;
            connectionPool.query(sql, [shoeId], (err, results) => {
                if (err) {
                    console.error('Error executing query:', err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }
                res.json(results);
            });
        }else{
            sql = `SELECT * FROM shoes WHERE sku_base = ? ORDER BY CASE WHEN image_url LIKE 'https://s%' THEN 1 WHEN image_url LIKE 'https://im%' THEN 2 WHEN image_url LIKE 'https://t%' THEN 3 ELSE 4 END ASC`;
            connectionPool.query(sql, [shoeId], (err, results) => {
                if (err) {
                    console.error('Error executing query:', err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }
                res.json(results);
            });
        }
    } else {
        sql = 'SELECT * FROM shoes';
        connectionPool.query(sql, (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json(results);
        });
    }
});


app.get('/comparisons', (req, res) => {
    const sql = 'SELECT * FROM comparison';
    connectionPool.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});

app.get('/search/', (req, res) => {
    const query = req.query.query || '';
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 20;

    const sql = `SELECT * FROM shoes WHERE UPPER(full_name) LIKE UPPER(?) ORDER BY CASE WHEN image_url LIKE 'https://s%' THEN 1 WHEN image_url LIKE 'https://im%' THEN 2 WHEN image_url LIKE 'https://t%' THEN 3 ELSE 4 END ASC LIMIT ? OFFSET ?`;
    connectionPool.query(sql, [`%${query}%`, limit, offset], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});

app.get('/search/count/', (req, res) => {
    const query = req.query.query || '';
    const sql = `SELECT COUNT(*) AS count FROM shoes WHERE UPPER(full_name) LIKE UPPER(?)`;
    connectionPool.query(sql, [`%${query}%`], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results[0]);
    });
});
/*
app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
});
*/
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`API server listening at http://localhost:${port}`);
    });
}
//close database connection
function closeDatabaseConnection() {
    return new Promise((resolve, reject) => {
        connectionPool.end(err => {
            if (err) return reject(err);
            resolve();
        });
    });
}
module.exports = { app, closeDatabaseConnection };
