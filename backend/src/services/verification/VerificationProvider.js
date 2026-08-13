/**
 * Abstract VerificationProvider interface.
 * All concrete LLM verification providers (Groq, Gemini, Mock) must extend this class.
 */
class VerificationProvider {
  constructor(name = 'BaseVerificationProvider') {
    this.name = name;
  }

  /**
   * Evaluates a user claim against retrieved candidate evidence.
   * @param {string} userClaim - Normalized user claim text
   * @param {array} evidenceMatches - List of candidate evidence claim objects
   * @returns {Promise<object>} Parsed LLM verification response object
   */
  async verify(userClaim, evidenceMatches) {
    throw new Error(`VerificationProvider.verify() is not implemented in ${this.name}`);
  }
}

module.exports = VerificationProvider;
