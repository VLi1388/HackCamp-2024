// Get references to elements
const startButton = document.getElementById("start-button");
const fishContainer = document.getElementById("fish-container");

// Handle Start button click
startButton.addEventListener("click", () => {
    // Log the click event for debugging
    console.log("Start button clicked!");

    // Example: Change the fish container content
    fishContainer.innerHTML = "<p>🐟 The fish is ready to swim!</p>";
});
