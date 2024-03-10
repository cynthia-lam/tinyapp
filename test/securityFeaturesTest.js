const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const appUrl = "http://localhost:8080";

chai.use(chaiHttp);

describe('URL Shortener App', function() {
  let agent;

  beforeEach(function() {
    agent = chai.request.agent(appUrl);
  });

  afterEach(function() {
    agent.close();
  });

  it('GET / should redirect to /login with status code 302 if the user is not logged in', function() {
    return agent
      .get('/').redirects(0)
      .end((err, res, body) => {
        assert.isTrue(res.redirect);
        assert.match(res.headers.location, /login/);
        assert.equal(res.status, 302);
      });
  });

  it('GET /urls/new should redirect to /login with status code 302 if the user is not logged in', function() {
    return agent
      .get('/urls/new').redirects(0)
      .end((err, res, body) => {
        assert.isTrue(res.redirect);
        assert.match(res.headers.location, /login/);
        assert.equal(res.status, 302);
      });
  });
  
  it('GET /urls/NOTEXISTS should return 404', function() {
    return agent
      .get('/urls/NOTEXISTS').redirects(0)
      .then(function(res) {
        assert.equal(res.status, 404);
      });
  });
  
  it('GET /urls/b2xVn2 should return 403', function() { //////still doesnt work
    return agent
      .get('/urls/b2xVn2').redirects(0)
      .then(function(res) {
        assert.equal(res.status, 403);
      });
  });
});