const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const config = require('../config.json');

chai.use(chaiHttp);

const { expect } = chai;

describe('Rate Limiter', function() {
  this.timeout(5000); // Set a higher timeout to handle async tests

  beforeEach(() => {
    app.resetLimits();
  });

  it('return remaining tokens for endpoint', (done) => {
    chai.request(app)
      .get('/take')
      .query({ endpoint: 'GET /user/:id' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('success', true);
        expect(res.body).to.have.property('remainingTokens').that.is.a('number');
        done();
      });
  });

  it('consume token for endpoint', (done) => {
    chai.request(app)
      .get('/take')
      .query({ endpoint: 'GET /user/:id' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        const remainingTokensAfterFirstRequest = res.body.remainingTokens;

        chai.request(app)
          .get('/take')
          .query({ endpoint: 'GET /user/:id' })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('remainingTokens', remainingTokensAfterFirstRequest - 1);
            done();
          });
      });
  });

  it('reject requests when out of tokens', function(done) {
    this.timeout(65000); // Test takes longer than Mocha default, so set higher to ensure test runs
    const endpoint = 'PATCH /user/:id';
    const burstLimit = config.rateLimitsPerEndpoint.find(e => e.endpoint === endpoint).burst;

    let requests = [];
    for (let i = 0; i < burstLimit; i++) {
      requests.push(
        chai.request(app)
          .get('/take')
          .query({ endpoint: endpoint })
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('success', true);
          })
      );
    }

    // After burst limit is reached this will fail
    Promise.all(requests).then(() => {
      chai.request(app)
        .get('/take')
        .query({ endpoint: endpoint })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('remainingTokens', 0);
          done();
        });
    });
  });
  
   it('should return 404 for endpoint not in config', (done) => {
      const nonExistingEndpoint = 'GET /non_existing_endpoint';

      // Check if the endpoint exists in config
      const endpointExists = config.rateLimitsPerEndpoint.some(endpointConfig => endpointConfig.endpoint === nonExistingEndpoint);

      if (endpointExists) {
        throw new Error(`Test setup error: ${nonExistingEndpoint} exists in config.json`);
      }

      chai.request(app)
        .get('/take')
        .query({ endpoint: nonExistingEndpoint })
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('error').equal(`${nonExistingEndpoint} is not a valid endpoint.`);
          done();
        });
    });

  it('should refill tokens over time', function(done) {
    this.timeout(65000); // Test takes longer than Mocha default, so set higher to ensure test runs
    const endpoint = 'POST /userinfo';
    const burstLimit = config.rateLimitsPerEndpoint.find(e => e.endpoint === endpoint).burst;
  

    let requests = [];
    for (let i = 0; i < burstLimit; i++) {
      requests.push(
        chai.request(app)
          .get('/take')
          .query({ endpoint: endpoint })
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('success', true);
          })
      );
    }

    // Wait for a minute to allow token refill
    setTimeout(() => {
      chai.request(app)
        .get('/take')
        .query({ endpoint: endpoint })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          done();
        });
    }, 60000);
  });

});