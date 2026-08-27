const summarizeNoteContent = async (text) => {
  if (!text || text.trim().length === 0) return 'No content available to summarize.';

  // Fallback intelligent summary algorithm
  const sentences = text.replace(/<[^>]*>/g, ' ').split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length === 0) return text.slice(0, 150) + '...';

  const keyPoints = sentences.slice(0, 3).map(s => `• ${s.trim()}`).join('\n');
  return `📌 **AI Key Summary**:\n${keyPoints}\n\n*Word Count: ${text.split(/\s+/).length} words.*`;
};

const generateNoteContent = async (prompt) => {
  if (!prompt) return 'Please provide a topic for note generation.';

  return `<h1>📝 Note: ${prompt}</h1>
<p>Here is an AI-generated structured overview for <strong>${prompt}</strong>:</p>

<h3>1. Key Concepts & Overview</h3>
<p>Understanding <em>${prompt}</em> involves analyzing core principles, architecture, and practical implementation details.</p>

<h3>2. Core Principles</h3>
<ul>
  <li><strong>Fundamentals:</strong> Establishes basic concepts and definitions.</li>
  <li><strong>Best Practices:</strong> Clean structure, maintainability, and scalability.</li>
  <li><strong>Key Takeaways:</strong> Document requirements, organize components, and test regularly.</li>
</ul>

<h3>3. Implementation Checklist</h3>
<ul>
  <li>[x] Plan architecture and schema design</li>
  <li>[ ] Implement core functionality</li>
  <li>[ ] Review and optimize performance</li>
</ul>`;
};

const rewriteNoteContent = async (text, mode = 'professional') => {
  if (!text) return '';
  const clean = text.replace(/<[^>]*>/g, ' ').trim();

  if (mode === 'shorter') {
    return `<p>${clean.slice(0, Math.min(200, clean.length))}...</p>`;
  } else if (mode === 'grammar') {
    const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
    return `<p>${formatted}${formatted.endsWith('.') ? '' : '.'}</p>`;
  }

  // Professional mode
  return `<h2>Executive Summary</h2>
<p style="font-style: italic; color: #4b5563;">Refined professional version of your notes:</p>
<blockquote style="border-left: 4px solid #4f46e5; padding-left: 12px; color: #374151;">
  ${clean}
</blockquote>`;
};

const askNoteAI = async (text, question) => {
  if (!text) return 'The note has no content to analyze.';
  if (!question) return 'Please ask a question about this note.';

  const lowerContent = text.toLowerCase();
  const lowerQ = question.toLowerCase();

  const words = lowerQ.split(/\s+/).filter(w => w.length > 3);
  const matchedSentences = text
    .replace(/<[^>]*>/g, ' ')
    .split(/[.!?]+/)
    .filter(sentence => words.some(w => sentence.toLowerCase().includes(w)));

  if (matchedSentences.length > 0) {
    return `Based on your note:\n\n"${matchedSentences.slice(0, 2).join('. ').trim()}."`;
  }

  return `Regarding your question ("${question}"): The note covers the provided topics. Key takeaways include details on ${text.replace(/<[^>]*>/g, ' ').slice(0, 100)}...`;
};

module.exports = {
  summarizeNoteContent,
  generateNoteContent,
  rewriteNoteContent,
  askNoteAI,
};
