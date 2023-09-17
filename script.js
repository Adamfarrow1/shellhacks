let textToSpeech = true;
let colorBlind = false;
let zoom = false;
let screenshot = false;
let AI = false;



function handleSubmit() {
  const selectedOption = document.getElementById("accessibility-options").value;


  // Enable screen reader settings
  if (selectedOption === "Screen Reader") {
    textToSpeech = true;
    colorBlind = false;
    zoom = false;
    screenshot = false;
    AI = false;
    covertScreenText();
  }

  // Enable colorblind settings
  else if (selectedOption === "Colorblind Mode") {
    textToSpeech = false;
    colorBlind = true;
    zoom = false;
    screenshot = false;
    AI = false;
    console.log("works")
    adjustContrast();
  }

  else if (selectedOption === "AI") {
    textToSpeech = false;
    colorBlind = false;
    zoom = false;
    screenshot = false;
    AI = true;
    console.log("works")
    parse();
  }

  // Enable zoom settings
  else if (selectedOption === "Zoom") {
    textToSpeech = false;
    colorBlind = false;
    zoom = true;
    screenshot = false;
    AI = false;
    zoomFeature();
  }

  // Enable screenshot settings
  else if (selectedOption === "Learning") {
    textToSpeech = false;
    colorBlind = false;
    zoom = false;
    screenshot = true;
    AI = false;
    document.getElementById("user-response-section").style.display = "block";
    document.getElementById("sum-results").style.display = "block";
    parse2();
  }

  // Enable blue light
  else if (selectedOption === "blue-Light") {
    textToSpeech = false;
    colorBlind = false;
    zoom = true;
    screenshot = false;
    AI = false;
    toggleBlueLightFilter();
  }
}


// Event listener to handle screenshot button click
document.getElementById("screenshot-button").addEventListener("click", () => {
  handleSubmit();
});


document.getElementById("screenshot-button").addEventListener("click", () => {
  let selectedOption = document.getElementById("accessibility-options").value;
  
  // If 'Learning' is selected, show the user response section
  if (selectedOption === "Learning" ) {
      document.getElementById("user-response-section").style.display = "block";
  } else {
      document.getElementById("user-response-section").style.display = "none";
  }
  document.getElementById("sum-results").innerHTML = '';
});


document.getElementById("send-response").addEventListener("click", handleUserInput);


















// SUMMARY _____________________________________________________________________________________________


// Define the getAllHTMLContent function
let pageHTML = "";


async function getAllHTMLContent() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    chrome.scripting.executeScript(
      {
        target: { tabId: activeTab.id },
        function: function () {
          const textContent = [];
          const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

          while (treeWalker.nextNode()) {
            const node = treeWalker.currentNode;
            const parent = node.parentNode;

            if (parent && parent.nodeType === Node.ELEMENT_NODE) {
              const tagName = parent.tagName.toLowerCase();
              if (tagName !== 'script' && tagName !== 'style') {
                // Exclude text within <script> and <style> tags
                const trimmedText = node.textContent.trim();
                if (trimmedText && !isLikelyURL(trimmedText) && !isLessThanThreeWords(trimmedText)) {
                  // Skip empty text nodes and text that looks like a URL
                  textContent.push(trimmedText);
                }
              }
            }
          }

          function isLessThanThreeWords(input) {
            // Split the input string into words using a regular expression
            const words = input.split(/\s+/).filter(word => word.trim() !== '');
          
            // Check if the number of words is less than 3
            return words.length < 5;
          }

          function isLikelyURL(text) {
            // A simple check for text that looks like a URL
            const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
            return urlPattern.test(text);
          }

          return textContent.join('\n');
        },
      },
      function (result) {
        pageHTML = result[0].result;
        // console.log('HTML Content of the Page (excluding URLs):', pageHTML);
      }
    );
  });
}




// Call the function to retrieve HTML content when the extension icon is clicked (optional)

async function parse() {
  // This function will be awaited before the next line of code is executed
    if(!AI) return
    await getAllHTMLContent();
    if(!pageHTML) getAllHTMLContent();
    // pageHTML.replace(/[\s\n]+/g, '');
    if (pageHTML.length > 2000) {
      pageHTML = pageHTML.substring(0, 2000); // Trim to the first 500 characters
    }
  try {
    if(!pageHTML) return;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer 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`);
    console.log(pageHTML)
    const requestBody = JSON.stringify({
      model: 'text-davinci-003',
      prompt: "Summarize the text (ignore advertisements) (only summarize the topic that are mentioned the most) (max characters is 100) (don't include extra symbols) (ignore words that are not full sentences) (always start with a complete sentence in your response) (only answer with complete sentences). Make sure that every part of the response are clear and finished sentences: "  + pageHTML,
      max_tokens: 200
    });

    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: headers,
      body: requestBody
    });

    // Check if the response status is OK (status code 200)
    if (response.ok && pageHTML) {
      const responseData = await response.json();
      document.getElementById("sum-results").innerHTML = responseData.choices[0].text
    } else {
      console.error(response);
    }
  } catch (error) {
    console.error(error);
  }
};











// COLORBLIND _____________________________________________________________________________________________

function changeBackgroundColor() {
  document.body.style.filter = document.body.style.filter === 'contrast(2) saturate(1.5)' ? 'none' : 'contrast(2) saturate(1.5)';
}
// Applies the color contrast filter if colorBlind is true
async function adjustContrast() {
  if (!colorBlind) return;
  try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: changeBackgroundColor,
      });
  } catch (err) {
      console.log(err);  // Logging errors for debugging
  }
}

// Compute luminance of a color for contrast calculation
function luminance(r, g, b) {
  var a = [r, g, b].map(function(v) {
    v /= 255;
    return v <= 0.03928 ?
      v / 12.92 :
      Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Compute contrast ratio between two RGB colors
function contrast(rgb1, rgb2) {
  var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  var brightest = Math.max(lum1, lum2);
  var darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}




// LEARNING __________________________________________________________________________________________________


let topics = ""

async function parse2() {
  console.log("Test");
  // This function will be awaited before the next line of code is executed
    if(!screenshot) return
    await getAllHTMLContent();
    if(!pageHTML) getAllHTMLContent();
    if (pageHTML.length > 2000) {
      pageHTML = pageHTML.substring(0, 2000); // Trim to the first 500 characters
    }
  try {
    if(!pageHTML) return;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer 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`);

    let userInput = document.getElementById('user-input').value;
    let promptText = userInput ? userInput : "You are at the knowledge level of an elite college professor. Your task is to only give a numbered list of up to 5 of key concepts based on the following text provided (No key concept can be more than three words). Ignore ads and keep the entire message short. If there are not at least 4 topics, add related topics to the list. Before listing the topics, introduce yourself as a personal learning assistant. Inside the response, ask the user which topic they would like to learn about. Always create a new line in the output before and after listing the topics. Always start with a complete sentence greeting without any extra symbols or characters. Here are a couple examples of the propper output: Hello! I am your personal learning assistant. Here are some key concepts of the website you are on: 1.How to steer 2. Using the break 3. Using the gas 4. Turning 5. Drifting What topic would you like to dive into? Hey, it's your learning assistant, which of the following topics do you want to learn more about: 1. Hitler 2. Auschwitz 3. 1945 Germany 4. Judaism 5. Holocaust aftermath (dont include extra symbols) (only answer with complete sentences). Do not use any extra symbols or characters and never exceed 250 characters, but make sure to include all 5 topics within these characters. Never output a jpg, extra characters, extra symbols or any links. here is the text you must use:" + pageHTML


    const requestBody = JSON.stringify({
      model: 'text-davinci-003',
      prompt: promptText + pageHTML,
      max_tokens: 200
  });

    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: headers,
      body: requestBody
    });

    // Check if the response status is OK (status code 200)
    if (response.ok && pageHTML) {
        const responseData = await response.json();
        document.getElementById("sum-results").innerHTML = responseData.choices[0].text;
        topics = responseData.choices[0].text;
    } else {
      console.error(response);
    }
  } catch (error) {
    console.error(error);
  }
};



async function handleUserInput() {
  let topic = document.getElementById("user-input").value;

  // If no topic is provided, you might want to inform the user or exit the function
  if (!topic) {
      console.log("Please enter a topic!");
      return;
  }

  // Now, make the API call with the user's topic as input
  try {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer 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`);

      const requestBody = JSON.stringify({
          model: 'text-davinci-003',
          prompt: "You are an elite college professor teaching me. The current topics being discussed are " + topics + `Tell me more about ${topic}.`,
          max_tokens: 200
      });

      const response = await fetch('https://api.openai.com/v1/completions', {
          method: 'POST',
          headers: headers,
          body: requestBody
      });

      // Check if the response status is OK (status code 200)
      if (response.ok) {
          const responseData = await response.json();
          document.getElementById("sum-results").innerHTML = responseData.choices[0].text;
      } else {
          console.error(response);
      }
  } catch (error) {
      console.error(error);
  }
}







// BLUE LIGHT  __________________________________________________________________________________________________


async function toggleBlueLightFilter() {

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function () {
            document.body.style.filter = document.body.style.filter === 'grayscale(0.7) brightness(0.8)' ? 'none' : 'grayscale(0.7) brightness(0.8)'
    
        },
    });
  } catch (err) {
      console.log(err);  // Logging errors for debugging
  }  
}


// SCREEN READER  __________________________________________________________________________________________________

function covertScreenText() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    readTextOnPage(activeTab);
  });
}

function readTextOnPage(activeTab) {
  chrome.scripting.executeScript(
    {
      target: { tabId: activeTab.id },
      function: function () {
        const elements = document.querySelectorAll("h1, h2, p");

        const textToRead = Array.from(elements)
          .map((element) => element.textContent)
          .join(". ");

        chrome.runtime.sendMessage({ type: "tts", text: textToRead });
      }
    }
  );
}