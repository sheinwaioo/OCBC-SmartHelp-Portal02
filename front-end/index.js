const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Add user message
  addMessage(message, "user");
  userInput.value = "";

  // Add thinking indicator
  const thinking = addMessage("Thinking...", "ai");

  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    thinking.innerHTML = formatAIReply(data.reply || "No response.");

  } catch (err) {
    thinking.textContent = "Unable to reach AI service.";
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* ---------- FORMATTER ---------- */

function formatAIReply(text) {
  if (!text) return "";

  // Escape HTML
  text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Paragraphs
  return text
    .split(/\n{2,}/)
    .map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/* ---------- MESSAGE CREATOR ---------- */

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `chat-message ${sender}`;

  if (sender === "ai") {
    msg.innerHTML = formatAIReply(text);
  } else {
    msg.textContent = text;
  }

  chatMessages.appendChild(msg);
  return msg;
}
