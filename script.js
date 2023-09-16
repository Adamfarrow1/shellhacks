/*
var form = document.getElementById("form");
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);

let HTML_text = "";
*/


let textToSpeech = true;

let colorBlind = false;

let zoom = false;

let screenshot = false;

function handleSubmit() {
  if (document.getElementById("accessibility-options").value === "Screen Reader") {
    textToSpeech = true;
    colorBlind = false;
    zoom = false;
    screenshot = false;
  }
  else if (document.getElementById("accessibility-options").value === "Colorblind Mode") {
    textToSpeech = false;
    colorBlind = true;
    zoom = false;
    screenshot = false;
    console.log("HELP");
    grey();
  }
  else if (document.getElementById("accessibility-options").value === "Zoom") {
    textToSpeech = false;
    colorBlind = false;
    zoom = true;
    screenshot = false;
  }

  else if (document.getElementById("accessibility-options").value === "Screenshot") {
    textToSpeech = false;
    colorBlind = false;
    zoom = false;
    screenshot = true;
    ss()
  }

}


document.getElementById("screenshot-button").addEventListener("click", () => {
  handleSubmit();
})


function ss() {
  chrome.tabs.captureVisibleTab(null, {format: "png"}, function(screenshotUrl) {
    var link = document.createElement("a");
    link.download = "screenshot.png";
    link.href = screenshotUrl;
    link.click();
  });
};


function changeBackgroundColor() {
  document.body.style.filter = document.body.style.filter === 'grayscale(100%)' ? 'grayscale(0%)' : 'grayscale(100%)';
}


async function grey() {
  if (!colorBlind) return;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: changeBackgroundColor,
    });
  } catch (err) {
    console.log(err);
  }
};




function luminance(r, g, b) {
  var a = [r, g, b].map(function(v) {
    v /= 255;
    return v <= 0.03928 ?
      v / 12.92 :
      Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(rgb1, rgb2) {
  var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  var brightest = Math.max(lum1, lum2);
  var darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) /
    (darkest + 0.05);
}











// Zoom Accessibility Feature

let overlay;

document.addEventListener("mousemove", function(event) {
  if (!zoom) return;
  const x = event.clientX;
  const y = event.clientY;

  // Create the overlay element if it doesn't already exist
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.transform = "scale(2)";
    overlay.style.width = "100px";
    overlay.style.height = "100px";
  }

  // Set the position of the overlay element
  overlay.style.top = `${y - 50}px`;
  overlay.style.left = `${x - 50}px`;

  // Add the overlay element to the document if it's not already there
  if (!overlay.parentNode) {
    document.body.appendChild(overlay);
  }

  // Set the background-size and background-position of the body element
  document.body.style.backgroundSize = "200% 200%";
  document.body.style.backgroundPosition = `-${x - window.innerWidth / 4}px -${y - window.innerHeight / 4}px`;
});

// Remove the overlay element and reset the background-size and background-position of the body element when the mouse leaves the document
document.addEventListener("mouseout", function(event) {
  if (overlay && event.relatedTarget === null) {
    overlay.remove();
    overlay = null;
    document.body.style.backgroundSize = "auto";
    document.body.style.backgroundPosition = "center";
  }
});