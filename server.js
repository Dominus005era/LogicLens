const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMMA_API_KEY = process.env.GEMMA_API_KEY;
const GEMMA_MODEL = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static('public'));

// Fallacy Library Data (20+ Logical Fallacies)
const FALLACY_LIBRARY = [
  {
    id: 'strawman',
    name: 'Strawman',
    category: 'Distortion',
    definition: 'Misrepresenting or exaggerating someone’s argument to make it easier to attack.',
    example: 'Person A: "We should invest more in public transit." Person B: "So you want to ban all private cars and force everyone onto buses!"'
  },
  {
    id: 'ad_hominem',
    name: 'Ad Hominem',
    category: 'Personal Attack',
    definition: 'Attacking the person making the argument rather than addressing the substance of the argument itself.',
    example: 'Person A: "The study shows solar efficiency has increased by 40%." Person B: "You are not a real engineer, so your opinion is worthless."'
  },
  {
    id: 'slippery_slope',
    name: 'Slippery Slope',
    category: 'Causal',
    definition: 'Assuming without evidence that a relatively small first step will inevitably lead to a chain of extreme consequences.',
    example: 'Person A: "We should allow students to submit assignments 10 minutes late." Person B: "If we do that, nobody will ever work, society will collapse!"'
  },
  {
    id: 'appeal_to_emotion',
    name: 'Appeal to Emotion',
    category: 'Emotional Manipulation',
    definition: 'Attempting to win an argument by manipulating emotions like fear, pity, or anger instead of presenting logic.',
    example: 'Person A: "Think of the innocent children who will suffer if we don\'t pass this exact budget right now!"'
  },
  {
    id: 'circular_reasoning',
    name: 'Circular Reasoning',
    category: 'Begging the Question',
    definition: 'An argument where the reasoner begins with what they are trying to end with; restating the premise as the conclusion.',
    example: 'Person A: "This software is completely safe because it has zero flaws, and we know it has zero flaws because it is safe."'
  },
  {
    id: 'hasty_generalization',
    name: 'Hasty Generalization',
    category: 'Inductive Logic',
    definition: 'Making a broad claim based on a small or non-representative sample size.',
    example: 'Person A: "My neighbor\'s EV battery failed after 2 years, which proves all electric cars are unreliable junk."'
  },
  {
    id: 'false_cause',
    name: 'False Cause (Post Hoc)',
    category: 'Causal',
    definition: 'Incorrectly assuming that because Event B occurred after Event A, Event A must have caused Event B.',
    example: 'Person A: "It rained right after I washed my car, so washing my car caused the rain storm."'
  },
  {
    id: 'false_dilemma',
    name: 'False Dilemma / Either-Or',
    category: 'Black-and-White',
    definition: 'Presenting two alternative states as the only possibilities, when in fact more possibilities exist.',
    example: 'Person A: "Either you support this tax reform 100%, or you hate prosperity."'
  },
  {
    id: 'red_herring',
    name: 'Red Herring',
    category: 'Diversion',
    definition: 'Introducing an irrelevant topic to divert attention away from the original issue.',
    example: 'Person A: "We need to fix the memory leak in the backend server." Person B: "Why talk about memory when our UI color scheme looks outdated?"'
  },
  {
    id: 'moving_goalposts',
    name: 'Moving Goalposts',
    category: 'Shifting Requirements',
    definition: 'Demanding further evidence after initial evidence has been provided, continually raising the standard of proof.',
    example: 'Person A: "Show me 1 peer-reviewed study." Person B gives 1 study. Person A: "Well now show me 10 studies published in the last month."'
  },
  {
    id: 'appeal_to_authority',
    name: 'Appeal to False Authority',
    category: 'Authority',
    definition: 'Using the opinion of an authority figure on an unrelated topic as conclusive evidence.',
    example: 'Person A: "A famous movie celebrity said this health supplement cures aging, so it must be scientifically proven."'
  },
  {
    id: 'bandwagon',
    name: 'Bandwagon Fallacy (Ad Populum)',
    category: 'Popularity',
    definition: 'Arguing that a claim must be true because many or most people believe or practice it.',
    example: 'Person A: "Everyone is trading this meme coin right now, so it has to be a guaranteed investment."'
  },
  {
    id: 'tu_quoque',
    name: 'Tu Quoque (Appeal to Hypocrisy)',
    category: 'Deflection',
    definition: 'Deflecting criticism by pointing out hypocrisy in the opponent rather than refuting their point.',
    example: 'Person A: "You shouldn\'t smoke cigarettes." Person B: "You smoked when you were in college, so your advice is wrong."'
  },
  {
    id: 'appeal_to_ignorance',
    name: 'Appeal to Ignorance',
    category: 'Burden of Proof',
    definition: 'Claiming something is true simply because it has not been proven false, or vice versa.',
    example: 'Person A: "No one has proven aliens don\'t visit Earth every Tuesday, so they definitely do."'
  },
  {
    id: 'equivocation',
    name: 'Equivocation',
    category: 'Ambiguity',
    definition: 'Using a word with multiple meanings in different parts of an argument to deceive or mislead.',
    example: 'Person A: "The sign says fine for parking here, so it must be fine to park my truck here!"'
  },
  {
    id: 'no_true_scotsman',
    name: 'No True Scotsman',
    category: 'Purity Shift',
    definition: 'Modifying the definition of a group in an ad hoc manner to exclude counterexamples that refute a claim.',
    example: 'Person A: "No programmer makes syntax mistakes." Person B: "John is a senior dev and made one." Person A: "Well, no true programmer makes mistakes."'
  },
  {
    id: 'texas_sharpshooter',
    name: 'Texas Sharpshooter',
    category: 'Data Selection',
    definition: 'Cherry-picking cluster data to fit a bias or claim while ignoring the broader statistical noise.',
    example: 'Person A: "This city had 3 successful startups last year, proving it is the startup capital of the world!" (Ignoring 400 failed startups).'
  },
  {
    id: 'middle_ground',
    name: 'Middle Ground Fallacy',
    category: 'Compromise',
    definition: 'Assuming that a compromise between two extreme positions must be the correct truth.',
    example: 'Person A: "2 + 2 = 4." Person B: "2 + 2 = 6." Person C: "The truth must be 5."'
  },
  {
    id: 'genetic_fallacy',
    name: 'Genetic Fallacy',
    category: 'Origin Attack',
    definition: 'Judging a claim as true or false solely based on its origin or history rather than current merit.',
    example: 'Person A: "This theory came from an old radio show, so it cannot have any scientific validity."'
  },
  {
    id: 'appeal_to_tradition',
    name: 'Appeal to Tradition',
    category: 'History',
    definition: 'Arguing that an idea or practice is correct simply because it has always been done that way.',
    example: 'Person A: "We\'ve used paper ledgers for 50 years, so upgrading to digital accounting software is bad."'
  }
];

// Helper function to invoke Gemma API
async function callGemma(promptText) {
  if (!GEMMA_API_KEY) {
    throw new Error('GEMMA_API_KEY is not configured in .env file');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMMA_MODEL}:generateContent?key=${GEMMA_API_KEY}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: promptText }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemma API Error response:', errorText);
    throw new Error(`Gemma API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No candidate response received from Gemma API.');
  }

  const candidate = data.candidates[0];
  const parts = candidate.content?.parts || [];
  
  // Gemma-4 returns parts. Filter out thought parts (part.thought === true)
  const textParts = parts.filter(p => p.text && !p.thought).map(p => p.text).join('\n');
  
  // If no non-thought text part found, fallback to joining all text
  const rawOutput = textParts.trim() || parts.map(p => p.text || '').join('\n').trim();

  // Clean JSON fence if present
  let cleanJson = rawOutput;
  if (cleanJson.includes('```json')) {
    cleanJson = cleanJson.split('```json')[1].split('```')[0].trim();
  } else if (cleanJson.includes('```')) {
    cleanJson = cleanJson.split('```')[1].split('```')[0].trim();
  }

  return JSON.parse(cleanJson);
}

// Endpoint: Get Fallacy Library
app.get('/api/fallacies', (req, res) => {
  res.json({ success: true, fallacies: FALLACY_LIBRARY });
});

// Endpoint: Core Debate Reasoning Analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const { debateText } = req.body;
    if (!debateText || debateText.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a valid debate or conversation transcript to analyze.' });
    }

    const prompt = `You are LogicLens, an expert impartial AI Reasoning Analyst evaluating human debate quality.
Your mission is NOT to determine who is right or wrong on facts or politics, but to analyze HOW arguments are constructed.

Evaluate the following debate transcript:

---
${debateText}
---

Return ONLY a valid, strict JSON object with EXACTLY this structure (do NOT add extra commentary outside JSON):

{
  "summary": "Concise 2-3 sentence overview of what the debate was about and the reasoning styles used.",
  "coach": {
    "overall_score": 78,
    "verdict": "Great logical structure with strong evidence, but contains emotional escalations.",
    "tips": [
      "Avoid dismissive phrases like 'Whatever'",
      "Support broad claims with statistical references"
    ]
  },
  "participants": [
    {
      "name": "Person A (or real speaker name)",
      "logic_score": 6,
      "evidence_score": 4,
      "respect_score": 5,
      "clarity_score": 7,
      "consistency_score": 6,
      "persuasiveness_score": 5,
      "fallacies": [
        {
          "name": "Moving Goalposts",
          "reason": "Shifted from charging infrastructure to battery safety when challenged.",
          "quote": "Whatever. Batteries explode anyway."
        }
      ],
      "strengths": ["Raised safety concerns clearly"],
      "weaknesses": ["Shifted topics abruptly without supporting claims"],
      "improvement": "Frame battery safety concerns as questions backed by research.",
      "badges": ["⚠️ Emotion Driven", "Needs More Sources"]
    },
    {
      "name": "Person B (or real speaker name)",
      "logic_score": 9,
      "evidence_score": 9,
      "respect_score": 8,
      "clarity_score": 9,
      "consistency_score": 9,
      "persuasiveness_score": 9,
      "fallacies": [],
      "strengths": ["Cited empirical statistics comparing fire rates"],
      "weaknesses": ["Could invite open dialogue rather than blunt corrections"],
      "improvement": "Maintain calm tone while encouraging Person A to share source materials.",
      "badges": ["🧠 Rational Thinker", "🔍 Evidence Hunter", "🕊️ Respectful Debater"]
    }
  ],
  "heat_map": [
    {
      "speaker": "Person A",
      "message": "Electric cars are useless because charging stations don't exist.",
      "tone": "Defensive",
      "level": "Yellow"
    },
    {
      "speaker": "Person B",
      "message": "That's false. Thousands of charging stations exist today.",
      "tone": "Calm",
      "level": "Blue"
    }
  ],
  "evidence_meter": [
    {
      "claim": "Thousands of charging stations exist today.",
      "speaker": "Person B",
      "status": "Supported by facts",
      "level": "Green",
      "reason": "Refers to well-documented global charging infrastructure."
    },
    {
      "claim": "Batteries explode anyway.",
      "speaker": "Person A",
      "status": "Assertion without evidence",
      "level": "Yellow",
      "reason": "Generalization lacking quantitative backing."
    }
  ],
  "strongest_argument": {
    "speaker": "Person B",
    "quote": "Statistics show EV fires are actually less common than gasoline vehicle fires.",
    "reason": "Direct statistical comparison addressing safety claims logically."
  },
  "weakest_argument": {
    "speaker": "Person A",
    "quote": "Whatever.",
    "reason": "Dismissive response offering no logical value."
  },
  "constructive_suggestions": [
    {
      "speaker": "Person A",
      "original": "Batteries explode anyway.",
      "suggested": "I'm concerned about battery safety. Are there large-scale studies comparing EV and gasoline vehicle fire rates?"
    }
  ]
}

Available Tone levels for heat_map: "Calm" (Blue), "Curious" (Green), "Defensive" (Yellow), "Aggressive" (Orange), "Hostile" (Red).
Available status for evidence_meter: "Supported by facts" (Green), "Assertion without evidence" (Yellow), "Contradicted by cited data" (Red).
Badge ideas: "🧠 Rational Thinker", "🔍 Evidence Hunter", "🕊️ Respectful Debater", "⚠️ Emotion Driven", "Needs More Sources", "Fallacy Master".

Respond with pure JSON only.`;

    const result = await callGemma(prompt);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error analyzing debate:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze debate transcript' });
  }
});

// Endpoint: Calm & Constructive Rewrite
app.post('/api/rewrite-calm', async (req, res) => {
  try {
    const { debateText } = req.body;
    if (!debateText || debateText.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a valid debate transcript.' });
    }

    const prompt = `You are LogicLens AI. Rewrite the following debate as if both participants were remarkably calm, respectful, intellectually curious, and focused on truth seeking.

Debate:
${debateText}

Return JSON strictly formatted:
{
  "title": "Calm & Constructive Dialogue",
  "rewritten_conversation": [
    {
      "speaker": "Person A",
      "original": "Electric cars are useless...",
      "calm_version": "I have concerns regarding EV practicality, particularly about charging station density in rural areas."
    },
    {
      "speaker": "Person B",
      "original": "That's false...",
      "calm_version": "That's an understandable concern. Current infrastructure data shows over 150,000 public chargers active today, though rural expansion is ongoing."
    }
  ],
  "key_takeaway": "When emotional escalation is removed, both participants discover common ground on infrastructure needs."
}`;

    const result = await callGemma(prompt);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error in calm rewrite:', err);
    res.status(500).json({ error: err.message || 'Failed to perform calm rewrite' });
  }
});

// Endpoint: Persona / Historical Mode Analysis
app.post('/api/persona-mode', async (req, res) => {
  try {
    const { debateText, persona } = req.body;
    if (!debateText || !persona) {
      return res.status(400).json({ error: 'Please provide both debate text and persona name.' });
    }

    const prompt = `You are LogicLens AI featuring Historical / Persona Mode.
Re-evaluate this debate and provide commentary in the exact voice, wisdom, and analytical style of: ${persona} (e.g. Aristotle, Socrates, Sherlock Holmes, Iron Man / Tony Stark, Elon Musk, A Senior Trial Lawyer, A Data Scientist).

Debate:
${debateText}

Return JSON strictly formatted:
{
  "persona": "${persona}",
  "persona_verdict": "A 3-4 sentence commentary written in character evaluating the logical vigor of the debate.",
  "key_critiques": [
    "Critique 1 in character style",
    "Critique 2 in character style"
  ],
  "persona_rewritten_dialogue": [
    {
      "speaker": "Person A",
      "reinterpreted": "How ${persona} would phrase Person A's underlying dilemma"
    },
    {
      "speaker": "Person B",
      "reinterpreted": "How ${persona} would phrase Person B's logical response"
    }
  ]
}`;

    const result = await callGemma(prompt);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error in persona mode:', err);
    res.status(500).json({ error: err.message || 'Failed to execute persona analysis' });
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🧠 LogicLens AI Backend Server running on port ${PORT}`);
  console.log(`🤖 Powered by Gemma Model: ${GEMMA_MODEL}`);
  console.log(`====================================================`);
});
