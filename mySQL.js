const express = require('express');//import express
const mysql = require('mysql');//import mysql
const cors = require('cors');//import cors to allow cross origin requests from the browser

const app = express();//create express app instance

app.use(cors());//use cors middleware to allow cross origin requests from the browser
const port = 3000;//set port to 3000

const connectionPool = mysql.createPool({//create mysql connection pool to connect to the database with the following credentials
    connectionLimit: 10,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'maazdubai',
    database: 'solemate_finder'
});

app.get('/shoes/:id?', (req, res) => {//get request to /shoes/:id? where :id is optional
    const shoeId = req.params.id;//get the id from the request parameters
    let sql;//declare sql variable

    if (shoeId) {//if id is provided
        if(shoeId.toString().includes('-')){//if id is a sku_full
            //sql query to get all shoes with the same sku_full and order them by image_url type (best image first)
            sql = `SELECT * FROM shoes, shoe_model, comparison WHERE shoes.sku_base = shoe_model.sku_base AND shoes.sku_full = comparison.sku_full AND shoes.sku_full = ? ORDER BY CASE WHEN image_url LIKE 'https://s%' THEN 1 WHEN image_url LIKE 'https://im%' THEN 2 WHEN image_url LIKE 'https://t%' THEN 3 ELSE 4 END ASC`;
            connectionPool.query(sql, [shoeId], (err, results) => {
                if (err) {//if error occurs while executing query send 500 status code and error message
                    console.error('Error executing query:', err);//log error to console for debugging
                    res.status(500).json({ error: 'Internal server error' });
                    return;//return to stop execution
                }
                res.json(results);//send results as json
            });
        }else{//if id is a sku_base
            //sql query to get all shoes with the same sku_base and order them by image_url type (best image first)
            sql = `SELECT * FROM shoes WHERE sku_base = ? ORDER BY CASE WHEN image_url LIKE 'https://s%' THEN 1 WHEN image_url LIKE 'https://im%' THEN 2 WHEN image_url LIKE 'https://t%' THEN 3 ELSE 4 END ASC`;
            connectionPool.query(sql, [shoeId], (err, results) => {
                if (err) {//if error occurs while executing query send 500 status code and error message
                    console.error('Error executing query:', err);//log error to console for debugging
                    res.status(500).json({ error: 'Internal server error' });
                    return;//return to stop execution
                }
                res.json(results);//send results as json
            });
        }
    } else {//if id is not provided return all shoes
        sql = 'SELECT * FROM shoes';//sql query to get all shoes
        connectionPool.query(sql, (err, results) => {
            if (err) {//if error occurs while executing query send 500 status code and error message
                console.error('Error executing query:', err);//log error to console for debugging
                res.status(500).json({ error: 'Internal server error' });
                return;//return to stop execution
            }
            res.json(results);//send results as json
        });
    }
});


app.get('/comparisons', (req, res) => {//get request to /comparisons
    const sql = 'SELECT * FROM comparison';//sql query to get all comparisons
    connectionPool.query(sql, (err, results) => {
        if (err) {//if error occurs while executing query send 500 status code and error message
            console.error('Error executing query:', err);//log error to console for debugging
            res.status(500).json({ error: 'Internal server error' });
            return;//return to stop execution
        }
        res.json(results);//send results as json
    });
});

app.get('/search/', (req, res) => {//get request to /search/
    const query = req.query.query || '';//get query from request parameters
    const offset = Number(req.query.offset) || 0;//get offset from request parameters (default is 0)
    const limit = Number(req.query.limit) || 20;//get limit from request parameters (default is 20)

    //sql query to get all shoes with the same name as the query and order them by image_url type (best image first)
    const sql = `SELECT * FROM shoes WHERE UPPER(full_name) LIKE UPPER(?) ORDER BY CASE WHEN image_url LIKE 'https://s%' THEN 1 WHEN image_url LIKE 'https://im%' THEN 2 WHEN image_url LIKE 'https://t%' THEN 3 ELSE 4 END ASC LIMIT ? OFFSET ?`;
    connectionPool.query(sql, [`%${query}%`, limit, offset], (err, results) => {
        if (err) {//if error occurs while executing query send 500 status code and error message
            console.error('Error executing query:', err);//log error to console for debugging
            res.status(500).json({ error: 'Internal server error' });//send 500 status code and error message
            return;//return to stop execution
        }
        res.json(results);//send results as json
    });
});

app.get('/search/count/', (req, res) => {//get request to /search/count/
    const query = req.query.query || '';//get query from request parameters
    const sql = `SELECT COUNT(*) AS count FROM shoes WHERE UPPER(full_name) LIKE UPPER(?)`;//sql query to get the count of all shoes with the same name as the query 
    connectionPool.query(sql, [`%${query}%`], (err, results) => {
        if (err) {//if error occurs while executing query send 500 status code and error message
            console.error('Error executing query:', err);//log error to console for debugging
            res.status(500).json({ error: 'Internal server error' });
            return;//return to stop execution
        }
        res.json(results[0]);//send results as json
    });
});

if (process.env.NODE_ENV !== 'test') {//if not in test environment
    app.listen(port, () => {//start server
        console.log(`API server listening at http://localhost:${port}`);//log message to console
    });
}
//close database connection
function closeDatabaseConnection() {//close database connection
    return new Promise((resolve, reject) => {
        connectionPool.end(err => {
            if (err) return reject(err);
            resolve();
        });
    });
}
module.exports = { app, closeDatabaseConnection };//export app and closeDatabaseConnection function for testing
