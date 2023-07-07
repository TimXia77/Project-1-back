
//Requires:
const chai = require('chai');
const chaiHttp = require('chai-http');
const supertest = require('supertest'); //limitations with chai-http -> redirects automatically 
const app = require("../server");
const cookieParser = require("cookie-parser");

//Data access layer (to clear login data before testing) 
const dataLayer = require('./../../data.js');

//Middleware
const { expect } = chai;
chai.use(chaiHttp);
app.use(cookieParser());

//constants
const existUserTest = 'existUserTest';  //should always exist
const newUserTest = 'newUserTest';      //should never exist

var loginCookie; //transports cookie string between tests
var redirectUrl; //transports redirected urls between tests


describe('Login and Register:\n', () => {
    dataLayer.deleteUser('existUserTest');

    describe('Successful Requests', () => {
        describe('POST /register', () => {
            it('Successfully registered account (should return 200)', (done) => {
                supertest(app)
                    .post('/register')
                    .send({ email: 'TestTest@test.test', username: existUserTest, password: 'existUser123' })
                    .expect(200)
                    .expect((res) => {
                        if (!(res.body.cookie)) {
                          throw new Error('Cookie not found in response body');
                        }})
                    .end((err, res) => {
                        if (err) throw err;
                        loginCookie = res.body.cookie;
                        done();
                    });

            });
            it('Checking if /register redirected to /table correctly', (done) => {
                chai.request(app)
                    .post('/table')
                    .send({ cookie: loginCookie })
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.be.json;
                        done();
                    });
            });
        });
        describe('POST /login', () => {
            it('Successfully logged in to account (should return 200)', (done) => {
                supertest(app)
                    .post('/login')
                    .send({ username: existUserTest, password: 'existUser123' })
                    .expect(200)
                    .expect((res) => {
                        if (!(res.body.cookie)) {
                          throw new Error('Cookie not found in response body');
                        }})
                    .end((err, res) => {
                        if (err) throw err;
                        loginCookie = res.body.cookie
                        done();
                    });
            });
            it('Checking if /login redirected to /table correctly:', (done) => {
                chai.request(app)
                    .post('/table')
                    .send({ cookie: loginCookie })
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.be.json;
                        done();
                    });
            });
        });
    });
    describe('Unsuccessful Requests', () => { //{error: 'Invalid Login Information' }
        describe('POST /login', () => {
            it('Tried to login with invalid username (should return 401)', (done) => {
                chai
                    .request(app)
                    .post('/login')
                    .send({ username: newUserTest, password: '123abcDEF' })
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        expect(res.body).to.have.property('error').that.equals('Invalid Login Information');
                        done();
                    });
            });
            it('Tried to login with invalid password (should return 401)', (done) => {
                chai
                    .request(app)
                    .post('/login')
                    .send({ username: existUserTest, password: 'badUser123' })
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        expect(res.body).to.have.property('error').that.equals('Invalid Login Information');
                        done();
                    });
            });
        });
        describe('POST /register', () => {
            //taken usernames and emails
            describe('Registering with taken information', () => {
                it('Tried to register with taken username (should return 409)', (done) => {
                    chai
                        .request(app)
                        .post('/register')
                        .send({ email: 'timxiaa@gmail.com', username: existUserTest, password: 'existUser123' })
                        .end((err, res) => {
                            expect(res).to.have.status(409);
                            expect(res.body).to.have.property('error').that.equals('Username already taken');
                            done();
                        });
                });
                it('Tried to register with taken email (should return 409)', (done) => {
                    chai
                        .request(app)
                        .post('/register')
                        .send({ email: 'TestTest@test.test', username: 'TimXia7777', password: 'existUser123' })
                        .end((err, res) => {
                            expect(res).to.have.status(409);
                            expect(res.body).to.have.property('error').that.equals('Email already taken');
                            done();
                        });
                });
                it('Tried to register with taken username and taken email (should return 401)', (done) => {
                    chai
                        .request(app)
                        .post('/register')
                        .send({ email: 'TestTest@test.test', username: existUserTest, password: 'existUser123' })
                        .end((err, res) => {
                            expect(res).to.have.status(409);
                            expect(res.body).to.have.property('error').that.equals('Username and email taken');
                            done();
                        });
                });
            });

            //invalid parameter formats
            describe('Registering with invalid formats', () => {
                beforeEach(() => {
                    dataLayer.deleteUser('existUserTest');
                });
                describe('Registering with invalid password formats', () => {
                    it('Error when missing a number', (done) => {
                        chai
                            .request(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'password' })
                            .end((err, res) => {
                                expect(res).to.have.status(400);
                                expect(res.body).to.have.property('error').that.equals('Invalid format for password');
                                done();
                            });
                    });
                    it('Error when missing an uppercase letter', (done) => {
                        chai
                            .request(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'password123' })
                            .end((err, res) => {
                                expect(res).to.have.status(400);
                                expect(res.body).to.have.property('error').that.equals('Invalid format for password');
                                done();
                            });
                    });
                    it('Error when missing an lowercase letter', (done) => {
                        chai
                            .request(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'PASSWORD123' })
                            .end((err, res) => {
                                expect(res).to.have.status(400);
                                expect(res.body).to.have.property('error').that.equals('Invalid format for password');
                                done();
                            });
                    });
                    it('Error when missing an password is shorter than 8 characters', (done) => {
                        chai
                            .request(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'Pass123' })
                            .end((err, res) => {
                                expect(res).to.have.status(400);
                                expect(res.body).to.have.property('error').that.equals('Invalid format for password');
                                done();
                            });
                    });
                });
                describe('Registering with invalid username format (including test username)', () => {
                    it('Error when username is shorter than 2 characters', (done) => {
                        chai
                            .request(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: 'H', password: 'existUser123' })
                            .end((err, res) => {
                                expect(res).to.have.status(400);
                                expect(res.body).to.have.property('error').that.equals('Invalid format for username');
                                done();
                            });
                    });
                    it('1. Error when username contains non-numerical and non-underscore characters ', (done) => {
                        chai
                            .request(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: 'username!@#$%^&*()', password: '123abcDEF' })
                            .end((err, res) => {
                                expect(res).to.have.status(400);
                                expect(res.body).to.have.property('error').that.equals('Invalid format for username');
                                done();
                            });
                    });
                    it('2. Error when username contains non-numerical and non-underscore characters ', (done) => {
                        chai
                            .request(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: 'Hi`~{}|:"', password: 'existUser123' })
                            .end((err, res) => {
                                expect(res).to.have.status(400);
                                expect(res.body).to.have.property('error').that.equals('Invalid format for username');
                                done();
                            });
                    });
                    it('3. Error when username contains non-numerical and non-underscore characters ', (done) => {
                        chai
                            .request(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: 'Hi<>?,./>', password: 'existUser123' })
                            .end((err, res) => {
                                expect(res).to.have.status(400);
                                expect(res.body).to.have.property('error').that.equals('Invalid format for username');
                                done();
                            });
                    });
                });
                describe('Registering with invalid email formats then registering with correct', () => {
                    it('Error when missing an @ sign', (done) => {
                        chai
                            .request(app)
                            .post('/register')
                            .send({ email: 'notAValidEmail', username: existUserTest, password: 'existUser123' })
                            .end((err, res) => {
                                expect(res).to.have.status(400);
                                expect(res.body).to.have.property('error').that.equals('Invalid format for email');
                                done();
                            });
                    });
                    it('Successfully registered account (should return 200)', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'existUser123' })
                            .expect(200)
                            .expect((res) => {
                                if (!(res.body.cookie)) {
                                  throw new Error('Cookie not found in response body');
                                }})
                            .end((err, res) => {
                                if (err) throw err;
                                loginCookie = res.body.cookie;
                                done();
                            });
        
                    });
                });
            });
        });
    });
});