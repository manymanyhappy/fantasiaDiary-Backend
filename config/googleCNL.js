async function sentimentAnalysis(text) {
  const language = require('@google-cloud/language');

  const client = new language.LanguageServiceClient();

  const document = {
    content: text,
    type: 'PLAIN_TEXT'
  };

  const [ result ] = await client.analyzeSentiment({ document: document });
  const { score } = result.documentSentiment;

  return score;
}

module.exports = {
  sentimentAnalysis
};
