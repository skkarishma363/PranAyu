const translations = {

    en: {
        navRemedies: "Remedies",
        navPharmacies: "Pharmacies",
        navAbout: "About Us",
        navContact: "Contact",
        profile: "Profile",
        login: "Login",
        create: "Create Account",
        logout: "Logout",

        welcomeText: "Welcome to PranAyu",
        assistantText: "Your personal assistant for natural remedies and wellness.",
        bothering: "What's bothering you?",
        describe: "Describe your symptoms and we'll suggest gentle home remedies.",
        placeholderText: "Describe your symptoms...",
        sendBtn: "Send",

        notFound: "I couldn't detect the symptom. Please try again.",
        remedyFor: "Here are remedies for",
        remedy: "Remedy",
        howWorks: "How it works",
        followCold: "Are you experiencing sore throat too?",
        followFever: "Do you also have cold or cough?",
        followStomach: "Are you also feeling nausea or diarrhea?"
    },

    hi: {
        navRemedies: "उपचार",
        navPharmacies: "फार्मेसी",
        navAbout: "हमारे बारे में",
        navContact: "संपर्क",
        profile: "प्रोफ़ाइल",
        login: "लॉगिन",
        create: "खाता बनाएं",
        logout: "लॉगआउट",

        welcomeText: "प्रणआयु में आपका स्वागत है",
        assistantText: "प्राकृतिक उपचार और स्वास्थ्य के लिए आपका व्यक्तिगत सहायक।",
        bothering: "आपको क्या परेशानी है?",
        describe: "अपने लक्षण बताएं, हम घरेलू उपचार सुझाएंगे।",
        placeholderText: "अपने लक्षण बताएं...",
        sendBtn: "भेजें",

        notFound: "लक्षण पहचान नहीं पाए। कृपया फिर प्रयास करें।",
        remedyFor: "यह रहे उपचार",
        remedy: "उपचार",
        howWorks: "यह कैसे काम करता है",
        followCold: "क्या आपको गले में खराश भी है?",
        followFever: "क्या आपको सर्दी या खांसी भी है?",
        followStomach: "क्या आपको मतली या दस्त भी है?"
    },

    te: {
        navRemedies: "చికిత్సలు",
        navPharmacies: "ఫార్మసీలు",
        navAbout: "మా గురించి",
        navContact: "సంప్రదించండి",
        profile: "ప్రొఫైల్",
        login: "లాగిన్",
        create: "ఖాతా సృష్టించండి",
        logout: "లాగ్ అవుట్",

        welcomeText: "ప్రణాయు కు స్వాగతం",
        assistantText: "సహజ చికిత్సలు మరియు ఆరోగ్యానికి మీ వ్యక్తిగత సహాయకుడు.",
        bothering: "మీకు ఏమి సమస్య ఉంది?",
        describe: "మీ లక్షణాలు చెప్పండి, మేము సహజ చికిత్సలు సూచిస్తాము.",
        placeholderText: "మీ లక్షణాలు వివరించండి...",
        sendBtn: "పంపండి",

        notFound: "లక్షణాన్ని గుర్తించలేకపోయాము. మళ్లీ ప్రయత్నించండి.",
        remedyFor: "ఇవి చికిత్సలు",
        remedy: "చికిత్స",
        howWorks: "ఇది ఎలా పనిచేస్తుంది",
        followCold: "మీకు గొంతు నొప్పి కూడా ఉందా?",
        followFever: "మీకు జలుబు లేదా దగ్గు ఉందా?",
        followStomach: "మీకు వాంతులు లేదా విరేచనాలు ఉన్నాయా?"
    }

};

let currentLanguage = localStorage.getItem("lang") || "en";
let currentFollowUp = null;

const chatBox = document.getElementById("chat-box");

// ========================
// APPLY UI TRANSLATIONS
// ========================
function applyTranslations() {

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.getAttribute("data-i18n");
        if (translations[currentLanguage][key]) {
            element.innerText = translations[currentLanguage][key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        const key = element.getAttribute("data-i18n-placeholder");
        if (translations[currentLanguage][key]) {
            element.placeholder = translations[currentLanguage][key];
        }
    });

    document.documentElement.lang = currentLanguage;
}
document.getElementById("languageSwitcher").addEventListener("change", function() {
    currentLanguage = this.value;
    localStorage.setItem("lang", currentLanguage);
    applyTranslations();
});

applyTranslations();

// ========================
// ADD MESSAGE
// ========================

function addMessage(text, sender) {

    const msg = document.createElement("div");
    msg.classList.add("message");
    msg.classList.add(sender === "user" ? "user-message" : "bot-message");
    msg.innerText = text;

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    if(sender === "bot"){
        speak(text);
    }
}

// ========================
// HANDLE USER INPUT
// ========================

function handleUserInput(){

    const input = document.getElementById("user-input");
    const text = input.value.toLowerCase();
    if(!text) return;

    addMessage(input.value,"user");
    input.value = "";

    findRemedy(text);
}

// ========================
// FIND REMEDY
// ========================

function findRemedy(userText){

    // YES / NO handling in all languages
    if (currentFollowUp) {

    const text = userText.toLowerCase().trim();

    const yesWords = ["yes","yeah","yep","haan","हाँ","avunu","అవును"];
    const noWords  = ["no","nahi","नहीं","kaadu","కాదు"];

    const isYes = yesWords.some(word => text.includes(word));
    const isNo  = noWords.some(word => text.includes(word));

    if (isYes) {

        if (currentFollowUp === "cold") {
            showRemedy("Sore Throat");
        }

        if (currentFollowUp === "fever") {
            showRemedy("Common Cold");
        }

        currentFollowUp = null;
        return;
    }

    if (isNo) {
        addMessage("Okay. Tell me if you have other symptoms.", "bot");
        currentFollowUp = null;
        return;
    }
}
    let found = false;

for (let key in symptomMap) {

    if (symptomMap[key].some(word => userText.includes(word.toLowerCase()))) {

        showRemedy(key);
        askFollowUp(key);
        found = true;
        break;
    }
}

if (!found) {
    addMessage(translations[currentLanguage].notFound, "bot");
}
}

// ========================
// SHOW REMEDY
// ========================

function showRemedy(symptomName){

    remedies.forEach(item => {

        if(item.symptom.toLowerCase().includes(symptomName.toLowerCase())){

            addMessage(
                translations[currentLanguage].remedyFor + " " + item.symptom + ":",
                "bot"
            );

            addMessage(
                "🌿 " + translations[currentLanguage].remedy + ": " + item.remedy +
                "\n\n🩺 " + translations[currentLanguage].howWorks + ": " + item.process,
                "bot"
            );
        }
    });
}

// ========================
// FOLLOW UP
// ========================

function askFollowUp(symptom){

    if(symptom.toLowerCase().includes("fever")){
        currentFollowUp = "fever";
        addMessage(translations[currentLanguage].followFever, "bot");
    }

    if(symptom.toLowerCase().includes("cold")){
        currentFollowUp = "cold";
        addMessage(translations[currentLanguage].followCold, "bot");
    }

    if(symptom.toLowerCase().includes("stomach")){
        currentFollowUp = "stomach";
        addMessage(translations[currentLanguage].followStomach, "bot");
    }
}

// ========================
// VOICE INPUT
// ========================

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
        document.getElementById("user-input").value = transcript;
        handleUserInput();
    };

    recognition.onerror = function (event) {
        console.log(event.error);
    };
}

// ========================
// VOICE OUTPUT
// ========================

function speak(text){

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang =
        currentLanguage === "hi" ? "hi-IN" :
        currentLanguage === "te" ? "te-IN" :
        "en-US";

    window.speechSynthesis.speak(speech);
}

// ========================
// ENTER KEY SUPPORT
// ========================

document.getElementById("user-input").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleUserInput();
    }
});

function isYes(text) {

    const yesWords = [
        "yes", "yeah", "yep",
        "haan", "हाँ",
        "avunu", "అవును"
    ];

    return yesWords.some(word => text.includes(word.toLowerCase()));
}

function isNo(text) {

    const noWords = [
        "no",
        "nahi", "नहीं",
        "kaadu", "కాదు"
    ];

    return noWords.some(word => text.includes(word.toLowerCase()));
}

const symptomMap = {
    fever: ["fever", "ज्वर", "बुखार", "జ్వరం"],
    cold: ["cold", "सर्दी", "జలుబు"],
    headache: ["headache", "सिरदर्द", "తలనొప్పి"],
    cough: ["cough", "खांसी", "దగ్గు"],
    "sore throat": ["sore throat", "गले में खराश", "గొంతు నొప్పి"]
};