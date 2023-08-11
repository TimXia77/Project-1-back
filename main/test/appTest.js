
//Requires:
const chai = require('chai');
const chaiHttp = require('chai-http');
const supertest = require('supertest'); //chai-http redirects immediately, supertest allows the saving of redirection urls
const app = require("../server").startServer(4000);
const cookieParser = require("cookie-parser");

//Data access layer (to clear login data before testing) 
const dataLayer = require('../../data.js');

//Middleware
const { expect } = chai;
chai.use(chaiHttp);
app.use(cookieParser());

//constants
const existUserTest = 'existUserTest';  //should always exist
const newUserTest = 'newUserTest';      //should never exist

var loginCookie;                        //transports cookie string between tests
var redirectUrl;                        //transports redirected urls between tests


//API Automated Tests:
describe('Login and Register:\n', () => {
    dataLayer.deleteUser('existUserTest');

    describe('Successful Requests', () => {
        describe('POST /register', () => {
            it('Successfully registered account (should return 200)', (done) => {
                supertest(app)
                    .post('/register')
                    .send({ email: 'TestTest@test.test', username: existUserTest, password: 'existUser123' })
                    .expect(200)
                    .end((err, res) => {
                        if (err) throw err;
                        if (!(res.body.token)) {
                            throw new Error('Token not found in response body');
                        }
                        done();
                    });
            });
            // it('Checking if /register redirected to /table correctly', (done) => {
            //     chai.request(app)
            //         .get(redirectUrl)
            //         .set('Cookie', loginCookie)
            //         .end((err, res) => {
            //             expect(res).to.have.status(200);
            //             expect(res).to.be.html;
            //             expect(res.text).to.include(`<table id="dataTable" class="display" style="width:100%" table class="wb-tables table table-striped table-hover" data-wb-tables='{ "ordering" : false }'>`);
            //             expect(res.text).to.include(`<button type="button" class="btn btn-default" id="logoutButton">LOGOUT</button>`);
            //             done();
            //         });
            // });
        });
        describe('POST /login', () => {
            it('Successfully logged in to account (should return 302)', (done) => {
                supertest(app)
                    .post('/login')
                    .send({ username: existUserTest, password: 'existUser123' })
                    .expect(200)
                    .end((err, res) => {
                        if (err) throw err;
                        if (!(res.body.token)) {
                            throw new Error('Token not found in response body');
                        }
                        done();
                    });
            });
            // it('Checking if /login redirected to /table correctly', (done) => {
            //     chai.request(app)
            //         .get(redirectUrl)
            //         .set('Cookie', loginCookie)
            //         .end((err, res) => {
            //             expect(res).to.have.status(200);
            //             expect(res).to.be.html;
            //             expect(res.text).to.include(`<table id="dataTable" class="display" style="width:100%" table class="wb-tables table table-striped table-hover" data-wb-tables='{ "ordering" : false }'>`);
            //             expect(res.text).to.include(`<button type="button" class="btn btn-default" id="logoutButton">LOGOUT</button>`);
            //             done();
            //         });
            // });
        });
        // describe('POST /logout', () => {
        //     it('Successfully logged out of account (should return 302)', (done) => {
        //         supertest(app)
        //             .post('/logout')
        //             .expect(302)
        //             .set('Cookie', `token=${loginCookie}`)
        //             .end((err, res) => {
        //                 if (err) throw err;
        //                 redirectUrl = res.headers.location; // for the next test
        //                 done();
        //             });
        //     });
        //     // it('Checking if /logout redirected to /login correctly without a cookie', (done) => {
        //     //     chai.request(app)
        //     //         .get(redirectUrl)
        //     //         .end((err, res) => {
        //     //             expect(res).to.have.status(200); //if status 200, then must have loaded page correctly
        //     //             done();
        //     //         });
        //     // });
        // });
    });
    describe('Unsuccessful Requests', () => {
        describe('POST /login', () => {
            it('Tried to login with invalid username', (done) => {
                supertest(app)
                    .post('/login')
                    .send({ username: newUserTest, password: '123abcDEF' })
                    .expect(401)
                    .end((err, res) => {
                        if (err) throw err;
                        if (!(res.body.error == "Username or password is incorrect.")) {
                            throw new Error('Incorrect or no error res object.');
                        } else 
                        done();
                    });
            });
            it('Tried to register with invalid password', (done) => {
                supertest(app)
                    .post('/login')
                    .send({ username: existUserTest, password: 'badUser123' })
                    .expect(401)
                    .end((err, res) => {
                        if (err) throw err;
                        if (!(res.body.error == "Username or password is incorrect.")) {
                            throw new Error('Incorrect or no error res object.');
                        } else 
                        done();
                    });
            });
        });
        describe('POST /register', () => {
            //taken usernames and emails
            describe('Registering with taken information', () => {
                it('Tried to register with taken username', (done) => {
                    supertest(app)
                        .post('/register')
                        .send({ email: 'timxiaa@gmail.com', username: existUserTest, password: 'existUser123' })
                        .expect(409)
                        .end((err, res) => {
                            if (err) throw err;
                            if (!(res.body.error == "Username is already taken by another user")) {
                                throw new Error('Incorrect or no error res object.');
                            } else 
                            done();
                        });
                });
                it('Tried to register with taken email', (done) => {
                    supertest(app)
                        .post('/register')
                        .send({ email: 'TestTest@test.test', username: 'TimXia7777', password: 'existUser123' })
                        .expect(409)
                        .end((err, res) => {
                            if (err) throw err;
                            if (!(res.body.error == "Email is already taken by another user")) {
                                throw new Error('Incorrect or no error res object.');
                            } else 
                            done();
                        });
                });
                it('Tried to register with taken username and taken email', (done) => {
                    supertest(app)
                        .post('/register')
                        .send({ email: 'TestTest@test.test', username: existUserTest, password: 'existUser123' })
                        .expect(409)
                        .end((err, res) => {
                            if (err) throw err;
                            if (!(res.body.error == "Username and email are taken by another user")) {
                                throw new Error('Incorrect or no error res object.');
                            } else 
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
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'password' })
                            .expect(400)
                            .end((err, res) => {
                                if (err) throw err;
                                if (!(res.body.error == "Invalid format for password")) {
                                    throw new Error('Incorrect or no error res object.');
                                } else 
                                done();
                            });
                        
                    });
                    it('Error when missing an uppercase letter', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'password123' })
                            .expect(400)
                            .end((err, res) => {
                                if (err) throw err;
                                if (!(res.body.error == "Invalid format for password")) {
                                    throw new Error('Incorrect or no error res object.');
                                } else 
                                done();
                            });
                    });
                    it('Error when missing an lowercase letter', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'PASSWORD123' })
                            .expect(400)
                            .end((err, res) => {
                                if (err) throw err;
                                if (!(res.body.error == "Invalid format for password")) {
                                    throw new Error('Incorrect or no error res object.');
                                } else 
                                done();
                            });
                    });
                    it('Error when missing an password is shorter than 8 characters', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'Pass123' })
                            .expect(400)
                            .end((err, res) => {
                                if (err) throw err;
                                if (!(res.body.error == "Invalid format for password")) {
                                    throw new Error('Incorrect or no error res object.');
                                } else 
                                done();
                            });
                    });
                });
                describe('Registering with invalid username format (including test username)', () => {
                    it('Error when username is shorter than 2 characters', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: 'H', password: 'existUser123' })
                            .expect(400)
                            .end((err, res) => {
                                if (err) throw err;
                                if (!(res.body.error == "Invalid format for username")) {
                                    throw new Error('Incorrect or no error res object.');
                                } else 
                                done();
                            });
                    });
                    it('1. Error when username contains non-numerical and non-underscore characters ', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: 'username!@#$%^&*()', password: '123abcDEF' })
                            .expect(400)
                            .end((err, res) => {
                                if (err) throw err;
                                if (!(res.body.error == "Invalid format for username")) {
                                    throw new Error('Incorrect or no error res object.');
                                } else 
                                done();
                            });
                    });
                    it('2. Error when username contains non-numerical and non-underscore characters ', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: 'Hi`~{}|:"', password: 'existUser123' })
                            .expect(400)
                            .end((err, res) => {
                                if (err) throw err;
                                if (!(res.body.error == "Invalid format for username")) {
                                    throw new Error('Incorrect or no error res object.');
                                } else 
                                done();
                            });
                    });
                    it('3. Error when username contains non-numerical and non-underscore characters ', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: 'Hi<>?,./>', password: 'existUser123' })
                            .expect(400)
                            .end((err, res) => {
                                if (err) throw err;
                                if (!(res.body.error == "Invalid format for username")) {
                                    throw new Error('Incorrect or no error res object.');
                                } else 
                                done();
                            });
                    });
                });
                describe('Registering with invalid email formats then registering with correct', () => { 
                    it('Error when missing an @ sign', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'notAValidEmail', username: existUserTest, password: 'existUser123' })
                            .expect(400)
                            .end((err, res) => {
                                if (err) throw err;
                                if (!(res.body.error == "Invalid format for email")) {
                                    throw new Error('Incorrect or no error res object.');
                                } else 
                                done();
                            });
                    });
                    it('Successfully registered account (should return 200)', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'existUser123' })
                            .expect(200)
                            .end((err, res) => {
                                if (err) throw err;
                                if (!(res.body.token)) {
                                    throw new Error('Token not found in response body');
                                }
                                done();
                            });
                    });
                });
            });
        });
    });
});