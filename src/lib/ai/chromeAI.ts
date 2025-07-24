import { AISession, AISessionOptions } from "@/types/misinformation";

class ChromeAIManager {
  private session: AISession | null = null;
  private isInitializing = false;
  private initializationPromise: Promise<boolean> | null = null;

  /**
   * Check if Chrome's built-in AI is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      if (!self.LanguageModel) {
        console.warn("Chrome AI not available - self.LanguageModel not found");
        return false;
      }

      console.log("Chrome AI is available");
      return true;
    } catch (error) {
      console.error("Error checking AI availability:", error);
      return false;
    }
  }

  /**
   * Initialize AI session with retry logic
   */
  async initialize(force = false): Promise<boolean> {
    if (this.session && !force) {
      return true;
    }

    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    this.isInitializing = true;
    this.initializationPromise = this._performInitialization();

    try {
      const result = await this.initializationPromise;
      return result;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  private async _performInitialization(): Promise<boolean> {
    try {
      // Check availability first
      const isAvailable = await this.checkAvailability();
      if (!isAvailable) {
        console.warn("Chrome AI not available for initialization");
        return false;
      }

      // Destroy existing session if any
      if (this.session) {
        try {
          this.session.destroy();
        } catch (error) {
          console.warn("Error destroying previous session:", error);
        }
      }

      // Create new session with misinformation detection system prompt
      const sessionOptions: AISessionOptions = {
        systemPrompt: `You are a misinformation detection expert. Your job is to analyze social media posts (tweets) for potentially false, misleading, or unverified information.

Instructions:
1. Analyze the content for factual accuracy, misleading claims, and potential misinformation
2. Consider the context and any obvious satire or opinion content
3. Rate the probability of misinformation on a scale of 0-100%
4. Identify key topics and entities mentioned
5. Provide brief reasoning for your assessment

Response format:
{
  "confidence": [number 0-100],
  "topics": ["topic1", "topic2"],
  "reasoning": "Brief explanation of assessment"
}

Be objective and focus on factual accuracy rather than political opinions.`,
        temperature: 0.3, // Lower temperature for more consistent results
        topK: 10, // Limit randomness for factual analysis
      };

      this.session = await self.LanguageModel!.create(sessionOptions);
      console.log("Chrome AI session created successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize Chrome AI session:", error);
      this.session = null;
      return false;
    }
  }

  /**
   * Get current AI session or create new one
   */
  async getSession(): Promise<AISession | null> {
    if (!this.session) {
      const initialized = await this.initialize();
      if (!initialized) {
        return null;
      }
    }
    return this.session;
  }

  /**
   * Check if AI is ready to use
   */
  isReady(): boolean {
    return this.session !== null;
  }

  /**
   * Cleanup session
   */
  cleanup(): void {
    if (this.session) {
      try {
        this.session.destroy();
      } catch (error) {
        console.warn("Error during cleanup:", error);
      }
      this.session = null;
    }
  }

  /**
   * Execute a prompt with error handling and retries
   */
  async executePrompt(prompt: string, retries = 1): Promise<string | null> {
    const session = await this.getSession();
    if (!session) {
      console.warn("No AI session available for prompt execution");
      return null;
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await session.prompt(prompt);
        return response;
      } catch (error) {
        console.error(
          `AI prompt execution failed (attempt ${attempt + 1}):`,
          error,
        );

        if (attempt < retries) {
          // Try to reinitialize session for retry
          await this.initialize(true);
        }
      }
    }

    return null;
  }
}

export const chromeAI = new ChromeAIManager();

// Export for testing and direct access
export { ChromeAIManager };
