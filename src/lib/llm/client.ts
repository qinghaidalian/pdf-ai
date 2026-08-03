const DEEPSEEK_BASE = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: string };
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: options.temperature ?? 0.1,
      max_tokens: options.max_tokens ?? 4096,
      response_format: options.response_format,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error: ${res.status} ${err}`);
  }

  const json = await res.json();
  return json.choices[0].message.content;
}

export async function chatWithJSON<T>(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<T> {
  const raw = await chat(messages, {
    ...options,
    response_format: { type: "json_object" },
  });
  return JSON.parse(raw) as T;
}
