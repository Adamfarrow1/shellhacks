const button = document.getElementById("button");

button.addEventListener("click", async function() {
    // This function will be awaited before the next line of code is executed

    try {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer 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`);
      
      const requestBody = JSON.stringify({
        model: 'text-davinci-003',
        prompt: "hello",
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
