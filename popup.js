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

// Fish element with animation frames
const fish = document.createElement("span");
fish.style.position = "absolute";
fishContainer.appendChild(fish);

// Animation frames for the fish (replace with actual frames if available)
const fishFrames = ["🐟", "🐠", "🐡"];
let frameIndex = 0; // Start at the first frame

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
    if (isPaused) {
        // Resume the countdown
        sessionStatus.textContent = "Session Active";
        pauseButton.textContent = "Pause";
        isPaused = false;
        startCountdown(countdown); // Use the remaining countdown time
    } else {
        // Pause the countdown
        sessionStatus.textContent = "Session Paused";
        pauseButton.textContent = "Resume";
        isPaused = true;
        clearInterval(timer); // Stop the interval but preserve countdown
        newTimer.stopCountingDistraction();
    }
});

// Quit button logic
quitButton.addEventListener("click", () => {
    clearInterval(timer); // Stop the timer
    localStorage.removeItem("countdown"); // Clear session data
    localStorage.removeItem("studyHours");
    localStorage.removeItem("studyMinutes");
    localStorage.removeItem("focusURLs");

    sessionStatus.textContent = "Session Ended. Start a new session!";
    countdownContainer.classList.add("hidden"); // Hide countdown
    startButton.classList.remove("hidden"); // Show Start button
    pauseButton.classList.add("hidden"); // Hide Pause button
    quitButton.classList.add("hidden"); // Hide Quit button
    fishPlaceholder.innerHTML = "<p>🐟 Your fish will appear here...</p>";
});

// Countdown Timer Function
function startCountdown(duration) {
    const countdownElement = document.getElementById("countdown-timer");

    timer = setInterval(() => {
        if (isPaused) return; // Skip updating if paused

        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;

        countdownElement.textContent = `Time Left: ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        if (duration <= 0) {
            clearInterval(timer);
            countdownElement.textContent = "Session Complete!";
            sessionStatus.textContent = "Focus session complete!";
            localStorage.removeItem("countdown");
            pauseButton.classList.add("hidden"); // Hide Pause button
            quitButton.textContent = "Close";
        } else {
            duration--;
            countdown = duration; // Update the remaining countdown time
            localStorage.setItem("countdown", duration); // Persist remaining time
        }
    }, 1000);
}


// functions for fish system
// Function to update the fish's position and direction
function moveFish() {
    // Update the frame for animation
    fish.textContent = fishFrames[frameIndex];
    frameIndex = (frameIndex + 1) % fishFrames.length;

    // Calculate new position
    fishX += directionX * 0.5; // Adjust movement speed by changing multiplier
    fishY += directionY * 0.5;

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
};

// Event listeners for water level control buttons
increaseWaterButton.addEventListener("click", () => {
    if (currentWaterHeight < 100) updateWaterLevel(10);
});

decreaseWaterButton.addEventListener("click", () => {
    if (currentWaterHeight > 0) updateWaterLevel(-10);
});
