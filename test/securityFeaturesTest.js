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
});