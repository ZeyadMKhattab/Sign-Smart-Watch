let spelledWord = "";

// --- دالة للتعامل مع الأزرار "Try ..." ---
const getCommonWords = function (word) {
  if (aslRadio.checked) {
    // مسح الكروت القديمة
    spelledWord = "";
    const previousCards =
      emergedSymbolsContainer.querySelectorAll(".card, .space-card");
    previousCards.forEach((c) => c.remove());

    // حط الكلمة في الـ input field
    inputField.value = word;

    // استدعي نفس المنطق اللي بيطلع الكروت
    const text = word.toUpperCase();
    for (let char of text) {
      if (char >= "A" && char <= "Z") {
        spelledWord += char;

        // ابحث عن الكارد المناسب
        const card = Array.from(alphabetCards).find(
          (c) => c.getAttribute("title") === char,
        );
        if (card) emergeCard(card);
      } else if (char === " ") {
        spelledWord += " ";
        const spaceCard = document.createElement("div");
        spaceCard.classList.add("space-card");
        spaceCard.style.display = "inline-block";
        spaceCard.style.width = "50px";
        spaceCard.style.height = "50px";
        spaceCard.style.margin = "5px";
        spaceCard.style.backgroundColor = "#f0f0f0";
        spaceCard.style.border = "2px dashed #ccc";
        spaceCard.style.borderRadius = "8px";
        emergedSymbolsContainer.appendChild(spaceCard);
      }
    }

    // حدّث العنوان
    emergedTitle.textContent = spelledWord || "Spelling";
  }
};

const aslContainer = document.getElementById("spelling-alphabet-container");
const eslContainer = document.getElementById("egyptian-alphabet-container");
const aslRadio = document.getElementById("asl");
const eslRadio = document.getElementById("esl");

const commonWordOkay = document.getElementById("common-word-okay");
const commonWordHello = document.getElementById("common-word-hello");

aslRadio.addEventListener("change", () => {
  if (aslRadio.checked) {
    aslContainer.style.display = "block";
    eslContainer.style.display = "none";
    commonWordOkay.style.display = "block";
    commonWordHello.style.display = "block";
    alphabetCards = document.querySelectorAll(
      "#spelling-alphabet-container .card",
    );
    resetSpeller();
    attachCardListeners();
  }
});

eslRadio.addEventListener("change", () => {
  if (eslRadio.checked) {
    aslContainer.style.display = "none";
    eslContainer.style.display = "block";
    commonWordOkay.style.display = "none";
    commonWordHello.style.display = "none";
    alphabetCards = document.querySelectorAll(
      "#egyptian-alphabet-container .card",
    );
    resetSpeller();
    attachCardListeners();
  }
});

function resetSpeller() {
  spelledWord = "";
  emergedTitle.textContent = "Spelling";
  inputField.value = "";
  const previousCards =
    emergedSymbolsContainer.querySelectorAll(".card, .space-card");
  previousCards.forEach((c) => c.remove());
}

// --- MAIN ELEMENTS ---
let alphabetCards = document.querySelectorAll(
  "#spelling-alphabet-container .card",
);
const emergedSymbolsContainer = document.getElementById("emerged-symbols");

// إنشاء أو الحصول على emergedTitle
let emergedTitle = emergedSymbolsContainer.querySelector("h1");
if (!emergedTitle) {
  emergedTitle = document.createElement("h1");
  emergedSymbolsContainer.appendChild(emergedTitle);
}

const inputField = document.getElementById("speller-search-input");
const clearButton = document.querySelector(".spell-form button");

function attachCardListeners() {
  alphabetCards.forEach((card) => {
    card.addEventListener("click", () => {
      const letter =
        card.getAttribute("title") || card.querySelector("h1").textContent;
      addSymbol(letter);
      emergeCard(card);
    });
  });
}

// --- CLICKING ALPHABET CARDS ---
attachCardListeners();


// --- ADD SYMBOL FUNCTION ---
function addSymbol(letter) {
  if (aslRadio.checked) {
    spelledWord += letter.toUpperCase();
    inputField.value = spelledWord;
  } else {
    inputField.value += letter + " ";
  }
  inputField.dispatchEvent(new Event('input'));
}

// --- EMERGE CARD FUNCTION ---
function emergeCard(card) {
  const clone = card.cloneNode(true);
  clone.style.display = "inline-block";
  clone.style.margin = "5px";
  clone.style.width = "50px";
  clone.style.height = "auto";
  clone.querySelector("h1").style.fontSize = "14px";
  emergedSymbolsContainer.appendChild(clone);
}

// --- INPUT FIELD HANDLER ---
inputField.addEventListener("input", (e) => {
  spelledWord = "";
  // remove previous cards
  const previousCards =
    emergedSymbolsContainer.querySelectorAll(".card, .space-card");
  previousCards.forEach((c) => c.remove());

  const text = e.target.value.toUpperCase(); // normalize

  if (aslRadio.checked) {
    for (let char of text) {
      if (char >= "A" && char <= "Z") {
        spelledWord += char;

        // find matching card
        const card = Array.from(alphabetCards).find(
          (c) => c.getAttribute("title") === char,
        );
        if (card) emergeCard(card);
      } else if (char === " ") {
        spelledWord += " ";
        const spaceCard = document.createElement("div");
        spaceCard.classList.add("space-card");
        spaceCard.style.display = "inline-block";
        spaceCard.style.width = "50px";
        spaceCard.style.height = "50px";
        spaceCard.style.margin = "5px";
        spaceCard.style.backgroundColor = "#f0f0f0";
        spaceCard.style.border = "2px dashed #ccc";
        spaceCard.style.borderRadius = "8px";
        emergedSymbolsContainer.appendChild(spaceCard);
      }
    }
  } else {
    const words = e.target.value.split(" ");
    for (let word of words) {
      if (word === "") {
        continue;
      }
      const card = Array.from(alphabetCards).find(
        (c) => c.getAttribute("title").toUpperCase() === word.toUpperCase(),
      );
      if (card) {
        spelledWord += card.getAttribute("title") + " ";
        emergeCard(card);
      }
    }
    spelledWord = e.target.value;
  }

  emergedTitle.textContent = spelledWord || "Spelling";
});

// --- CLEAR BUTTON ---
clearButton.addEventListener("click", () => {
  spelledWord = "";
  emergedTitle.textContent = "Spelling";
  inputField.value = "";
  const previousCards =
    emergedSymbolsContainer.querySelectorAll(".card, .space-card");
  previousCards.forEach((c) => c.remove());
});
