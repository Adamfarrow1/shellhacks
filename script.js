/*
var form = document.getElementById("form");
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);

let HTML_text = "";
*/

import openai from 'openai';

// Replace this with your OpenAI API key
const apiKey = process.env.API_KEY;

// Create an OpenAI client
const client = new openai.Client(apiKey);

// Define a function to send a request to the ChatGPT API
async function chatgptRequest(prompt) {
  const response = await client.completion.create({
    engine: 'davinci',
    text: prompt,
    prompt: 'ChatGPT: ',
    temperature: 0.5,
    maxTokens: 100,
  });
  return response.choices[0].text;
}


async function chatgpt(prompt) {
  const response = await chatgptRequest(prompt);
  return response;
}
