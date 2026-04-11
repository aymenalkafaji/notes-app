export function buildQuizPrompt(content: string) {
  return `Generate 5 study flashcards from the following note content.
Return ONLY valid JSON matching this exact shape — no markdown, no extra text:
{
  "cards": [
    { "question": "string", "answer": "string", "type": "recall" }
  ]
}

Note content:
${content}`
}
