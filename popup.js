const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const quitButton = document.getElementById("quit-button");
const sessionStatus = document.getElementById("session-status");
const countdownContainer = document.getElementById("countdown-container");

let countdown = parseInt(localStorage.getItem("countdown")) || 0;
let timer; // To store the interval ID
let isPaused = false;


// variables for fish system
const fishContainer = document.getElementById("fish-container");
const waterLevel = document.getElementById("water-level");
const increaseWaterButton = document.getElementById("increase-water");
const decreaseWaterButton = document.getElementById("decrease-water");

// Animation frames for the fish using image paths for left and right directions
const fishFramesLt = [
    "fishFrames/L1.png",
    "fishFrames/L2.png",
    "fishFrames/L3.png",
    "fishFrames/L4.png",
    "fishFrames/L5.png"
];

const fishFramesRt = [
    "fishFrames/R1.png",
    "fishFrames/R2.png",
    "fishFrames/R3.png",
    "fishFrames/R4.png",
    "fishFrames/R5.png"
];

let frameIndex = 0; // Start at the first frame

// Create the fish image element instead of using a text span
const fish = document.createElement("img");
fish.style.position = "absolute";
fish.style.width = "30px"; // Set desired width (smaller size)
fish.style.height = "auto"; // Maintain aspect ratio
fishContainer.appendChild(fish);

// Movement variables
let currentWaterHeight = 100;
let fishX = 50; // Initial position
let fishY = 50;
let directionX = 1; // Horizontal movement direction: -1, 0, or 1
let directionY = 1; // Vertical movement direction: -1, 0, or 1
let fishMovementInterval;
let turnInterval;



document.addEventListener("DOMContentLoaded", () => {
    // Retrieve saved water level and fish position
    currentWaterHeight = parseInt(localStorage.getItem("currentWaterHeight")) || 100;
    fishX = parseFloat(localStorage.getItem("fishX")) || 50;
    fishY = parseFloat(localStorage.getItem("fishY")) || 50;

    // Apply saved water level
    waterLevel.style.height = `${currentWaterHeight}%`;

    // Apply saved fish position
    fish.style.left = `${fishX}px`;
    fish.style.top = `${fishY}px`;

    // Set intervals for movement and turning
    fishMovementInterval = setInterval(moveFish, 50); // Move fish every 50ms
    turnInterval = setInterval(randomTurn, 5000); // Decide to turn every 10 seconds
    
    // Handle session state on load
    if (countdown > 0) {
        sessionStatus.textContent = `Session Active`;
        countdownContainer.classList.remove("hidden"); // Show the countdown
        startButton.classList.add("hidden"); // Hide the Start button
        pauseButton.classList.remove("hidden"); // Show Pause button
        quitButton.classList.remove("hidden"); // Show Quit button
        startCountdown(countdown);
    }
});

// Handle Start button click
startButton.addEventListener("click", () => {
    console.log("Start button clicked!");

    const newWindow = window.open(
        "start.html",
        "FocishSettings",
        `width=${window.innerWidth},height=${window.innerHeight},top=0,left=0`
    );

    if (!newWindow) {
        alert("Popup blocked! Please allow popups for this site.");
    }

    const checkNewWindowClosed = setInterval(() => {
        if (newWindow.closed) {
            clearInterval(checkNewWindowClosed);
            location.reload();
        }
    }, 500);
});

// Pause button logic
pauseButton.addEventListener("click", () => {
    const sessionStatus = document.getElementById("session-status");

    if (isPaused) {
        // Resume the countdown
        isPaused = false;
        sessionStatus.textContent = "Session Active";
        pauseButton.textContent = "Pause";

        // Update the start time to account for the paused duration
        const pausedTime = parseInt(localStorage.getItem("pausedTime"), 10);
        const savedStartTime = parseInt(localStorage.getItem("countdownStartTime"), 10);

        // Adjust start time to "resume" the countdown correctly
        const adjustedStartTime = Date.now() - (pausedTime - savedStartTime);
        localStorage.setItem("countdownStartTime", adjustedStartTime);

        // Resume the countdown
        startCountdown(countdown);
    } else {
        // Pause the countdown
        isPaused = true;
        sessionStatus.textContent = "Session Paused";
        pauseButton.textContent = "Resume";

        // Save the paused time
        localStorage.setItem("pausedTime", Date.now());

        // Stop the timer
        clearInterval(timer);
    }
});


// Quit button logic
quitButton.addEventListener("click", () => {
    const countdownElement = document.getElementById("countdown-timer");
    const sessionStatus = document.getElementById("session-status");

    // Stop the active timer
    clearInterval(timer);

    // Clear countdown-related data from localStorage
    localStorage.removeItem("countdownStartTime");
    localStorage.removeItem("countdownDuration");
    localStorage.removeItem("pausedTime");
    localStorage.removeItem("countdown"); // This ensures the countdown doesn't persist

    // Reset countdown and UI state
    countdown = 0; // Reset countdown variable
    sessionStatus.textContent = "Session Ended. Start a new session!";
    countdownElement.textContent = ""; // Clear the countdown display
    countdownContainer.classList.add("hidden"); // Hide countdown display
    startButton.classList.remove("hidden"); // Show Start button
    pauseButton.classList.add("hidden"); // Hide Pause button
    quitButton.classList.add("hidden"); // Hide Quit button
});


// Countdown Timer Function
function startCountdown(totalDuration) {
    const countdownElement = document.getElementById("countdown-timer");
    const sessionStatus = document.getElementById("session-status");

    // Store the current time and total duration if not already saved
    let startTime = parseInt(localStorage.getItem("countdownStartTime"), 10);
    if (!startTime) {
        startTime = Date.now();
        localStorage.setItem("countdownStartTime", startTime);
        localStorage.setItem("countdownDuration", totalDuration);
    }

    function updateCountdown() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Elapsed time in seconds
        const remainingTime = totalDuration - elapsedTime; // Calculate remaining time

        if (remainingTime <= 0) {
            clearInterval(timer); // Stop the timer
            countdownElement.textContent = "Session Complete!";
            sessionStatus.textContent = "🎉 Congratulations! Mission Complete! 🎉";

            // Clear countdown state
            localStorage.removeItem("countdownStartTime");
            localStorage.removeItem("countdownDuration");

            // Hide Pause button and show "Close"
            pauseButton.classList.add("hidden");
            quitButton.textContent = "Close";
            return;
        }

        const hours = Math.floor(remainingTime / 3600);
        const minutes = Math.floor((remainingTime % 3600) / 60);
        const seconds = remainingTime % 60;

        countdownElement.textContent = `Time Left: ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    // Initial update and interval setup
    updateCountdown(); // Update immediately
    timer = setInterval(updateCountdown, 1000);
}


// functions for fish system
// Function to update the fish's position and direction
function moveFish() {
    // Determine the current frames based on direction
    const currentFrames = directionX >= 0 ? fishFramesLt : fishFramesRt;

    // Update the frame for animation
    fish.src = currentFrames[frameIndex]; // Set the image source to the current frame
    frameIndex = (frameIndex + 1) % currentFrames.length; // Cycle through frames

    // Calculate new position
    fishX += directionX * 0.7; // Adjust movement speed by changing multiplier
    fishY += directionY * 0.7;

    // Get bounds for movement within the water level
    const waterRect = waterLevel.getBoundingClientRect();
    const containerRect = fishContainer.getBoundingClientRect();

    // Calculate minY and maxY based on current water level height
    const minY = containerRect.height - waterRect.height;
    const maxY = containerRect.height - fish.offsetHeight;
    const minX = 0;
    const maxX = containerRect.width - fish.offsetWidth;

    // Boundary check and change direction if necessary
    if (fishX <= minX || fishX >= maxX) directionX *= -1;
    if (fishY <= minY || fishY >= maxY) directionY *= -1;

    // Apply the updated position
    fish.style.left = `${fishX}px`;
    fish.style.top = `${fishY}px`;

    // Save fish position to localStorage
    localStorage.setItem("fishX", fishX);
    localStorage.setItem("fishY", fishY);
}

// Randomly decide to turn every 10 seconds
function randomTurn() {
    const turnDecision = Math.floor(Math.random() * 5) + 1;
    if (turnDecision === 2) { // If the random number is 6, change direction
        directionX = (Math.floor(Math.random() * 3) - 1); // -1, 0, or 1
        directionY = (Math.floor(Math.random() * 3) - 1); // -1, 0, or 1
    }
}

// Function to update the water level height
function updateWaterLevel(change) {
    currentWaterHeight += change;
    if (currentWaterHeight > 100) currentWaterHeight = 100;
    if (currentWaterHeight < 0) currentWaterHeight = 0;

    waterLevel.style.height = `${currentWaterHeight}%`;

    // If water level reaches 0, stop the fish movement and remove the fish
    if (currentWaterHeight === 0) {
        clearInterval(fishMovementInterval); // Stop movement
        clearInterval(turnInterval); // Stop random turns
        fishContainer.removeChild(fish); // Remove the fish from the container
        fishContainer.innerHTML = "<p>You've killed your fish 😡</p>";
    }

    // Save current water level to localStorage
    localStorage.setItem("currentWaterHeight", currentWaterHeight);
}

// Event listeners for water level control buttons
increaseWaterButton.addEventListener("click", () => {
    if (currentWaterHeight < 100) updateWaterLevel(10);
});

decreaseWaterButton.addEventListener("click", () => {
    if (currentWaterHeight > 0) updateWaterLevel(-10);
});


function Timer(studyHours, studyMin) {
    this.timeGoal = this.parseToSec(studyHours, studyMin);  
    this.distractedTime = 0;
    this.studyTime = 0;  

    this.distractionTimer = null; 

    if (this.timeGoal <= 5400) {  // 1.5 hours in seconds
        this.timeLimit = 2;  // 5 minutes in seconds ////// 300
    } else {
        this.timeLimit = 600;  // 10 minutes in seconds
    }
}

// Method to convert hours and minutes to seconds
Timer.prototype.parseToSec = function(studyHours, studyMin) {
    let hours = studyHours * 60 * 60; 
    let minutes = studyMin * 60; 
    return hours + minutes;
};


Timer.prototype.startInspection = function(isDistracted) {
    if (isDistracted) {
        this.handleDistraction();  
    } 
};

Timer.prototype.handleDistraction = function() {
    this.distractionTimer = setInterval(() => {
        this.distractedTime += 1;  
        if (this.distractedTime >= this.timeLimit) { 
            updateWaterLevel(-30);
        }
    }, 1000);
};

Timer.prototype.stopCountingDistraction = function() {
    if (this.distractionTimer) {
        clearInterval(this.distractionTimer); 
        this.distractionTimer = null;  
    }
    this.distractedTime = this.timeLimit; 
};