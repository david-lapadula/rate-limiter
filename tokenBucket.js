 /**
   * Creates an instance of TokenBucket.
   * @param {number} burst - The maximum number of tokens (i.e requests) allowed in the bucket.
   * @param {number} sustained - The rate at which tokens are refilled per minute.
   */
  
 class TokenBucket {
    constructor(burst, sustained) {
        this.burst = burst;
        this.tokens = burst;
        this.sustained = sustained;
        this.lastRefill = Date.now();
        this.tokenInterval = 60000 / sustained; // determine interval in ms to add one token
        this.nextRefill = this.lastRefill + this.tokenInterval;
    }
    
    
    /**
     * Refills the token bucket based on the elapsed time.
    */
    refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;

        if (elapsed >= this.tokenInterval) {
            const tokensToAdd = Math.floor(elapsed / this.tokenInterval);
            this.tokens = Math.min(this.tokens + tokensToAdd, this.burst);
            this.lastRefill = now;
        }
    }
    
    
    /**
     * Attempts to consume one token from the bucket.
     * @returns {boolean} True if a token was consumed, false if no tokens are available.
     */
    
    take() {
        this.refill();
        
        if (this.tokens >=1) {
            this.tokens -= 1;
            return true;
        }
        
        return false;
    }
    
    
    /**
     * Gets the current number of remaining tokens.
     * @returns {number} The number of remaining tokens.
     */
    getTokensRemaining() {
        this.refill();
        return this.tokens;
    }
}

module.exports = TokenBucket;