## Rate Limiter

## Table of contents
1. [Description](#description)
2. [Technology](#technology)
3. [Usage](#usage)

## Description

Node.js based rate limiter implemented using the token bucket algorithm. It controls request traffic to prevent abuse by allowing customizable limits on user requests, thereby enhancing the performance and reliability of an application.

## Technology

- [Node](https://redux.js.org/)
- [Express](https://expressjs.com/)
- [Mocha](https://mochajs.org/)
- [Chai](https://www.chaijs.com/)
- Token bucket algorithm

## Usage

To run this on your local machine, first ensure you have Node installed. Link available in the [Technology](#technology) section.

1. Clone the repository to your local machine. 
```bash
git clone https://github.com/DavidLapadula/rate-limiter.git
cd rate-limiter
```  

2. Open a terminal in the root directory and run:
```bash
npm install
``` 

3. Use the `config.json` to configure which endpoints are accepted by the rate limiter. Sample values are provided.
- "endpoint": a string representing the request type and endpoint
- "burst": the maximum amount of tokens that can be added to a bucket
- "sustained": how many tokens will be refilled per minute

4. Open a terminal in the root directory and run:
```bash
npm start
``` 

5. The `/take` endpoint will be available at port 3000 and will accept any endpoint configured in the `config.json`
- Ex:  `http://localhost:3000/take?endpoint=GET /user/:id`

6. To test the endpoints, open a terminal in the root directory and run the command: 
```bash
npm test
``` 
- The following tests will be run:
  - Return the tokens remaning for an endpoint
  - Consume token on an endpoint
  - Ensure request rejects when out of tokens
  - Induce 404 from unconfigured endpoint
  - Refill tokens
