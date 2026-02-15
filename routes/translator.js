const express = require('express');
const router = express.Router();

// Translation data (example - can be expanded)
const translations = {
  hello: { gesture: 'Wave hand with open palm' },
  thank_you: { gesture: 'Bring hand to chin and move downward' },
  yes: { gesture: 'Nod head while making fist' },
  no: { gesture: 'Shake head side to side' },
  love: { gesture: 'Cross hands over heart' },
  friend: { gesture: 'Link fingers together' },
  help: { gesture: 'Raise hand with open palm' },
  please: { gesture: 'Place hand on chest and circle' },
  sorry: { gesture: 'Make fist and circle on chest' },
  water: { gesture: 'Make W shape with hand near mouth' },
  food: { gesture: 'Bring fingers to mouth' },
  sleep: { gesture: 'Tilt head on hand' },
  work: { gesture: 'Knock fist on fist' },
  play: { gesture: 'Shake both hands open' },
  happy: { gesture: 'Brush hand up face twice' }
};

/*
 Convert a word to a gesture (NO AUTHENTICATION REQUIRED)
 */
router.get('/word-to-gesture', (req, res) => {
  const word = req.query.word?.toLowerCase();

  if (!word) {
    return res.status(400).json({ 
      message: 'Please provide a word to translate' 
    });
  }

  const translation = translations[word];

  if (translation) {
    return res.json({
      word,
      gesture: translation.gesture,
      success: true
    });
  } else {
    return res.status(404).json({
      message: `Translation for '${word}' not found`,
      available_words: Object.keys(translations),
      success: false
    });
  }
});

/*
 Convert a gesture description to a word (NO AUTHENTICATION REQUIRED)
 */
router.get('/gesture-to-word', (req, res) => {
  const gestureDescription = req.query.gesture?.toLowerCase();

  if (!gestureDescription) {
    return res.status(400).json({ 
      message: 'Please provide a gesture description' 
    });
  }

  // Find matching gesture
  let foundTranslation = null;
  for (const [word, data] of Object.entries(translations)) {
    if (data.gesture.toLowerCase().includes(gestureDescription) || 
        gestureDescription.includes(data.gesture.toLowerCase())) {
      foundTranslation = { word, gesture: data.gesture };
      break;
    }
  }

  if (foundTranslation) {
    return res.json({
      gesture: gestureDescription,
      word: foundTranslation.word,
      success: true
    });
  } else {
    return res.status(404).json({
      message: 'No matching word found for this gesture',
      success: false
    });
  }
});

/*
 Get all available translations (NO AUTHENTICATION REQUIRED)
 */
router.get('/all-translations', (req, res) => {
  res.json({
    total: Object.keys(translations).length,
    translations,
    success: true
  });
});

module.exports = router;
