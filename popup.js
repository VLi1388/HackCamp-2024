document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-button");
    const pauseButton = document.getElementById("pause-button");
    const quitButton = document.getElementById("quit-button");
    const sessionStatus = document.getElementById("session-status");
    const fishPlaceholder = document.getElementById("fish-placeholder");
    const countdownContainer = document.getElementById("countdown-container");

    let countdown = parseInt(localStorage.getItem("countdown")) || 0;
    let timer; // To store the interval ID
    let isPaused = false;

    // Handle session state on load
    if (countdown > 0) {
        sessionStatus.textContent = `Session Active`;
        fishPlaceholder.innerHTML = "<p>🐟 The fish is swimming...</p>";
        countdownContainer.classList.remove("hidden"); // Show the countdown
        startButton.classList.add("hidden"); // Hide the Start button
        pauseButton.classList.remove("hidden"); // Show Pause button
        quitButton.classList.remove("hidden"); // Show Quit button
        startCountdown(countdown);
    }

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
});
