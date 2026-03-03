
const translations = {
    en: {
        placeholderText: "Describe your symptoms...",
        sendBtn: "Send"
    },
    hi: {
        placeholderText: "अपने लक्षण बताएं...",
        sendBtn: "भेजें"
    },
    te: {
        placeholderText: "మీ లక్షణాలు వివరించండి...",
        sendBtn: "పంపండి"
    }
};

let currentLanguage = localStorage.getItem("lang") || "en";

const chatBox = document.getElementById("chat-box");
const inputField = document.getElementById("user-input");


function applyTranslations() {

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.getAttribute("data-i18n");

        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.innerText = translations[currentLanguage][key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        const key = element.getAttribute("data-i18n-placeholder");

        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.placeholder = translations[currentLanguage][key];
        }
    });

    document.documentElement.lang = currentLanguage;
}

document.getElementById("languageSwitcher").addEventListener("change", function () {
    currentLanguage = this.value;
    localStorage.setItem("lang", currentLanguage);
    applyTranslations();
});

applyTranslations();



function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.classList.add("message");
    msg.classList.add(sender === "user" ? "user-message" : "bot-message");
    msg.innerText = text;

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (sender === "bot") {
        speak(text);
    }
}


async function handleUserInput() {
    const userText = inputField.value.trim();
    if (!userText) return;

    addMessage(userText, "user");
    inputField.value = "";

    try {
        const response = await fetch("http://127.0.0.1:8000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: userText })
        });

        const data = await response.json();
        addMessage(data.response, "bot");

    } catch (error) {
        addMessage("Server error. Please make sure backend is running.", "bot");
    }
}



inputField.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleUserInput();
    }
});



function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Use Google Chrome for voice feature.");
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang =
        currentLanguage === "hi" ? "hi-IN" :
        currentLanguage === "te" ? "te-IN" :
        "en-US";

    recognition.start();

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        inputField.value = transcript;
        handleUserInput();
    };
}


function speak(text) {
    const speech = new SpeechSynthesisUtterance(text);

    speech.lang =
        currentLanguage === "hi" ? "hi-IN" :
        currentLanguage === "te" ? "te-IN" :
        "en-US";

    window.speechSynthesis.speak(speech);
}
document.addEventListener("DOMContentLoaded", function () {
    applyTranslations();
});