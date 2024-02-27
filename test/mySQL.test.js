const chai = require('chai');//import chai
const chaiHttp = require('chai-http');//import chai-http
const { describe, it, before, after } = require('mocha');//import mocha
const { app, closeDatabaseConnection } = require('../mySQL');//import app and closeDatabaseConnection from mySQL.js
const e = require('express');//import express

chai.use(chaiHttp);//use chai-http to make http requests to the server
const expect = chai.expect;//use expect from chai to make assertions

describe('API Tests', () => {
    before(() => {
        // Set up any test data or environment
    });

    after(() => {
        // Close Database connections
        after((done) => {
            closeDatabaseConnection()
                .then(() => done())
                .catch(err => {
                    console.error('Error closing the database connection:', err);
                    done(err);
                });
        });
    });
    describe('GET /shoes/', () => {//
        it('should return all shoes if no id is provided', (done) => {
            chai
                .request(app)
                .get('/shoes/')//make get request to /shoes/
                .end((err, res) => {
                    expect(res).to.have.status(200);//expect response to have status code 200
                    expect(res.body).to.be.an('array');//expect response body to be an array
                    done();
                });
        });

        it('should return a specific shoe if id is provided', (done) => {
            chai
                .request(app)
                .get('/shoes/dj5625')//make get request to /shoes/dj5625
                .end((err, res) => {
                    expect(res).to.have.status(200);//expect response to have status code 200
                    expect(res.body).to.be.an('array');//expect response body to be an array
                    expect(res.body[0].sku_base).to.equal('dj5625');//expect sku_base of first shoe in array to be dj5625
                    done();
                });
        });
        
    });

    describe('GET /search/count/', () => {
        it('should return the number of shoes in the database', (done) => {
            chai
                .request(app)
                .get('/search/count/')//make get request to /search/count/
                .end((err, res) => {
                    expect(res).to.have.status(200);//expect response to have status code 200
                    expect(res.body.count).to.be.a('number');//expect response body to have a count property that is a number
                    done();
                });
        });
        it('should return the number of shoes in the database with a specific Name', (done) => {
            chai
                .request(app)
                .get('/search/count/?query=Zoom')//make get request to /search/count/?query=Zoom
                .end((err, res) => {
                    expect(res).to.have.status(200);//expect response to have status code 200
                    expect(res.body.count).to.be.a('number');//expect response body to have a count property that is a number
                    done();
                });
        });
    });

    describe('GET /search/', () => {
        it('should return with 20 shoes if no query is provided. Default pagination limit is 20', (done) => {
            chai
                .request(app)
                .get('/search/')//make get request to /search/
                .end((err, res) => {
                    expect(res).to.have.status(200);//expect response to have status code 200
                    expect(res.body).to.be.an('array');//expect response body to be an array
                    expect(res.body.length).to.equal(20);//expect response body to have length of 20
                    done();
                });
        });

        it('should return all shoes with a specific Name', (done) => {
            chai
                .request(app)
                .get('/search/?query=Zoom')//make get request to /search/?query=Zoom
                .end((err, res) => {
                    expect(res).to.have.status(200);//expect response to have status code 200
                    expect(res.body).to.be.an('array');//expect response body to be an array
                    expect(res.body[0].full_name).to.include('Zoom');//expect full_name of first shoe in array to include Zoom
                    done();
                });
        });

        it('should return all shoes with a specific Name and limit', (done) => {
            chai
                .request(app)
                .get('/search/?query=Air&limit=5')//make get request to /search/?query=Air&limit=5
                .end((err, res) => {
                    expect(res).to.have.status(200);//expect response to have status code 200
                    expect(res.body).to.be.an('array');//expect response body to be an array
                    expect(res.body[0].full_name).to.include('Air');//expect full_name of first shoe in array to include Air
                    expect(res.body.length).to.equal(5);//expect response body to have length of 5
                    done();
                });
        });
    });

});
