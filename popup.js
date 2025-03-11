let timer;
let timeLeft;
let totalTime;
let isRunning = false;
let isWorkPeriod = true;
let pomodoroCount = 0;

// Initial state check when popup opens
chrome.storage.local.get(
  ['timeLeft', 'isRunning', 'isWorkPeriod', 'pomodoroCount', 'totalTime'],
  (result) => {
    if (result.timeLeft !== undefined) {
      timeLeft = result.timeLeft;
      isRunning = result.isRunning;
      isWorkPeriod = result.isWorkPeriod;
      pomodoroCount = result.pomodoroCount;
      totalTime = result.totalTime;
      
      if (isRunning) {
        startTimer(false);
        updatePhaseDisplay();
      }
      updateDisplay();
    }
  }
);

// Load saved settings
chrome.storage.local.get(
  ['workDuration', 'shortBreak', 'longBreak'],
  (result) => {
    document.getElementById('workDuration').value = result.workDuration || 25;
    document.getElementById('shortBreak').value = result.shortBreak || 5;
    document.getElementById('longBreak').value = result.longBreak || 15;
  }
);

// Save settings when changed
document.querySelectorAll('input[type="number"]').forEach(input => {
  input.addEventListener('change', () => {
    const settings = {
      workDuration: parseInt(document.getElementById('workDuration').value),
      shortBreak: parseInt(document.getElementById('shortBreak').value),
      longBreak: parseInt(document.getElementById('longBreak').value)
    };
    chrome.storage.local.set(settings);
  });
});

document.getElementById('startBtn').addEventListener('click', () => startTimer(true));
document.getElementById('stopBtn').addEventListener('click', stopTimer);

function startTimer(isNewTimer) {
    if (isRunning && isNewTimer) return;
    
    if (isNewTimer) {
      isRunning = true;
      const duration = isWorkPeriod
        ? document.getElementById('workDuration').value * 60
        : (pomodoroCount % 4 === 0
          ? document.getElementById('longBreak').value * 60
          : document.getElementById('shortBreak').value * 60);
      
      timeLeft = duration;
      totalTime = duration;
      
      updatePhaseDisplay(); // Update the phase display immediately
      
      chrome.runtime.sendMessage({
        action: 'startTimer',
        duration: duration,
        isWorkPeriod: isWorkPeriod
      });
    }
    
    timer = setInterval(updateTimer, 1000);
    
    // Save state
    chrome.storage.local.set({
      timeLeft,
      isRunning,
      isWorkPeriod,
      pomodoroCount,
      totalTime
    });
}

function stopTimer() {
  if (!isRunning) return;
  
  isRunning = false;
  clearInterval(timer);
  resetDisplay();
  
  chrome.runtime.sendMessage({ action: 'stopTimer' });
  
  // Clear saved state
  chrome.storage.local.remove(['timeLeft', 'isRunning', 'isWorkPeriod', 'pomodoroCount', 'totalTime']);
}

function updateTimer() {
  if (timeLeft <= 0) {
    handleTimerComplete();
    return;
  }
  
  timeLeft--;
  updateDisplay();
  
  // Update stored state
  chrome.storage.local.set({ timeLeft });
}

function handleTimerComplete() {
    stopTimer();
    if (isWorkPeriod) {
      pomodoroCount++;
    }
    isWorkPeriod = !isWorkPeriod;
    
    // Determine next phase
    const nextPhase = isWorkPeriod ? 'Work Period' : 
      (pomodoroCount % 4 === 0 ? 'Long Break' : 'Short Break');
    
    // Show alert in popup if open
    showAlert(
      'Timer Complete!',
      `${isWorkPeriod ? 'Break' : 'Work Period'} is over!\n` +
      `Next up: ${nextPhase}`
    );
    
    chrome.runtime.sendMessage({
      action: 'timerComplete',
      isWorkPeriod: isWorkPeriod,
      pomodoroCount: pomodoroCount
    });
  }

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Update progress bar
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  document.getElementById('progress').style.width = `${progress}%`;
}

function updatePhaseDisplay() {
  const phaseElement = document.getElementById('phase');
  if (isWorkPeriod) {
    phaseElement.textContent = 'Work Time';
    document.getElementById('progress').style.backgroundColor = '#4CAF50';
  } else {
    phaseElement.textContent = pomodoroCount % 4 === 0 ? 'Long Break' : 'Short Break';
    document.getElementById('progress').style.backgroundColor = '#2196F3';
  }
}

function resetDisplay() {
  const workDuration = document.getElementById('workDuration').value;
  document.getElementById('timer').textContent = 
    `${workDuration.toString().padStart(2, '0')}:00`;
  document.getElementById('progress').style.width = '0%';
  updatePhaseDisplay();
}

// Listen for background updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'tick') {
    timeLeft = message.timeLeft;
    updateDisplay();
  }
});

function showAlert(title, message) {
    const overlay = document.getElementById('alertOverlay');
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    overlay.style.display = 'flex';
    
    // Add click handler for the alert button
    document.getElementById('alertButton').onclick = () => {
      overlay.style.display = 'none';
      startNextTimer();
    };
}

function startNextTimer() {
    // Start the next timer automatically
    startTimer(true);
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'tick') {
      timeLeft = message.timeLeft;
      updateDisplay();
    } else if (message.action === 'startNextTimer') {
      startNextTimer();
    }
  });