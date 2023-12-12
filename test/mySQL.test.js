const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, it, before, after } = require('mocha');
//const app = require('../mySQL');
const { app, closeDatabaseConnection } = require('../mySQL');
const e = require('express');

chai.use(chaiHttp);
const expect = chai.expect;

describe('API Tests', () => {
    before(() => {
        // Set up any test data or environment
    });

    after(() => {
        // Close any Database connections
        after((done) => {
            closeDatabaseConnection()
                .then(() => done())
                .catch(err => {
                    console.error('Error closing the database connection:', err);
                    done(err);
                });
        });
    });

    describe('GET /shoe_models/', () => {
        it('should return all shoe models if no id is provided', (done) => {
            chai
                .request(app)
                .get('/shoe_models/')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });

        it('should return a specific shoe model if id is provided', (done) => {
            chai
                .request(app)
                .get('/shoe_models/dj5625')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body[0].sku_base).to.equal('dj5625');
                    // Add more assertions as needed
                    done();
                });
        });
        
    });

    describe('GET /search/count/', () => {
        it('should return the number of shoes in the database', (done) => {
            chai
                .request(app)
                .get('/search/count/')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.count).to.be.a('number');
                    done();
                });
        });
        it('should return the number of shoes in the database with a specific Name', (done) => {
            chai
                .request(app)
                .get('/search/count/?query=Zoom')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.count).to.be.a('number');
                    done();
                });
        });
    });

    describe('GET /search/', () => {
        it('should return with 20 shoes if no query is provided. Default pagination limit is 20', (done) => {
            chai
                .request(app)
                .get('/search/')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.equal(20);
                    done();
                });
        });

        it('should return all shoes with a specific Name', (done) => {
            chai
                .request(app)
                .get('/search/?query=Zoom')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body[0].full_name).to.include('Zoom');
                    done();
                });
        });

        it('should return all shoes with a specific Name and limit', (done) => {
            chai
                .request(app)
                .get('/search/?query=Air&limit=5')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body[0].full_name).to.include('Air');
                    expect(res.body.length).to.equal(5);
                    done();
                });
        });
    });

});
