// Sonido de notificaciones mediante Web Audio API.
// Gestiona el desbloqueo del audio por gesto del usuario y reproduce un aviso corto.

let notificationAudioContext = null;
let notificationAudioUnlocked = false;
let pendingNotificationBeeps = 0;

export function unlockNotificationAudio() {
  if (notificationAudioUnlocked) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  try {
    notificationAudioContext ||= new AudioContextClass();
    notificationAudioContext.resume().then(() => {
      notificationAudioUnlocked = notificationAudioContext.state === "running";
      if (notificationAudioUnlocked && pendingNotificationBeeps) {
        const queued = Math.min(pendingNotificationBeeps, 2);
        pendingNotificationBeeps = 0;
        for (let index = 0; index < queued; index++) playNotificationSound();
      }
    }).catch(() => {});
  } catch {}
}

export function playNotificationSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  try {
    notificationAudioContext ||= new AudioContextClass();
    if (notificationAudioContext.state !== "running") {
      pendingNotificationBeeps = Math.min(pendingNotificationBeeps + 1, 3);
      unlockNotificationAudio();
      return;
    }
    const now = notificationAudioContext.currentTime;
    const gain = notificationAudioContext.createGain();
    const oscillator = notificationAudioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(740, now);
    oscillator.frequency.setValueAtTime(880, now + 0.085);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.085, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    oscillator.connect(gain);
    gain.connect(notificationAudioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.23);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  } catch {}
}

document.addEventListener("pointerdown", unlockNotificationAudio, { once: true, capture: true });
document.addEventListener("keydown", unlockNotificationAudio, { once: true, capture: true });
