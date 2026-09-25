const { GoogleGenerativeAI } = require('@google/generative-ai');

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: modelName
  });

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Gemini request attempt ${attempt}/${maxRetries}`);
      console.log(`Using model: ${modelName}`);

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!text) {
        throw new Error('Invalid Gemini response');
      }

      return text;

    } catch (error) {
      console.error(
        `Gemini attempt ${attempt} failed:`,
        error.message
      );

      // Retry only temporary server/service errors
      const isTemporaryError =
        error.message.includes('503') ||
        error.message.includes('Service Unavailable');

      if (!isTemporaryError || attempt === maxRetries) {
        throw error;
      }

      // Increasing delay: 3s, 6s
      const delay = attempt * 3000;

      console.log(`Waiting ${delay / 1000} seconds before retry...`);

      await new Promise(resolve =>
        setTimeout(resolve, delay)
      );
    }
  }
};

module.exports = {
  callGemini
};