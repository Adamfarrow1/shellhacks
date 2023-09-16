// Define the getAllHTMLContent function
let pageHTML = "";


function getAllHTMLContent() {
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
                textContent.push(node.textContent.trim());
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

button.addEventListener("click", async function() {
    // This function will be awaited before the next line of code is executed
  
    try {
  
      getAllHTMLContent();
      if(!pageHTML) getAllHTMLContent();
      // pageHTML.replace(/[\s\n]+/g, '');
      if (pageHTML.length > 2000) {
        pageHTML = pageHTML.substring(0, 2000); // Trim to the first 500 characters
      }

      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer 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`);
      
      const requestBody = JSON.stringify({
        model: 'text-davinci-003',
        prompt: "summarize the text (ignore advertisments) (only summarize what it is talked about the most) (make the summary 5 to 6 sentences): " + pageHTML,
        max_tokens: 300
      });

      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: headers,
        body: requestBody
      });

      // Check if the response status is OK (status code 200)
      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData.choices[0].text);
      } else {
        console.error(response);
      }
    } catch (error) {
      console.error(error);
    }
});
