const API_KEY = "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";

const messagesDiv = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");


window.addEventListener("load", () => {
  showBotMessage("How can I assist today?");
});


clearBtn.addEventListener("click", () => {
  messagesDiv.innerHTML = "";
  showBotMessage("Chat cleared. How can I assist?");
});


sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function appendMessageElement(el) {
  messagesDiv.appendChild(el);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function createUserMessage(text) {
  const userMsg = document.createElement("div");
  userMsg.className = "msg user";
  userMsg.textContent = text;
  return userMsg;
}

function createBotMessageContainer() {
  const botMsg = document.createElement("div");
  botMsg.className = "msg bot";
  return botMsg;
}

function formatTimestamp() {
  const d = new Date();
  return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

function showBotMessage(text) {
  const botMsg = createBotMessageContainer();
  appendMessageElement(botMsg);


  let i = 0;
  function typeWriter() {
    if (i < text.length) {
      botMsg.textContent += text.charAt(i);
      i++;
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      setTimeout(typeWriter, 10);
    } else {
 
      const stamp = document.createElement("small");
      stamp.textContent = formatTimestamp();
      botMsg.appendChild(stamp);
    }
  }
  typeWriter();
}

async function sendMessage() {
  const userText = inputEl.value.trim();
  if (!userText) return;

  const userMsgEl = createUserMessage(userText);
  appendMessageElement(userMsgEl);
  const ts = document.createElement("small");
  ts.textContent = formatTimestamp();
  userMsgEl.appendChild(ts);

  inputEl.value = "";
  inputEl.focus();

 
  const loadingBot = createBotMessageContainer();
  loadingBot.textContent = "Typing...";
  appendMessageElement(loadingBot);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: userText }]
      })
    });

    

    messagesDiv.removeChild(loadingBot);

    if (!response.ok) {
      const text = `❌ Error: ${response.status} ${response.statusText}`;
      showBotMessage(text);
      return;
    }

    const data = await response.json();
    const botText = data?.choices?.[0]?.message?.content || "⚠️ No response from server.";
    showBotMessage(botText);

  } catch (err) {
    if (messagesDiv.contains(loadingBot)) messagesDiv.removeChild(loadingBot);
    showBotMessage("❌ Error: " + (err.message || "Network error"));
  }
}
