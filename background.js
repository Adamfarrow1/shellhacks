// chrome.runtime.getManifest(function(manifest) {
//     // Set the API key variable
//     const apiKey = manifest.API_KEY;
  
//     // Create an OpenAI client
//     const client = new openai.Client(apiKey);
  
//     // Console log "hi"
//     console.log("hi");
  
//     // Console log the message "(Please incorporate images when they enhance the content.)"
//     console.log("(Please incorporate images when they enhance the content.)");
  
//     // Define a function to send a request to the ChatGPT API
//     async function chatgptRequest(prompt) {
//         const response = await client.completion.create({
//           engine: 'davinci',
//           text: prompt,
//           prompt: 'ChatGPT: ',
//           temperature: 0.5,
//           maxTokens: 100,
//         });
  
//         // Console log the ChatGPT response
//         console.log(response.choices[0].text);
//     }
//     chatgptRequest("12");
//   });


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(message)
  if (message.text) {
    console.log("here")
    chrome.tts.speak(message.text);
  }
});

