const controllers = require('./controllers');

const router = (app) => {
  // app.get('/messageLog', controllers.Completions.messageLog);
  app.get('/', controllers.botanicDialogue);
  app.post('/generateCompletion', controllers.Completions.generateCompletion);
};

module.exports = router;
