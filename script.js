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








function covertScreenText() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    console.log('1');
    readTextOnPage(activeTab);
  });
}

function readTextOnPage(activeTab) {
  chrome.scripting.executeScript(
    {
      target: { tabId: activeTab.id },
      function: function () {
        console.log("made it to funct")
        const elements = document.querySelectorAll("h1, p");

        const textToRead = Array.from(elements)
          .map((element) => element.textContent)
          .join(". ");
        
        chrome.runtime.sendMessage({ message: "tts", text: textToRead });
      }
    }
  );
}


















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
              if (tagName !== 'script' && tagName !== 'style' && tagName !== 'p') {
                // Exclude text within <script> and <style> tags
                const trimmedText = node.textContent.trim();
                if (trimmedText) {
                  // Skip empty text nodes
                  textContent.push(trimmedText);
                }
              }
            }
          }

          return textContent.join('\n');
        },
      },
      function (result) {
        pageHTML = result[0].result;
        // console.log('HTML Content of the Page:', pageHTML); // Log the HTML content to the console
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
      prompt: "summarize the text (ignore advertisments) (only summarize what it is talked about the most) (max characters is 100) (dont include extra symbols) (only answer with complete sentences). If there is no text given as input after this sentence, do not respond: " + pageHTML,
      max_tokens: 50
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
    let promptText = userInput ? userInput : "You are at the knowledge level of an elite college professor. Your task is to only give a numbered list of up to 5 of short key concepts based on the following text provided. Ignore ads and keep the entire message short. If there are not at least 4 topics, add related topics to the list. Before listing the topics, introduce yourself as a personal learning assistant. Inside the response, ask the user which topic they would like to learn about. Always create a new line in the output before and after listing the topics. Always start with a complete sentence greeting without any extra symbols or characters. Here are a couple examples of the propper output: Hello! I am your personal learning assistant. Here are some key concepts of the website you are on: 1.How to steer 2. Using the break 3. Using the gas 4. Turning 5. Drifting What topic would you like to dive into? Hey, it's your learning assistant, which of the following topics do you want to learn more about: 1. Hitler 2. Auschwitz 3. 1945 Germany 4. Judaism 5. Holocaust aftermath (dont include extra symbols) (only answer with complete sentences). Do not use any extra symbols or characters. Never output a jpg, extra characters, extra symbols or any links. here is the text you must use:" + pageHTML


    const requestBody = JSON.stringify({
      model: 'text-davinci-003',
      prompt: promptText + pageHTML,
      max_tokens: 50
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
    } else {
      console.error(response);
    }
  } catch (error) {
    console.error(error);
  }
};








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

