let activeTimer = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startTimer':
      createAlarm(message.duration);
      startBackgroundTimer(message.duration);
      break;
    case 'stopTimer':
      stopBackgroundTimer();
      chrome.alarms.clearAll();
      break;
    case 'timerComplete':
      showNotification(message.isWorkPeriod);
      break;
  }
});

function createAlarm(duration) {
  chrome.alarms.create('pomodoroTimer', {
    delayInMinutes: duration / 60
  });
}

function startBackgroundTimer(duration) {
  stopBackgroundTimer();
  let timeLeft = duration;
  
  activeTimer = setInterval(() => {
    timeLeft--;
    // Broadcast time update to popup
    chrome.runtime.sendMessage({
      action: 'tick',
      timeLeft: timeLeft
    });
    
    if (timeLeft <= 0) {
      stopBackgroundTimer();
    }
  }, 1000);
}

function stopBackgroundTimer() {
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
  }
}

function showNotification(isWorkPeriod, pomodoroCount) {
    const nextPhase = isWorkPeriod ? 'Work Period' : 
      (pomodoroCount % 4 === 0 ? 'Long Break' : 'Short Break');
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/timer128.png',
      title: 'Pomodoro Timer',
      message: `${isWorkPeriod ? 'Break' : 'Work Period'} is over!\nNext up: ${nextPhase}`,
      priority: 2,
      buttons: [
        { title: 'Start Next Period' }
      ],
      requireInteraction: true  // Notification won't auto-dismiss
    });
    
    // Optional: Show alert in all extension popups
    chrome.runtime.sendMessage({
      action: 'showAlert',
      title: 'Timer Complete!',
      message: `${isWorkPeriod ? 'Break' : 'Work Period'} is over!\nNext up: ${nextPhase}`
    });
  }

  chrome.notifications.onButtonClicked.addListener((notificationId) => {
    // When notification button is clicked, send message to popup to start next timer
    chrome.runtime.sendMessage({
      action: 'startNextTimer'
    });
  });