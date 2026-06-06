console.log("chat.js loaded ✅");

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

if (!chatBox || !input || !sendBtn) {
  console.error("ID missing ❌ Check chat-box, user-input, send-btn");
} else {
  console.log("All IDs found ✅");
}

async function handleUserInput() {
  console.log("Send clicked ✅");

  const message = input.value.trim();

  if (!message) {
    alert("Please type a message");
    return;
  }

  chatBox.innerHTML += `
    <div class="user-message">
      ${message}
    </div>
  `;

  input.value = "";

  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error("Server error: " + response.status);
    }

    const data = await response.json();

    chatBox.innerHTML += `
      <div class="bot-message">
        ${data.reply || "No reply received"}
      </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (error) {
    console.error("Chat error ❌", error);

    chatBox.innerHTML += `
      <div class="bot-message">
        Error connecting to chat server
      </div>
    `;
  }
}

sendBtn.addEventListener("click", handleUserInput);

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    handleUserInput();
  }
});