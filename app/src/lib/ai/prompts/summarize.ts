export function buildSummarizePrompt(content: string) {
  return `You are a helpful assistant. Summarize the following note concisely in 2-4 sentences.
Focus on the key ideas. Use plain language.

Note content:
${content}

Summary:`
}
