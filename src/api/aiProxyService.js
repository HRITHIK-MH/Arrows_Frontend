import API from "./axiosConfig";

/**
 * Backend proxy for Azure OpenAI chat completions.
 *
 * The Azure OpenAI key MUST stay server-side — it is no longer read from the
 * client bundle. The backend owns the endpoint/deployment/api-version/key and
 * forwards the request to Azure.
 *
 * Required backend contract:
 *   POST /api/ai/chat/completions
 *   body: { messages, temperature, max_tokens, response_format? }
 *   returns: the Azure chat-completions JSON verbatim
 *            ({ choices: [{ message: { content } }] }, or an error status/body).
 *
 * Auth: routed through the shared axios instance, so the Bearer token is
 * attached automatically and the request flows through the /api proxy.
 */
const AI_CHAT_ENDPOINT = "/ai/chat/completions";

const extractContent = (data) =>
  data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";

/**
 * @param {Object} params
 * @param {Array<{role: string, content: string}>} params.messages
 * @param {number} [params.temperature=0]
 * @param {number} [params.maxTokens]
 * @param {boolean} [params.jsonMode=false] - request response_format json_object
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<string>} assistant message content
 */
export const requestChatCompletion = async ({
  messages,
  temperature = 0,
  maxTokens,
  jsonMode = false,
  signal,
} = {}) => {
  const payload = {
    messages,
    temperature,
    ...(maxTokens ? { max_tokens: maxTokens } : {}),
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
  };

  try {
    const response = await API.post(AI_CHAT_ENDPOINT, payload, { signal });
    return extractContent(response.data);
  } catch (error) {
    const errorBody = JSON.stringify(error?.response?.data ?? "");

    // Preserve prior behavior: some deployments reject JSON mode — retry once
    // without response_format before surfacing the error.
    if (jsonMode && /response_format|json_object/i.test(errorBody)) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.response_format;
      const response = await API.post(AI_CHAT_ENDPOINT, fallbackPayload, {
        signal,
      });
      return extractContent(response.data);
    }

    const status = error?.response?.status ?? "";
    throw new Error(
      `AI chat completion failed: ${status} ${errorBody || error.message}`,
    );
  }
};
