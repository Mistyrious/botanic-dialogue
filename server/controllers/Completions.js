const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_APIKEY,
});
const openai = new OpenAIApi(configuration);

const negativeMoods = ['dejected', 'depressed', 'combative', 'grumpy', 'threatening', 'moody', 'listless', 'withdrawn', 'scared'];
const neutralMoods = ['stoic', 'passive', 'neutral'];
const goodMoods = ['happy', 'joyful', 'enthusiastic', 'curious', 'content', 'comfortable', 'well-cared for', 'satisfied', 'pleased'];
let moisture; let light; let
  touch;

const getMood = () => {
  if (moisture > 70 && touch > 20) {
    return negativeMoods[Math.floor(Math.random(neutralMoods.length - 1))];
  }
  if (moisture < 30 && light) {
    return goodMoods[Math.floor(Math.random(goodMoods.length - 1))];
  }
  return neutralMoods[Math.floor(Math.random(neutralMoods.length - 1))];
};

const getMoist = () => {
  if (moisture > 520) {
    return 'an unhealthily low';
  }
  if (moisture > 470) {
    return 'a slightly low';
  }
  if (moisture > 420) {
    return 'a normal';
  }
  if (moisture > 370) {
    return 'a somewhat high';
  }
  return 'an unhealthily high';
};

const getLight = () => {
  if (light > 1000) {
    return 'far too much';
  }
  if (light > 900) {
    return 'somewhat too much';
  }
  if (light > 600) {
    return 'a normal level of';
  }
  if (light > 400) {
    return 'not enough';
  }
  return 'extremely low';
};

const generateCompletion = async (req, res) => {
  const { data } = req.body;
  console.log(`moisture: ${data.moisture}, light: ${data.light}`);
  let prompt;
  if (data.prompt || !data.transcript) {
    prompt = `${data.prompt}`;
  } else if (!data.moisture || !data.light) {
    prompt = `Reply to the following prompt from the perspective of a chrysanthemum plant conversing with a human. This plant is alone indoors as part of an exhibit, was bought from a grocery store, and it's monitoring system is not currently working, so its levels of soil moisture and light exposure are unknown.
    
    Human: ${data.transcript}
    Plant:`;
  } else {
    moisture = data.moisture;
    light = data.light;
    touch = data.touch;
    prompt = `The following is a conversation between visitors and a ${getMood()} chrysanthemum plant that is on display as a science-based art exhibit where visitors are meant to converse with the plant. This plant has ${getMoist()} soil moisture level of ${moisture}%, ${getLight()} light exposure, and doesn't enjoy being touched. It has been touched ${touch} times in the past half hour. It was originally bought from a grocery store, and its health is being monitored with various Arduino sensors.
    
    Visitor: ${data.transcript}
    Plant:`;
  }
  console.log('prompt: ', prompt);

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-002',
      prompt,
      temperature: 0.84,
      max_tokens: 100,
      presence_penalty: 1.7,
      frequency_penalty: 1.5,
    });
    console.log(completion.data.choices[0].text);
    return res.status(200).json({ result: completion.data.choices[0].text });
  } catch (error) {
    return console.log(`Error: ${error}`);
  }
};

module.exports = {
  generateCompletion,
};
