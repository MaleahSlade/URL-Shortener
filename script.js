// Select the HTML elements
const form = document.querySelector("#shortener-form");
const urlInput = document.querySelector("#homepage");
const urlError = document.querySelector("#url-error");
const resultsContainer = document.querySelector("#results-container");
const shortenButton = document.querySelector("#shorten-button");

// Send a URL to the Shrtr API
async function shortenURL(longURL) {
    const endpoint = "https://shrtr.top/api/v1/shorten";

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            url: longURL
        })
    });

    // Read the API response
    const data = await response.json();

    // Check whether the request succeeded
    if (!response.ok) {
        throw new Error(
            data.detail ||
            data.message ||
            data.title ||
            `Request failed: ${response.status}`
        );
    }

    // Check whether the API returned a shortened URL
    if (!data.short_url) {
        throw new Error("The API did not return a shortened URL.");
    }

    // Return the shortened URL to the form handler
    return data.short_url;
}

// Handle form submission
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const longURL = urlInput.value.trim();

    // Check whether the input is empty
    if (!longURL) {
        urlError.textContent = "Please add a link.";
        urlInput.setAttribute("aria-invalid", "true");
        return;
    }

    // Clear previous validation errors
    urlError.textContent = "";
    urlInput.removeAttribute("aria-invalid");

    try {
        // Show a loading state
        shortenButton.disabled = true;
        shortenButton.textContent = "Shortening...";

        // Request the shortened URL
        const shortURL = await shortenURL(longURL);

        // Retrieve existing links
        const links = getSavedLinks();

        // Add the new link to the beginning of the array
        links.unshift({
            originalURL: longURL,
            shortURL: shortURL
        });

        // Save the updated array
        saveLinks(links);

        // Refresh the result cards
        renderLinks();

        // Clear the input field
        urlInput.value = "";

    } catch (error) {
        // Report errors
        console.error("Error shortening URL:", error);

        urlError.textContent =
            error.message || "Something went wrong. Please try again.";

    } finally {
        // Restore the button
        shortenButton.disabled = false;
        shortenButton.textContent = "Shorten It!";
    }
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
    shortenedLink.rel = "noopener noreferrer";
    shortenedLink.classList.add("shortened-link");

    // Create a copy button
    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy";
    copyButton.type = "button";
    copyButton.classList.add("copy-button");

    // Copy the shortened URL to the clipboard
    copyButton.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(shortURL);
            copyButton.textContent = "Copied!";
        } catch (error) {
            console.error("Unable to copy link:", error);
            copyButton.textContent = "Copy failed";
        }
    });

    // Add everything to the result card
    resultCard.append(originalLink, shortenedLink, copyButton);

    // Add the result card to the results section
    resultsContainer.append(resultCard);
}

// Retrieve saved links from localStorage
function getSavedLinks() {
    try {
        return JSON.parse(
            localStorage.getItem("shortenedLinks") || "[]"
        );
    } catch (error) {
        console.error("Unable to retrieve saved links:", error);
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
    resultsContainer.replaceChildren();

    // Display saved links in their existing order
    links.forEach((link) => {
        displayShortenedLink(link.originalURL, link.shortURL);
    });
}

// Display saved links when the page loads
renderLinks();