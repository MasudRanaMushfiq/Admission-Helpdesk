const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
  console.log(`KB matching: built-in embeddings, threshold ${config.similarityThreshold}`);
});
