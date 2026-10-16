export interface AiCardDraft {
  topic: string;
  question: string;
  answer: string;
  explanation: string;
  example: string;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function firstText(value: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const result = text(value[key]);
    if (result) return result;
  }
  return "";
}

function parseJson(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      "O conteúdo não é um JSON válido. Remova textos fora do JSON e tente novamente.",
    );
  }
}

export function parseAiCards(raw: string): AiCardDraft[] {
  const payload = parseJson(raw);
  const root = Array.isArray(payload)
    ? {}
    : (payload as Record<string, unknown>);
  const values = Array.isArray(payload)
    ? payload
    : Array.isArray(root.cards)
      ? root.cards
      : Array.isArray(root.flashcards)
        ? root.flashcards
        : null;
  if (!values)
    throw new Error(
      "Não encontrei uma lista de cards. Use um array ou o campo cards.",
    );
  if (!values.length) throw new Error("A lista de cards está vazia.");
  if (values.length > 100)
    throw new Error("Importe no máximo 100 cards por vez.");

  const defaultTopic =
    firstText(root, ["topic", "tópico", "topico"]) || "Importados por IA";
  return values.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item))
      throw new Error(`O card ${index + 1} não é um objeto válido.`);
    const value = item as Record<string, unknown>;
    const card: AiCardDraft = {
      topic: firstText(value, ["topic", "tópico", "topico"]) || defaultTopic,
      question: firstText(value, ["question", "pergunta"]),
      answer: firstText(value, ["answer", "resposta"]),
      explanation: firstText(value, [
        "explanation",
        "explicação",
        "explicacao",
      ]),
      example: firstText(value, ["example", "exemplo"]),
    };
    if (!card.question)
      throw new Error(`O card ${index + 1} está sem pergunta.`);
    if (!card.answer) throw new Error(`O card ${index + 1} está sem resposta.`);
    return card;
  });
}
