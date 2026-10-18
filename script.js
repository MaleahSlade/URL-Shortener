// Select the HTML elements
const form = document.querySelector("#shortener-form");
const urlInput = document.querySelector("#homepage");
const urlError = document.querySelector("#url-error");
const resultsContainer = document.querySelector("#results-container");
const shortenButton = document.querySelector("#shorten-button");

// Send a URL to the Shrtr API
async function shortenURL(longURL) {
    const response = await fetch("https://shrtr.top/api/v1/shorten", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: longURL })
    });

    // Check whether the request succeeded
    if (response.ok === false) {
        throw new Error("Request failed: " + response.status);
    }

    // Read the API response
    const data = await response.json();

    // Check whether the API returned a shortened URL
    if (!data.short_url) {
        throw new Error("The API did not return a shortened URL.");
    }

    return data.short_url;
}

// Handle form submission
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const longURL = urlInput.value.trim();

    // Check whether the input is empty
    if (longURL === "") {
        urlError.textContent = "Please add a link.";
        return;
    }

    // Clear previous error
    urlError.textContent = "";

    // Show a loading state
    shortenButton.disabled = true;
    shortenButton.textContent = "Shortening...";

    try {
        // Request the shortened URL
        const shortURL = await shortenURL(longURL);

        // Get saved links, add the new one to the front, and save
        const links = getSavedLinks();
        links.unshift({
            originalURL: longURL,
            shortURL: shortURL
        });
        saveLinks(links);

        // Refresh the result cards
        renderLinks();

        // Clear the input field
        urlInput.value = "";
    } catch (error) {
        console.log(error);
        urlError.textContent = "Something went wrong. Please try again.";
    }

    // Restore the button
    shortenButton.disabled = false;
    shortenButton.textContent = "Shorten It!";
});

// Display a shortened link on the page
function displayShortenedLink(originalURL, shortURL) {
    // Create a container for the result
    const resultCard = document.createElement("div");
    resultCard.classList.add("result-card");

    // Display the original URL
    const originalLink = document.createElement("p");
    originalLink.textContent = originalURL;
    originalLink.classList.add("original-link");

    // Display the shortened URL
    const shortenedLink = document.createElement("a");
    shortenedLink.href = shortURL;
    shortenedLink.textContent = shortURL;
    shortenedLink.target = "_blank";
    shortenedLink.classList.add("shortened-link");

    // Create a copy button
    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy";
    copyButton.type = "button";
    copyButton.classList.add("copy-button");

    // Copy the shortened URL to the clipboard
    copyButton.addEventListener("click", function () {
        navigator.clipboard.writeText(shortURL);
        copyButton.textContent = "Copied!";
    });

    // Add everything to the result card
    resultCard.appendChild(originalLink);
    resultCard.appendChild(shortenedLink);
    resultCard.appendChild(copyButton);

    // Add the result card to the results section
    resultsContainer.appendChild(resultCard);
}

// Get saved links from localStorage
function getSavedLinks() {
    const saved = localStorage.getItem("shortenedLinks");

    if (saved) {
        return JSON.parse(saved);
    } else {
        return [];
    }
}

// Save links to localStorage
function saveLinks(links) {
    localStorage.setItem("shortenedLinks", JSON.stringify(links));
}

// Display all saved links
function renderLinks() {
    const links = getSavedLinks();

    // Clear existing result cards
    resultsContainer.innerHTML = "";

    // Display each saved link
    for (let i = 0; i < links.length; i++) {
        displayShortenedLink(links[i].originalURL, links[i].shortURL);
    }
}

// Display saved links when the page loads
renderLinks();