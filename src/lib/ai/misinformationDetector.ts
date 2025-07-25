import { z } from "zod";
import { chromeAI } from "./chromeAI";
import {
  MisinformationAnalysis,
  AIAnalysisResponse,
} from "@/types/misinformation";
import { TweetData } from "@/types";
import type {
  NewsVerificationResult,
  NewsDataResponse,
  NewsResult,
} from "@/types/news";

// Zod schema for AI response validation
const AIResponseSchema = z.object({
  confidence: z.coerce.number().min(0).max(100).default(50),
  topics: z.array(z.string()).max(3).default([]),
  reasoning: z.string().min(1).default("AI analysis completed"),
});

/**
 * Keywords and patterns for rule-based fallback detection
 */
const MISINFORMATION_KEYWORDS = [
  "fake news",
  "hoax",
  "conspiracy",
  "debunked",
  "false claim",
  "unverified",
  "misleading",
  "manipulated",
  "doctored",
];

const HIGH_RISK_PATTERNS = [
  /\b(breaking|urgent|exclusive).*!{2,}/i,
  /\b(they don't want you to know|hidden truth|cover.?up)\b/i,
  /\b(miracle cure|doctors hate|secret method)\b/i,
  /\b(will shock you|you won't believe)\b/i,
];

/**
 * Use AI to extract relevant keywords from tweet content for news search
 */
async function extractKeywordsWithAI(tweetContent: string): Promise<string[]> {
  try {
    const isReady = await chromeAI.initialize();
    if (!isReady) {
      throw new Error("Chrome AI not available");
    }

    const keywordPrompt = `Extract 3-5 relevant keywords from this tweet for news search:

"${tweetContent}"

Focus on:
- Main topics, people, places, events
- Factual claims that can be verified
- Important entities or concepts
- Avoid common words, hashtags, and URLs

Return only the keywords as a JSON array: ["keyword1", "keyword2", "keyword3"]`;

    const aiResponse = await chromeAI.executePrompt(keywordPrompt, 1);

    if (!aiResponse) {
      throw new Error("AI response was null");
    }

    // Extract keywords from AI response
    const jsonMatch = aiResponse.match(/\[(.*?)\]/);
    if (jsonMatch) {
      try {
        const keywords = JSON.parse(`[${jsonMatch[1]}]`);
        return keywords
          .filter((k: any) => typeof k === "string" && k.trim().length > 2)
          .slice(0, 5);
      } catch (parseError) {
        console.warn("Failed to parse AI keywords response:", parseError);
      }
    }

    // Fallback: simple extraction
    return extractSimpleKeywords(tweetContent);
  } catch (error) {
    console.warn("AI keyword extraction failed, using fallback:", error);
    return extractSimpleKeywords(tweetContent);
  }
}

/**
 * Simple fallback keyword extraction if AI fails
 */
function extractSimpleKeywords(tweetContent: string): string[] {
  const cleanContent = tweetContent
    .replace(/https?:\/\/[^\s]+/g, "") // Remove URLs
    .replace(/@[\w]+/g, "") // Remove mentions
    .replace(/#[\w]+/g, "") // Remove hashtags
    .replace(/[^\w\s]/g, " ") // Remove punctuation
    .toLowerCase();

  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
  ]);

  return cleanContent
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, 5);
}

/**
 * Simple fetch to NewsData.io API with keywords
 */
async function fetchNewsData(keywords: string[]): Promise<NewsResult[]> {
  const apiKey = import.meta.env.VITE_NEWSDATA_API_KEY;

  if (!apiKey) {
    console.warn("NewsData.io API key not configured");
    return [];
  }

  if (keywords.length === 0) {
    return [];
  }

  try {
    const query = keywords.join(" ");
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(query)}&language=en&size=5`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NewsData.io API error: ${response.status}`);
    }

    const data: NewsDataResponse = await response.json();

    // Convert to simplified format with relevance scoring
    return data.results
      .map((article) => ({
        title: article.title,
        source: article.source_id,
        relevanceScore: calculateSimpleRelevance(
          keywords.join(" "),
          article.title + " " + article.description,
        ),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error("News fetch failed:", error);
    return [];
  }
}

/**
 * Simple relevance calculation between keywords and article text
 */
function calculateSimpleRelevance(
  keywords: string,
  articleText: string,
): number {
  const keywordWords = keywords.toLowerCase().split(/\s+/);
  const articleWords = articleText.toLowerCase().split(/\s+/);

  let matches = 0;
  keywordWords.forEach((keyword) => {
    if (
      articleWords.some(
        (word) => word.includes(keyword) || keyword.includes(word),
      )
    ) {
      matches++;
    }
  });

  return matches / keywordWords.length;
}

/**
 * Analyze tweet content for misinformation using NewsData.io verification + Chrome AI
 */
export async function analyzeTweet(
  tweetData: TweetData,
): Promise<MisinformationAnalysis> {
  try {
    // First try news-enhanced analysis
    return await performNewsEnhancedAnalysis(tweetData);
  } catch (error) {
    console.error(
      "News-enhanced analysis failed, falling back to basic AI analysis:",
      error,
    );
    try {
      return await performAIAnalysis(tweetData);
    } catch (aiError) {
      console.error(
        "AI analysis also failed, falling back to rule-based detection:",
        aiError,
      );
      return performRuleBasedAnalysis(tweetData);
    }
  }
}

/**
 * Perform news-enhanced analysis: AI keyword extraction → News fetch → AI analysis with context
 */
async function performNewsEnhancedAnalysis(
  tweetData: TweetData,
): Promise<MisinformationAnalysis> {
  console.log(
    "CheckX: Starting simplified news-enhanced analysis for tweet",
    tweetData.id,
  );

  // Step 1: Extract keywords using AI
  console.log("CheckX: Extracting keywords with AI...");
  const keywords = await extractKeywordsWithAI(tweetData.content);
  console.log("CheckX: Extracted keywords:", keywords);

  // Step 2: Fetch news data using those keywords
  console.log("CheckX: Fetching news data...");
  const newsArticles = await fetchNewsData(keywords);
  console.log("CheckX: Found", newsArticles.length, "news articles");

  // Step 3: Create news verification context
  let newsVerification: NewsVerificationResult;
  let newsVerificationText = "";

  if (newsArticles.length > 0) {
    const avgRelevance =
      newsArticles.reduce((sum, article) => sum + article.relevanceScore, 0) /
      newsArticles.length;

    // Determine verification status based on article relevance
    let verificationStatus: NewsVerificationResult["verificationStatus"];
    if (avgRelevance > 0.4) {
      verificationStatus = "verified";
    } else if (avgRelevance > 0.2) {
      verificationStatus = "mixed";
    } else {
      verificationStatus = "no_coverage";
    }

    newsVerification = {
      articles: newsArticles.slice(0, 3),
      verificationStatus,
      summary: `Found ${newsArticles.length} news articles with average relevance of ${Math.round(avgRelevance * 100)}%. Sources: ${newsArticles
        .slice(0, 3)
        .map((a) => a.source)
        .join(", ")}`,
      confidenceScore: Math.round(avgRelevance * 100),
    };

    newsVerificationText =
      `News verification context:\n` +
      `Status: ${verificationStatus}\n` +
      `Keywords used: ${keywords.join(", ")}\n` +
      `Summary: ${newsVerification.summary}\n` +
      `Top articles:\n` +
      newsArticles
        .slice(0, 3)
        .map(
          (article, index) =>
            `${index + 1}. "${article.title}" from ${article.source} (${Math.round(article.relevanceScore * 100)}% relevant)`,
        )
        .join("\n");
  } else {
    newsVerification = {
      articles: [],
      verificationStatus: "no_coverage",
      summary: `No news articles found for keywords: ${keywords.join(", ")}`,
      confidenceScore: 0,
    };
    newsVerificationText = `News verification: No relevant news coverage found for this topic.`;
  }

  console.log("CheckX: News verification completed", {
    status: newsVerification.verificationStatus,
    articlesFound: newsVerification.articles.length,
    confidenceScore: newsVerification.confidenceScore,
  });

  // Step 4: Perform AI analysis with news context
  const isReady = await chromeAI.initialize();
  if (!isReady) {
    throw new Error("Chrome AI not available");
  }

  const analysisPrompt = createNewsEnhancedAnalysisPrompt(
    tweetData,
    newsVerificationText,
  );
  const aiResponse = await chromeAI.executePrompt(analysisPrompt, 1);

  if (!aiResponse) {
    throw new Error("AI response was null");
  }

  const parsedResponse = parseAIResponse(aiResponse);

  // Step 5: Adjust confidence based on news verification
  let finalConfidence = parsedResponse.confidence;
  let finalReasoning = parsedResponse.reasoning;

  switch (newsVerification.verificationStatus) {
    case "verified":
      finalConfidence = Math.max(0, finalConfidence - 15);
      finalReasoning += ` News verification: Content is supported by recent news coverage.`;
      break;
    case "contradicted":
      finalConfidence = Math.min(100, finalConfidence + 25);
      finalReasoning += ` News verification: Content contradicts recent news reports.`;
      break;
    case "mixed":
      finalReasoning += ` News verification: Mixed news coverage found - some support, some contradiction.`;
      break;
    case "no_coverage":
      finalReasoning += ` News verification: No recent news coverage found on this topic.`;
      break;
  }

  const analysis: MisinformationAnalysis = {
    confidence: finalConfidence,
    rating: determineRating(finalConfidence),
    topics: parsedResponse.topics,
    reasoning: finalReasoning,
    timestamp: new Date().toISOString(),
    source: "news_enhanced",
    newsContext:
      newsVerification.articles.length > 0
        ? {
            articles: newsVerification.articles.map((article) => ({
              title: article.title,
              description: "",
              url: "",
              source: article.source,
              publishDate: "",
              relevanceScore: article.relevanceScore,
            })),
            verificationStatus: newsVerification.verificationStatus,
            summary: newsVerification.summary,
            confidenceScore: newsVerification.confidenceScore,
          }
        : undefined,
    newsVerification: newsVerificationText,
  };

  console.log("CheckX: Simplified news-enhanced analysis completed", {
    keywords: keywords,
    newsArticlesFound: newsArticles.length,
    originalConfidence: parsedResponse.confidence,
    finalConfidence: finalConfidence,
    newsStatus: newsVerification.verificationStatus,
    finalRating: analysis.rating,
  });

  return analysis;
}

/**
 * Perform AI-powered analysis of tweet content
 */
async function performAIAnalysis(
  tweetData: TweetData,
): Promise<MisinformationAnalysis> {
  // Initialize AI if needed
  const isReady = await chromeAI.initialize();
  console.log("CheckX: AI initialized", isReady, chromeAI);
  if (!isReady) {
    throw new Error("Chrome AI not available");
  }

  const analysisPrompt = createAnalysisPrompt(tweetData);
  const aiResponse = await chromeAI.executePrompt(analysisPrompt, 1);

  if (!aiResponse) {
    throw new Error("AI response was null");
  }

  const parsedResponse = parseAIResponse(aiResponse);
  const analysis: MisinformationAnalysis = {
    confidence: parsedResponse.confidence,
    rating: determineRating(parsedResponse.confidence),
    topics: parsedResponse.topics,
    reasoning: parsedResponse.reasoning,
    timestamp: new Date().toISOString(),
    source: "ai",
  };

  return analysis;
}

/**
 * Create news-enhanced analysis prompt for AI
 */
function createNewsEnhancedAnalysisPrompt(
  tweetData: TweetData,
  newsContext: string,
): string {
  return `Analyze this tweet for misinformation with the provided news verification context:

Content: "${tweetData.content}"
Author: ${tweetData.author}
Posted: ${new Date(tweetData.timestamp).toLocaleDateString()}

${newsContext ? `\n${newsContext}\n` : ""}

Provide your analysis in this exact JSON format:
{
  "confidence": [number from 0-100 representing probability this contains misinformation],
  "topics": ["topic1", "topic2", "topic3"],
  "reasoning": "Brief explanation of why you rated it this way, considering the news verification context"
}

Consider:
- Factual accuracy and verifiability
- Presence of misleading claims or context
- Source credibility indicators
- Obvious satire or opinion vs. presented facts
- Potential harm from false information
- How the tweet content aligns or conflicts with verified news sources
- The credibility and recency of news coverage on this topic

Be objective and precise in your assessment, giving appropriate weight to the news verification context.`;
}

/**
 * Create analysis prompt for AI (legacy version without news context)
 */
function createAnalysisPrompt(tweetData: TweetData): string {
  return `Analyze this tweet for misinformation:

Content: "${tweetData.content}"
Author: ${tweetData.author}
Posted: ${new Date(tweetData.timestamp).toLocaleDateString()}

Provide your analysis in this exact JSON format:
{
  "confidence": [number from 0-100 representing probability this contains misinformation],
  "topics": ["topic1", "topic2", "topic3"],
  "reasoning": "Brief explanation of why you rated it this way"
}

Consider:
- Factual accuracy and verifiability
- Presence of misleading claims or context
- Source credibility indicators
- Obvious satire or opinion vs. presented facts
- Potential harm from false information

Be objective and precise in your assessment.`;
}

/**
 * Parse AI response and extract structured data using Zod validation
 */
function parseAIResponse(response: string): AIAnalysisResponse {
  console.log("AI RESPONSE", response);

  // 1. Simple JSON extraction (no modifications)
  const jsonMatch = response.match(/\{[\s\S]*?\}/);

  if (jsonMatch) {
    try {
      // 2. Single JSON.parse attempt
      const rawData = JSON.parse(jsonMatch[0]);

      // 3. Zod validation with coercion
      const result = AIResponseSchema.safeParse(rawData);

      if (result.success) {
        console.log("Successfully parsed AI response with Zod");
        return {
          confidence: result.data.confidence,
          topics: result.data.topics,
          reasoning: result.data.reasoning,
          raw_response: response,
        };
      } else {
        console.log("Zod validation failed:", result.error.format());
      }
    } catch (error) {
      console.log(
        "JSON parse failed:",
        error instanceof Error ? error.message : String(error),
      );
    }
  } else {
    console.log("No JSON block found in response");
  }

  // 4. Simple fallback extraction
  console.log("Using fallback parsing strategy");
  return createFallbackResponse(response);
}

/**
 * Create fallback response using simple extraction and Zod validation
 */
function createFallbackResponse(response: string): AIAnalysisResponse {
  const extractedData = {
    confidence:
      extractNumberFromPattern(response, /confidence["']?\s*:\s*(\d+)/i) ?? 50,
    topics: extractSimpleArray(response) ?? [],
    reasoning:
      extractReasoning(response) ?? "Analysis completed but format unclear",
  };

  // Still validate through Zod for consistency
  const validated = AIResponseSchema.parse(extractedData);

  return {
    confidence: validated.confidence,
    topics: validated.topics,
    reasoning: validated.reasoning,
    raw_response: response,
  };
}

/**
 * Extract number from regex pattern
 */
function extractNumberFromPattern(
  text: string,
  pattern: RegExp,
): number | null {
  const match = text.match(pattern);
  return match ? parseInt(match[1]) : null;
}

/**
 * Extract topics array with simple parsing
 */
function extractSimpleArray(response: string): string[] {
  const topicsMatch = response.match(/topics["']?\s*:\s*\[(.*?)\]/i);
  if (topicsMatch) {
    const topicsStr = topicsMatch[1];
    const topicMatches = topicsStr.match(/["']([^"']+)["']/g);
    if (topicMatches) {
      return topicMatches
        .map((match) => match.replace(/["']/g, ""))
        .slice(0, 3);
    }
  }

  // Fallback to text extraction
  return extractTopicsFromText(response);
}

/**
 * Extract reasoning with smart quote handling for malformed JSON
 */
function extractReasoning(response: string): string | null {
  // Find the reasoning field start
  const reasoningStart = response.search(/reasoning["']?\s*:\s*/i);
  if (reasoningStart === -1) return null;

  // Find where the value starts (after the colon and optional whitespace)
  const valueStartMatch = response
    .slice(reasoningStart)
    .match(/reasoning["']?\s*:\s*/i);
  if (!valueStartMatch) return null;

  const valueStart = reasoningStart + valueStartMatch[0].length;
  const remainingText = response.slice(valueStart);

  // Determine the quote character used
  const firstChar = remainingText.charAt(0);
  if (firstChar !== '"' && firstChar !== "'") {
    // No quotes, extract until comma, closing brace, or end
    const match = remainingText.match(/^([^,}]*)/);
    return match ? match[1].trim() : null;
  }

  // For quoted strings, find the actual closing quote by looking for contextual clues
  // The real closing quote should be followed by JSON syntax: comma, closing brace, etc.
  const quoteChar = firstChar;
  let possibleEndings: number[] = [];

  // Find all occurrences of the quote character
  for (let i = 1; i < remainingText.length; i++) {
    if (remainingText.charAt(i) === quoteChar) {
      possibleEndings.push(i);
    }
  }

  // Check each possible ending to see if it's followed by valid JSON syntax
  for (let i = possibleEndings.length - 1; i >= 0; i--) {
    const endPos = possibleEndings[i];
    const afterQuote = remainingText.slice(endPos + 1).trim();

    // Check if this quote is followed by valid JSON endings
    if (
      afterQuote.startsWith(",") ||
      afterQuote.startsWith("}") ||
      afterQuote === "" ||
      afterQuote.startsWith("\n}") ||
      afterQuote.startsWith("\r\n}")
    ) {
      // This looks like the real closing quote
      const content = remainingText.slice(1, endPos);
      return content.trim();
    }
  }

  // Fallback: if no contextually valid ending found, take the last quote
  if (possibleEndings.length > 0) {
    const lastQuotePos = possibleEndings[possibleEndings.length - 1];
    const content = remainingText.slice(1, lastQuotePos);
    return content.trim();
  }

  // Final fallback: extract everything until end if no closing quote
  const content = remainingText.slice(1);
  return content.trim() || null;
}

/**
 * Extract topics from unstructured text response
 */
function extractTopicsFromText(text: string): string[] {
  const topics: string[] = [];
  const commonTopics = [
    "health",
    "politics",
    "technology",
    "climate",
    "economy",
    "science",
    "entertainment",
    "sports",
    "breaking news",
  ];

  const lowerText = text.toLowerCase();
  commonTopics.forEach((topic) => {
    if (lowerText.includes(topic)) {
      topics.push(topic);
    }
  });

  return topics.slice(0, 3); // Limit to 3 topics
}

/**
 * Determine rating based on confidence score
 */
function determineRating(confidence: number): MisinformationAnalysis["rating"] {
  if (confidence >= 70) return "false";
  if (confidence >= 40) return "questionable";
  if (confidence >= 15) return "needs_review";
  return "verified";
}

/**
 * Rule-based fallback analysis when AI is not available
 */
function performRuleBasedAnalysis(
  tweetData: TweetData,
): MisinformationAnalysis {
  const content = tweetData.content.toLowerCase();
  let confidence = 10; // Base confidence for rule-based
  const topics: string[] = [];
  let reasoning = "Analysis based on content patterns";

  // Check for misinformation keywords
  const keywordMatches = MISINFORMATION_KEYWORDS.filter((keyword) =>
    content.includes(keyword.toLowerCase()),
  );

  if (keywordMatches.length > 0) {
    confidence += keywordMatches.length * 15;
    reasoning += `. Contains potential misinformation keywords: ${keywordMatches.join(", ")}`;
  }

  // Check for high-risk patterns
  const patternMatches = HIGH_RISK_PATTERNS.filter((pattern) =>
    pattern.test(content),
  );
  if (patternMatches.length > 0) {
    confidence += patternMatches.length * 20;
    reasoning += ". Contains sensationalist language patterns";
  }

  // Check for excessive punctuation or caps
  const excessivePunctuation = (content.match(/!{2,}|\.{3,}|\?{2,}/g) || [])
    .length;
  const excessiveCaps = (content.match(/[A-Z]{3,}/g) || []).length;

  if (excessivePunctuation > 0 || excessiveCaps > 2) {
    confidence += 10;
    reasoning += ". Contains excessive punctuation or capitalization";
  }

  // Extract basic topics
  if (content.includes("covid") || content.includes("vaccine"))
    topics.push("health");
  if (content.includes("election") || content.includes("vote"))
    topics.push("politics");
  if (content.includes("climate") || content.includes("weather"))
    topics.push("climate");

  const analysis: MisinformationAnalysis = {
    confidence: Math.min(100, confidence),
    rating: determineRating(confidence),
    topics,
    reasoning,
    timestamp: new Date().toISOString(),
    source: "rule_based",
  };

  return analysis;
}
