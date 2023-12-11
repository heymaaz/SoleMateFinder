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
            sql = `SELECT * FROM shoes, shoe_model, comparison WHERE shoes.sku_base = shoe_model.sku_base AND shoes.sku_full = comparison.sku_full AND shoes.sku_full = ?`;
            connectionPool.query(sql, [shoeId], (err, results) => {
                if (err) {
                    console.error('Error executing query:', err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }
                res.json(results);
            });
        }else{
            sql = `SELECT * FROM shoes WHERE sku_base = ?`;
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

    const sql = `SELECT * FROM shoes WHERE UPPER(full_name) LIKE UPPER(?) ORDER BY image_url DESC LIMIT ? OFFSET ?`;
    connectionPool.query(sql, [`%${query}%`, limit, offset], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});
app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
});



