/**
 * JalDrishti Phase 23: Hosted Vision Provider (Gemini Vision API)
 *
 * Implements multimodal AI visual screening for water samples using Google Gemini Vision API.
 * Isolate all vendor-specific calling logic behind the provider interface.
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * - Never leak API keys in errors, logs, or responses.
 * - Return HTTP 503 / ProviderUnavailable if credentials are not configured.
 * - Validate provider output strictly before returning to the caller.
 * - Must NOT make unverified potability claims.
 */

class HostedVisionProvider {
  constructor(options = {}) {
    this.name = 'hosted-vision-gemini';
    this.apiKey = options.apiKey || '';
    const rawModel = options.model || 'gemini-3.8-flash';
    const cleanModel = rawModel.replace(/^models\//, '');
    this.model = cleanModel === 'gemini-2.5-flash' ? 'gemini-3.8-flash' : cleanModel;
    this.timeoutMs = options.timeoutMs || 25000;
  }

  /**
   * Check whether live hosted provider credentials are present and valid
   * @returns {boolean}
   */
  isAvailable() {
    return Boolean(
      this.apiKey &&
      typeof this.apiKey === 'string' &&
      this.apiKey.trim().length > 0 &&
      this.apiKey !== 'your_gemini_api_key_here'
    );
  }

  /**
   * Screen image using Google Gemini Vision API
   *
   * @param {Object} params
   * @param {Buffer} params.imageBuffer - Raw image buffer
   * @param {string} params.mimeType - MIME type (image/jpeg, image/png, image/webp)
   * @param {string} [params.filename] - Image file name
   * @returns {Promise<Object>} Normalized analysis result
   */
  async analyzeImage({ imageBuffer, mimeType }) {
    if (!this.isAvailable()) {
      const err = new Error(
        'Hosted vision provider credentials (GEMINI_API_KEY) are not configured in this environment.'
      );
      err.code = 'PROVIDER_UNAVAILABLE';
      err.status = 503;
      throw err;
    }

    const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const promptText = `
You are an AI water visual screening module for the JalDrishti academic prototype.
Analyze the provided image for visual water clarity.

Tasks:
1. Identify if the image contains water (a liquid sample in a cup, glass, container, or water body).
2. If NOT water: result must be "Rejected", isWaterImage: false, confidence: 90-100, advisory explaining no water sample was identified.
3. If water is detected:
   - Visually evaluate clarity, color, suspended solids, particulates, and turbidity.
   - If visibly cloudy, discolored, muddy, murky, or containing visible particles: result must be "Unsafe", isWaterImage: true.
   - If visibly clear, transparent, and without suspended particulates or abnormal color: result must be "Safe", isWaterImage: true.
   - Assign an estimated confidence score between 50 and 100 based on image clarity and visual indicators.
   - Provide a plain-language advisory summarizing visual findings.
   - DO NOT state that water is definitely potable or safe to drink.
   - Include an advisory note that visual screening is academic assistance only and does not replace laboratory chemical/microbiological testing.

Respond with strictly valid JSON only matching this schema without markdown fences:
{
  "result": "Safe" | "Unsafe" | "Rejected",
  "confidence": number between 0 and 100,
  "advisory": string,
  "isWaterImage": boolean
}
`.trim();

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBuffer.toString('base64')
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        response_mime_type: 'application/json'
      }
    };

    const maxAttempts = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      let response;
      try {
        response = await fetch(endpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
      } catch (fetchErr) {
        clearTimeout(timer);
        const isTimeout = fetchErr.name === 'AbortError';
        const err = new Error(
          isTimeout
            ? 'Hosted vision provider request timed out.'
            : `Failed to connect to hosted vision API: ${fetchErr.message}`
        );
        err.code = isTimeout ? 'PROVIDER_TIMEOUT' : 'PROVIDER_NETWORK_ERROR';
        err.status = 503;
        lastError = err;
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
          continue;
        }
        throw err;
      } finally {
        clearTimeout(timer);
      }

      if (!response.ok) {
        let errorBody = '';
        try {
          const errorJson = await response.json();
          errorBody = errorJson?.error?.message || response.statusText;
        } catch {
          errorBody = response.statusText;
        }
        const err = new Error(`Hosted vision API error (${response.status}): ${errorBody}`);
        err.code = 'PROVIDER_API_ERROR';
        err.status = 503;
        lastError = err;

        if ((response.status === 503 || response.status === 429) && attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
          continue;
        }

        throw err;
      }

      const data = await response.json();
      const candidateText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!candidateText) {
        const err = new Error('Hosted vision provider returned an empty response.');
        err.code = 'PROVIDER_EMPTY_RESPONSE';
        err.status = 503;
        throw err;
      }

      let parsed;
      try {
        // Strip potential backticks if returned despite json mode
        const cleanJson = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        parsed = JSON.parse(cleanJson);
      } catch (parseErr) {
        const err = new Error('Hosted vision provider returned malformed JSON output.');
        err.code = 'PROVIDER_PARSE_ERROR';
        err.status = 502;
        throw err;
      }

      return {
        result: parsed.result,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : parseFloat(parsed.confidence),
        advisory: String(parsed.advisory || ''),
        isWaterImage: Boolean(parsed.isWaterImage),
        provider: this.name,
        model: this.model
      };
    }

    throw lastError || new Error('Hosted vision provider request failed.');
  }
}

module.exports = HostedVisionProvider;
