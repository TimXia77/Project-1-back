
//Requires:
const chai = require('chai');
const chaiHttp = require('chai-http');
const supertest = require('supertest'); //limitations with chai-http -> redirects automatically 
const app = require("../server");
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

var loginCookie; //transports cookie string between tests
var redirectUrl; //transports redirected urls between tests


describe('Login and Register:\n', () => {
    dataLayer.deleteUser('existUserTest');
    // after(() => {
    //     await (dataLayer.addUser('TestTest@test.test', 'existUserTest', 'existUser123')); 
    //     console.log("HERE");
    // });

    describe('Successful Requests', () => {
        // describe('GET /register', () => {
        //     it('Should render the register-en page (html) successfully', (done) => {
        //         chai.request(app)
        //             .get('/register')
        //             .end((err, res) => {
        //                 expect(res).to.have.status(200);
        //                 expect(res).to.be.html;
        //                 expect(res.text).to.include('<h1 class="mrgn-bttm-lg">Register</h1>');
        //                 expect(res.text).to.include('Must contain at least one number, one uppercase letter, one lowercase letter, and at least 8 or more characters');
        //                 done();
        //             });
        //     });
        // });
        // describe('GET /login', () => {
        //     it('Should render the login-en page (html) successfully', (done) => {
        //         chai.request(app)
        //             .get('/login')
        //             .end((err, res) => {
        //                 expect(res).to.have.status(200);
        //                 expect(res).to.be.html;
        //                 expect(res.text).to.include('<h1 class="mrgn-bttm-lg">Login</h1>');
        //                 expect(res.text).to.include('<a href="/register">Register now</a>');
        //                 done();
        //             });
        //     });
        // });
        describe('POST /register', () => {
            it('Successfully registered account (should return 302)', (done) => {
                supertest(app)
                    .post('/register')
                    .send({ email: 'TestTest@test.test', username: existUserTest, password: 'existUser123' })
                    .expect(302)
                    .expect('set-cookie', /token=/)
                    .end((err, res) => {
                        if (err) throw err;
                        redirectUrl = res.headers.location; // for the next test
                        loginCookie = res.headers['set-cookie'];
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
                    .expect(302)
                    .expect('set-cookie', /token=/)
                    .end((err, res) => {
                        if (err) throw err;
                        redirectUrl = res.headers.location; // for the next test
                        loginCookie = res.headers['set-cookie'];
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
        describe('POST /logout', () => {
            it('Successfully logged out of account (should return 302)', (done) => {
                supertest(app)
                    .post('/logout')
                    .expect(302)
                    .set('Cookie', `token=${loginCookie}`)
                    .end((err, res) => {
                        if (err) throw err;
                        redirectUrl = res.headers.location; // for the next test
                        done();
                    });
            });
            // it('Checking if /logout redirected to /login correctly wihtout a cookie', (done) => {
            //     chai.request(app)
            //         .get(redirectUrl)
            //         .end((err, res) => {
            //             expect(res).to.have.status(200); //if status 200, then must have loaded page correctly
            //             done();
            //         });
            // });
        });
    });
    describe('Unsuccessful Requests', () => {
        describe('POST /login', () => {
            it('Tried to login with invalid username', (done) => {
                supertest(app)
                    .post('/login')
                    .send({ username: newUserTest, password: '123abcDEF' })
                    .expect(302)
                    .end((err, res) => {
                        if (err) throw err;
                        expect(res.header.location).to.equal('/login?error=login');
                        done();
                    });
            });
            it('Tried to register with invalid password', (done) => {
                supertest(app)
                    .post('/login')
                    .send({ username: existUserTest, password: 'badUser123' })
                    .expect(302)
                    .end((err, res) => {
                        if (err) throw err;
                        expect(res.header.location).to.equal('/login?error=login');
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
                        .expect(302)
                        .end((err, res) => {
                            if (err) throw err;
                            expect(res.header.location).to.equal('/register?error=taken-user');
                            done();
                        });
                });
                it('Tried to register with taken email', (done) => {
                    supertest(app)
                        .post('/register')
                        .send({ email: 'TestTest@test.test', username: 'TimXia7777', password: 'existUser123' })
                        .expect(302)
                        .end((err, res) => {
                            if (err) throw err;
                            expect(res.header.location).to.equal('/register?error=taken-email');
                            done();
                        });
                });
                it('Tried to register with taken username and taken email', (done) => {
                    supertest(app)
                        .post('/register')
                        .send({ email: 'TestTest@test.test', username: existUserTest, password: 'existUser123' })
                        .expect(302)
                        .end((err, res) => {
                            if (err) throw err;
                            expect(res.header.location).to.equal('/register?error=taken-user-email');
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
                            .expect(302)
                            .end((err, res) => {
                                if (err) throw err;
                                expect(res.header.location).to.equal('/register?error=password');
                                done();
                            });
                        
                    });
                    it('Error when missing an uppercase letter', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'password123' })
                            .expect(302)
                            .end((err, res) => {
                                if (err) throw err;
                                expect(res.header.location).to.equal('/register?error=password');
                                done();
                            });
                    });
                    it('Error when missing an lowercase letter', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'PASSWORD123' })
                            .expect(302)
                            .end((err, res) => {
                                if (err) throw err;
                                expect(res.header.location).to.equal('/register?error=password');
                                done();
                            });
                    });
                    it('Error when missing an password is shorter than 8 characters', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'Pass123' })
                            .expect(302)
                            .end((err, res) => {
                                if (err) throw err;
                                expect(res.header.location).to.equal('/register?error=password');
                                done();
                            });
                    });
                });
                describe('Registering with invalid username format (including test username)', () => {
                    it('Error when username is shorter than 2 characters', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: 'H', password: 'existUser123' })
                            .expect(302)
                            .end((err, res) => {
                                if (err) throw err;
                                expect(res.header.location).to.equal('/register?error=username');
                                done();
                            });
                    });
                    it('1. Error when username contains non-numerical and non-underscore characters ', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: 'username!@#$%^&*()', password: '123abcDEF' })
                            .expect(302)
                            .end((err, res) => {
                                if (err) throw err;
                                expect(res.header.location).to.equal('/register?error=username');
                                done();
                            });
                    });
                    it('2. Error when username contains non-numerical and non-underscore characters ', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: 'Hi`~{}|:"', password: 'existUser123' })
                            .expect(302)
                            .end((err, res) => {
                                if (err) throw err;
                                expect(res.header.location).to.equal('/register?error=username');
                                done();
                            });
                    });
                    it('3. Error when username contains non-numerical and non-underscore characters ', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: 'Hi<>?,./>', password: 'existUser123' })
                            .expect(302)
                            .end((err, res) => {
                                if (err) throw err;
                                expect(res.header.location).to.equal('/register?error=username');
                                done();
                            });
                    });
                });
                describe('Registering with invalid email formats then registering with correct', () => { 
                    it('Error when missing an @ sign', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'notAValidEmail', username: existUserTest, password: 'existUser123' })
                            .expect(302)
                            .end((err, res) => {
                                if (err) throw err;
                                expect(res.header.location).to.equal('/register?error=email');
                                done();
                            });
                    });
                    it('Successfully registered account', (done) => {
                        supertest(app)
                            .post('/register')
                            .send({ email: 'TestTest@test.test', username: existUserTest, password: 'existUser123' })
                            .expect(302)
                            .expect('set-cookie', /token=/)
                            .end((err, res) => {
                                if (err) throw err;
                                redirectUrl = res.headers.location; // for the next test
                                loginCookie = res.headers['set-cookie'];
                                done();
                            });
        
                    });
                });
            });
        });
    });
});