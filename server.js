const express = require('express');
const fs = require('fs');
const TokenBucket = require('./tokenBucket');

const app = express();
app.use(express.json());

let limits = {};

function loadConfig() {
  const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  config.rateLimitsPerEndpoint.forEach(limit => {
    limits[limit.endpoint] = new TokenBucket(limit.burst, limit.sustained);
  });
}

// Load configuration initially
loadConfig();

app.get('/take', (req, res) => {
  const endpoint = req.query.endpoint;
  
  if(!limits[endpoint]) {
    return res.status(404).json({error: `${endpoint} is not a valid endpoint.`})  
  }
  
  const bucket = limits[endpoint];
  const success = bucket.take();
  
  res.json({
    success: success,
    remainingTokens: bucket.getTokensRemaining()
  })
  
});  


// Reset limits, for testing
app.resetLimits = () => {
  loadConfig();
};

module.exports = app;