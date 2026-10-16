import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAiCards } from "./ai-card-import";

test("parseAiCards aceita português, inglês e bloco markdown", () => {
  const cards = parseAiCards(
    `\`\`\`json\n{"cards":[{"pergunta":"O que é uma Promise?","resposta":"Uma operação futura.","topico":"JavaScript"}]}\n\`\`\``,
  );
  assert.deepEqual(cards, [
    {
      topic: "JavaScript",
      question: "O que é uma Promise?",
      answer: "Uma operação futura.",
      explanation: "",
      example: "",
    },
  ]);
});

test("parseAiCards rejeita cards incompletos com mensagem acionável", () => {
  assert.throws(
    () => parseAiCards('{"cards":[{"question":"Sem resposta"}]}'),
    /card 1 está sem resposta/,
  );
});
