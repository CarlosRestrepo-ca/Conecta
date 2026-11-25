// Calcula los próximos cumpleaños de amistades y actualiza el widget de inicio;
// al pulsar su botón, el módulo de interfaz correspondiente puede abrir la celebración.
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { auth, db } from "../nucleo/firebase.js";

const birthdayText = document.getElementById("birthdayWidgetText");
const birthdayButton = document.getElementById("openBirthdayBtn");

// Normaliza fechas de Firestore y cadenas de fecha para comparar mes y día sin depender del año.
function getBirthdayParts(value) {
  if (value?.toDate instanceof Function) value = value.toDate();
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { month: value.getUTCMonth(), day: value.getUTCDate() };
  }

  const text = String(value || "").trim();
  let match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match) return validateBirthdayParts(Number(match[2]) - 1, Number(match[3]));

  // También admite fechas almacenadas en el formato local mes/día/año.
  match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) return validateBirthdayParts(Number(match[1]) - 1, Number(match[2]));
  return null;
}

function validateBirthdayParts(month, day) {
  const check = new Date(Date.UTC(2000, month, day));
  if (month < 0 || month > 11 || day < 1 || check.getUTCMonth() !== month || check.getUTCDate() !== day) return null;
  return { month, day };
}

// Calcula la próxima fecha de cumpleaños y los días que faltan desde la fecha actual.
function getUpcomingBirthday(parts, today) {
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  let year = today.getFullYear();
  let birthdayUtc = Date.UTC(year, parts.month, parts.day);
  if (birthdayUtc < todayUtc) {
    year += 1;
    birthdayUtc = Date.UTC(year, parts.month, parts.day);
  }

  return {
    year,
    days: Math.round((birthdayUtc - todayUtc) / 86400000),
  };
}

function resetWidget(message) {
  birthdayText.textContent = message;
  birthdayButton.disabled = true;
  birthdayButton.dataset.uid = "";
}

async function refreshBirthdayWidget(user) {
  if (!birthdayText || !birthdayButton) return;
  if (!user) {
    resetWidget("Inicia sesión para ver los próximos cumpleaños.");
    return;
  }

  try {
    const ownSnapshot = await getDoc(doc(db, "users", user.uid));
    const friendIds = [...new Set(ownSnapshot.data()?.friends || [])].filter((id) => id && id !== user.uid);
    const friends = await Promise.all(friendIds.map(async (uid) => {
      const snapshot = await getDoc(doc(db, "users", uid));
      if (!snapshot.exists()) return null;
      const data = snapshot.data();
      const profile = data.profile || {};
      const birthday = getBirthdayParts(profile.birthDate || data.birthDate);
      if (!birthday) return null;
      return {
        uid,
        name: profile.name || data.username || data.name || "Una persona amiga",
        birthday,
      };
    }));

    const today = new Date();
    const upcoming = friends
      .filter(Boolean)
      .map((friend) => ({ ...friend, ...getUpcomingBirthday(friend.birthday, today) }))
      .filter((friend) => friend.days >= 0 && friend.days <= 3)
      .sort((a, b) => a.days - b.days)[0];

    if (!upcoming) {
      resetWidget(friendIds.length
        ? "No hay cumpleaños en los próximos 3 días."
        : "Aún no hay fechas registradas entre tus amigos.");
      return;
    }

    const birthdayDate = new Date(Date.UTC(upcoming.year, upcoming.birthday.month, upcoming.birthday.day));
    const formattedDate = new Intl.DateTimeFormat("es-CO", {
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    }).format(birthdayDate);
    const countdown = upcoming.days === 0
      ? "¡Hoy!"
      : `en ${upcoming.days} ${upcoming.days === 1 ? "día" : "días"}`;
    birthdayText.textContent = `${upcoming.name} cumple años ${countdown} (${formattedDate}).`;
    birthdayButton.disabled = false;
    birthdayButton.dataset.uid = upcoming.uid;
  } catch (error) {
    console.warn("No se pudo actualizar el próximo cumpleaños:", error);
    resetWidget("No se pudieron cargar los próximos cumpleaños.");
  }
}

onAuthStateChanged(auth, refreshBirthdayWidget);

document.getElementById("btnHome")?.addEventListener("click", () => {
  if (auth.currentUser) setTimeout(() => refreshBirthdayWidget(auth.currentUser), 150);
});
