export function uiLog(message, sessionId, icon = "⚙️") {
  console.log(`${icon} [SESSION ${sessionId}] ${message}`);
}
