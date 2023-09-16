const button = document.getElementById("button");

function getAllTextFromWebpageWithoutTags() {
  let text = '';

  function extractText(node) {
    // Skip script and style elements
    if (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE') {
      return;
    }

    // If the node is a text node, append its content to the result
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    }

    // Recursively process child nodes
    if (node.childNodes) {
      for (const childNode of node.childNodes) {
        extractText(childNode);
      }
    }
  }

  // Start extracting text from the entire document body
  extractText(document.body);

  // Remove leading and trailing whitespace
  text = text.trim();

  return text;
}




button.addEventListener("click", async function() {
    // This function will be awaited before the next line of code is executed

    try {
      
      var paragraphTexts = document.documentElement.outerHTML;
    //    const paragraphs = document.querySelectorAll('a');
    // // Create an array to store the inner text of <p> tags
    // const paragraphTexts = [];

    // // Loop through the selected <p> tags and extract their inner text
    //   paragraphs.forEach(paragraph => {
    //     // Get the inner text of each <p> tag and push it to the array
    //     const text = paragraph.innerText;
    //     paragraphTexts.push(text);
    //   });

      console.log(paragraphTexts);







      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer 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`);
      
      const requestBody = JSON.stringify({
        model: 'text-davinci-003',
        prompt: "summarize the text that is within this HTML file: " + paragraphTexts,
        max_tokens: 100
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
