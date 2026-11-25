import { getCurrentUser } from "../nucleo/state.js";

// Asistente documental: envía solicitudes autenticadas al backend y evita exponer claves privadas en el navegador.
const assistantState = { documentText: "", documentName: "", history: [], savedAnswers: [] };
const assistantElements = {
  modal: document.getElementById("academicAssistantModal"),
  file: document.getElementById("assistantFileInput"),
  documentStatus: document.getElementById("assistantDocumentStatus"),
  removeDocument: document.getElementById("removeAssistantDocumentBtn"),
  messages: document.getElementById("assistantChatMessages"),
  form: document.getElementById("assistantChatForm"),
  question: document.getElementById("assistantQuestion"),
  send: document.getElementById("assistantSendBtn"),
  saveConversation: document.getElementById("saveAssistantConversationBtn"),
  deleteData: document.getElementById("deleteAssistantDataBtn"),
  savedAnswers: document.getElementById("assistantSavedAnswers"),
  status: document.getElementById("assistantStatus"),
};
let assistantBusy = false;
const assistantMaxFileBytes = 6 * 1024 * 1024;

function assistantStorageKey() {
  return getCurrentUser() ? `academicAssistant_${getCurrentUser().uid}` : "";
}
function persistAssistantState() {
  const key = assistantStorageKey();
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify({
      documentText: assistantState.documentText,
      documentName: assistantState.documentName,
      history: assistantState.history.slice(-12),
      savedAnswers: assistantState.savedAnswers.slice(-50),
    }));
  } catch (error) {
    setAssistantStatus("No se pudo guardar en este dispositivo; libera espacio del navegador.", true);
  }
}
function loadAssistantState() {
  const key = assistantStorageKey();
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
  assistantState.documentText = typeof stored.documentText === "string" ? stored.documentText.slice(0, 50000) : "";
  assistantState.documentName = typeof stored.documentName === "string" ? stored.documentName : "";
  assistantState.history = Array.isArray(stored.history) ? stored.history.slice(-12).filter((item) => item && ["user", "model"].includes(item.role) && typeof item.text === "string") : [];
  assistantState.savedAnswers = Array.isArray(stored.savedAnswers) ? stored.savedAnswers.slice(-50).filter((item) => item && typeof item.text === "string") : [];
  assistantElements.documentStatus.textContent = assistantState.documentText
    ? `Documento listo: ${assistantState.documentName} · texto extraído disponible en este dispositivo.`
    : "Aún no hay un documento cargado.";
  assistantElements.removeDocument.disabled = !assistantState.documentText;
  assistantElements.send.disabled = !assistantState.documentText || assistantBusy;
  assistantElements.saveConversation.disabled = !assistantState.history.length;
  renderAssistantMessages();
  renderAssistantSavedAnswers();
}
function setAssistantStatus(message, isError = false) {
  assistantElements.status.textContent = message;
  assistantElements.status.classList.toggle("error", isError);
}
function renderAssistantMessages() {
  assistantElements.messages.replaceChildren();
  if (!assistantState.history.length) {
    const welcome = document.createElement("p");
    welcome.className = "assistant-welcome";
    welcome.textContent = assistantState.documentText
      ? "Documento listo. Elige una herramienta o escribe una pregunta."
      : "Carga un documento para empezar. Puedes usar las herramientas de estudio o hacer tu propia pregunta.";
    assistantElements.messages.appendChild(welcome);
    return;
  }
  assistantState.history.forEach((item) => {
    const bubble = document.createElement("article");
    bubble.className = `assistant-message ${item.role === "user" ? "user" : "model"}`;
    const text = document.createElement("div");
    text.textContent = item.text;
    bubble.appendChild(text);
    if (item.role === "model") {
      const actions = document.createElement("div");
      actions.className = "assistant-message-actions";
      const copy = document.createElement("button");
      copy.type = "button";
      copy.textContent = "Copiar";
      copy.onclick = () => copyAssistantText(item.text);
      const save = document.createElement("button");
      save.type = "button";
      save.textContent = "Guardar respuesta";
      save.onclick = () => saveAssistantAnswer(item.text);
      actions.append(copy, save);
      bubble.appendChild(actions);
    }
    assistantElements.messages.appendChild(bubble);
  });
  assistantElements.messages.scrollTop = assistantElements.messages.scrollHeight;
}
function renderAssistantSavedAnswers() {
  assistantElements.savedAnswers.replaceChildren();
  assistantState.savedAnswers.slice().reverse().forEach((item, reverseIndex) => {
    const index = assistantState.savedAnswers.length - 1 - reverseIndex;
    const card = document.createElement("article");
    card.className = "assistant-saved-item";
    const answer = document.createElement("p");
    answer.textContent = item.text;
    const actions = document.createElement("div");
    const copy = document.createElement("button");
    copy.type = "button";
    copy.textContent = "Copiar";
    copy.onclick = () => copyAssistantText(item.text);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Quitar";
    remove.onclick = () => {
      assistantState.savedAnswers.splice(index, 1);
      persistAssistantState();
      renderAssistantSavedAnswers();
    };
    actions.append(copy, remove);
    card.append(answer, actions);
    assistantElements.savedAnswers.appendChild(card);
  });
}
async function copyAssistantText(text) {
  try {
    await navigator.clipboard.writeText(text);
    setAssistantStatus("Respuesta copiada.");
  } catch {
    setAssistantStatus("No se pudo copiar. Revisa los permisos del navegador.", true);
  }
}
function saveAssistantAnswer(text) {
  if (!text) return;
  assistantState.savedAnswers.push({ text, savedAt: new Date().toISOString() });
  assistantState.savedAnswers = assistantState.savedAnswers.slice(-50);
  persistAssistantState();
  renderAssistantSavedAnswers();
  setAssistantStatus("Respuesta guardada en este dispositivo.");
}
function assistantFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}
async function callAssistantApi(body) {
  const sessionUser = getCurrentUser();
  if (!sessionUser) throw new Error("Inicia sesión para usar el asistente.");
  const token = await sessionUser.getIdToken();
  const response = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "No se pudo conectar con el asistente. Verifica que la función esté desplegada.");
  return result;
}
async function uploadAssistantDocument(file) {
  if (!getCurrentUser()) return setAssistantStatus("Inicia sesión para usar el asistente.", true);
  const lowerName = file.name.toLowerCase();
  const isPdf = lowerName.endsWith(".pdf") || file.type === "application/pdf";
  const isDocx = lowerName.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (!isPdf && !isDocx) {
    assistantElements.file.value = "";
    return setAssistantStatus("Formato no compatible. Selecciona un PDF o Word (.docx).", true);
  }
  if (!file.size || file.size > assistantMaxFileBytes) {
    assistantElements.file.value = "";
    return setAssistantStatus("El documento debe tener contenido y pesar máximo 6 MB.", true);
  }
  if (assistantState.documentText && !confirm("Al cargar otro documento se borrará la conversación actual para evitar mezclar materiales. ¿Continuar?")) {
    assistantElements.file.value = "";
    return;
  }
  assistantBusy = true;
  assistantElements.file.disabled = true;
  assistantElements.send.disabled = true;
  assistantElements.documentStatus.textContent = `Analizando ${file.name}…`;
  setAssistantStatus("Extrayendo texto del documento…");
  try {
    const base64 = await assistantFileToBase64(file);
    const result = await callAssistantApi({
      action: "extract",
      fileName: file.name,
      mimeType: isPdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      base64,
    });
    assistantState.documentText = String(result.text || "").slice(0, 50000);
    assistantState.documentName = file.name;
    assistantState.history = [];
    assistantState.savedAnswers = [];
    persistAssistantState();
    assistantElements.documentStatus.textContent = `Documento listo: ${file.name}${result.truncated ? " · se analizaron los primeros 50.000 caracteres" : ""}`;
    assistantElements.removeDocument.disabled = false;
    renderAssistantMessages();
    renderAssistantSavedAnswers();
    setAssistantStatus("Documento analizado. Las preguntas se responderán basándose en este material.");
  } catch (error) {
    assistantElements.documentStatus.textContent = "No se pudo analizar el documento.";
    setAssistantStatus(error.message, true);
  } finally {
    assistantBusy = false;
    assistantElements.file.disabled = false;
    assistantElements.send.disabled = !assistantState.documentText;
    assistantElements.file.value = "";
  }
}
async function sendAssistantQuestion(question = assistantElements.question.value.trim()) {
  if (!assistantState.documentText) return setAssistantStatus("Primero carga un documento PDF o DOCX.", true);
  if (!question || assistantBusy) return;
  if (question.length > 4000) return setAssistantStatus("La pregunta puede tener máximo 4.000 caracteres.", true);
  assistantBusy = true;
  assistantElements.send.disabled = true;
  assistantElements.question.disabled = true;
  assistantElements.file.disabled = true;
  assistantElements.saveConversation.disabled = true;
  const conversationContext = assistantState.history.slice(-12);
  if (conversationContext[0]?.role === "model") conversationContext.shift();
  assistantState.history.push({ role: "user", text: question });
  renderAssistantMessages();
  assistantElements.question.value = "";
  setAssistantStatus("Preparando una respuesta basada en el documento…");
  try {
    const result = await callAssistantApi({
      action: "chat",
      documentText: assistantState.documentText,
      question,
      history: conversationContext,
    });
    assistantState.history.push({ role: "model", text: String(result.answer || "") });
    assistantState.history = assistantState.history.slice(-12);
    if (assistantState.history[0]?.role === "model") assistantState.history.shift();
    persistAssistantState();
    renderAssistantMessages();
    setAssistantStatus("Respuesta basada en el documento. Verifica los datos con tu material.");
  } catch (error) {
    assistantState.history.pop();
    renderAssistantMessages();
    setAssistantStatus(error.message, true);
  } finally {
    assistantBusy = false;
    assistantElements.send.disabled = !assistantState.documentText;
    assistantElements.question.disabled = false;
    assistantElements.file.disabled = false;
    assistantElements.saveConversation.disabled = !assistantState.history.length;
    assistantElements.question.focus();
  }
}
function saveAssistantConversationFile() {
  if (!assistantState.history.length) return;
  const transcript = assistantState.history.map((item) => `${item.role === "user" ? "Estudiante" : "Asistente"}:\n${item.text}`).join("\n\n");
  const blob = new Blob([`Documento: ${assistantState.documentName || "sin nombre"}\n\n${transcript}`], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `conversacion-${(assistantState.documentName || "estudio").replace(/[^\w.-]+/g, "_")}.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  persistAssistantState();
  setAssistantStatus("Conversación descargada y guardada en este dispositivo.");
}
function clearAssistantDocument() {
  assistantState.documentText = "";
  assistantState.documentName = "";
  assistantState.history = [];
  assistantState.savedAnswers = [];
  const key = assistantStorageKey();
  if (key) localStorage.removeItem(key);
  assistantElements.file.value = "";
  assistantElements.documentStatus.textContent = "Aún no hay un documento cargado.";
  assistantElements.removeDocument.disabled = true;
  assistantElements.send.disabled = true;
  assistantElements.saveConversation.disabled = true;
  renderAssistantMessages();
  renderAssistantSavedAnswers();
  setAssistantStatus("Documento, conversación y respuestas guardadas eliminados de este dispositivo.");
}

document.getElementById("closeAssistantBtn")?.addEventListener("click", () => assistantElements.modal.classList.add("hidden"));
assistantElements.modal?.addEventListener("click", (event) => {
  if (event.target.dataset.closeAssistant === "true") assistantElements.modal.classList.add("hidden");
});
assistantElements.file?.addEventListener("change", () => {
  const file = assistantElements.file.files?.[0];
  if (file) uploadAssistantDocument(file);
});
assistantElements.removeDocument?.addEventListener("click", () => {
  if (confirm("¿Eliminar el documento, la conversación y las respuestas guardadas?")) clearAssistantDocument();
});
assistantElements.deleteData?.addEventListener("click", () => {
  if (confirm("Se eliminarán del navegador el texto extraído, toda la conversación y las respuestas guardadas. ¿Continuar?")) clearAssistantDocument();
});
assistantElements.form?.addEventListener("submit", (event) => {
  event.preventDefault();
  sendAssistantQuestion();
});
document.querySelectorAll("[data-assistant-prompt]").forEach((button) => {
  button.addEventListener("click", () => sendAssistantQuestion(button.dataset.assistantPrompt));
});
assistantElements.saveConversation?.addEventListener("click", saveAssistantConversationFile);
