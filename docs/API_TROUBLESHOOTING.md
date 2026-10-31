# API Provider Error Troubleshooting Guide

This guide explains common errors returned while iloveAgents contacts OpenAI,
Anthropic, Google Gemini, or OpenRouter. Provider dashboards can show whether a key
is active, whether an account can use a model, and whether billing or usage limits
are blocking requests.

## Common HTTP errors

| Error | What it usually means | What to try |
| --- | --- | --- |
| **401 Unauthorized** | The API key is missing, invalid, expired, or copied incorrectly. | Re-enter the key from the provider dashboard. Check that it belongs to the selected provider, has no extra spaces, and has not been revoked. |
| **403 Forbidden** | The account or key is not allowed to use the requested resource. | Check the key's permissions, account status, region restrictions, and access to the selected model in the provider dashboard. |
| **429 Too Many Requests** | The account has reached a request or token rate limit, or has insufficient quota. | Wait briefly and retry. Check the provider's rate limits, usage, billing, and quota. Reduce parallel requests if several agents are running at once. |
| **500 Internal Server Error** | The provider encountered an unexpected server error. | Check the provider's status page, wait a few minutes, and retry. If it continues, try another available model. |
| **503 Service Unavailable** | The provider or selected model is temporarily unavailable or overloaded. | Check the provider's status page, wait, then retry or select another model. |

Error messages can vary by provider. A model name or access error may also appear as
a 400 or 404 response instead of one of the statuses above.

## Invalid or expired API keys

1. Confirm that you selected the same provider that issued the key.
2. Copy a fresh key from the provider's official dashboard and paste it again.
3. Check that the key is active and has the permissions required for API requests.
4. Confirm that the provider account is active and has available quota or billing.
5. If the key may have been exposed, revoke it in the provider dashboard and create
   a replacement.

For standard interactive runs, enter the key in the app when prompted. Do not paste
API keys into issues, screenshots, chat messages, source files, or public repositories.
On shared devices, clear the key from the app when you finish.

## Provider-specific checks

### OpenAI

- Check the API key and project at [OpenAI API keys](https://platform.openai.com/api-keys).
- Confirm the project has billing and quota available, and that the selected model
  is available to it.
- Review usage limits and current incidents in the OpenAI platform.

### Anthropic

- Check the key and workspace in the [Anthropic Console](https://console.anthropic.com/).
- Confirm the account has API access and available usage or billing.
- Verify that the selected model is available to the workspace.

### Google Gemini

- Check the key and project in [Google AI Studio](https://aistudio.google.com/apikey).
- Confirm that the Gemini API is enabled for the project and that the account's
  quota is available.
- Verify that the selected model is supported by the project.

### OpenRouter

- Check the key and account balance at [OpenRouter](https://openrouter.ai/).
- Confirm that the selected model is available through OpenRouter and that your
  account can use it.

## Network failures and timeouts

If a request hangs or reports a network error:

- Check that your internet connection is working, then retry the request.
- Check the provider's status page for an outage or degraded service.
- Temporarily disable browser extensions that block requests, such as privacy or
  script-blocking extensions, and retry.
- Try a shorter prompt or a different model if the request repeatedly times out.
- If you are on a managed network, ask whether it blocks requests to the provider.

If the problem persists, note the provider, model, approximate time, and exact error
message when asking for help. Remove API keys and other private information first.
