// js/voice.js

const micBtn = document.querySelector(".mic-btn");
const input = document.querySelector(".search-input");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  console.log("SpeechRecognition not supported in this browser.");
  // You can show a small message to user if you want
} else {
  let recognition = null;
  let activeLang = "en-IN"; // start default

  function isTelugu(text) {
    // Telugu Unicode block: 0C00–0C7F
    return /[\u0C00-\u0C7F]/.test(text);
  }

  function startRecognition(lang) {
    if (recognition) recognition.abort();

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      transcript = transcript.trim();
      if (!transcript) return;

      // Put live speech text into the input
      input.value = transcript;

      // If we started in English but user actually spoke Telugu, restart once in Telugu
      const telugu = isTelugu(transcript);

      if (telugu && activeLang !== "te-IN") {
        activeLang = "te-IN";
        // Restart recognition quickly in Telugu for better accuracy
        startRecognition(activeLang);
        return;
      }

      // If it’s not Telugu, treat it as English (or Hindi etc. if you extend)
      if (!telugu && activeLang !== "en-IN") {
        activeLang = "en-IN";
      }

      // If this result is final, trigger your built-in response logic
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        handleUserQuery(transcript, telugu ? "te" : "en");
      }
    };

    recognition.onerror = (e) => {
      console.log("Speech error:", e.error);
    };

    recognition.onend = () => {
      // optional: update UI mic icon state here
    };

    recognition.start();
  }

  micBtn.addEventListener("click", () => {
    // Start with last-known lang (so repeated use works nicely)
    startRecognition(activeLang);
  });

  // ENTER key should also trigger your response (you asked this earlier)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const text = input.value.trim();
      if (!text) return;
      handleUserQuery(text, isTelugu(text) ? "te" : "en");
    }
  });
}

// Replace this with YOUR built-in answer mapping
function handleUserQuery(text, lang) {
  // lang will be "te" or "en"
  // Example routing:
  // if (lang === "te") { use teluguAnswers[text] }
  // else { use englishAnswers[text] }

  console.log("Query:", text, "Lang:", lang);

  // TODO: show response in UI
  // Example:
  // document.querySelector(".response-box").textContent = reply;
}