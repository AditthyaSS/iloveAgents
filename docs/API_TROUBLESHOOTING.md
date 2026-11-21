
# API Provider Error Troubleshooting Guide

This guide explains common errors returned when iloveAgents connects to OpenAI, Anthropic, Google Gemini, or OpenRouter.

Provider dashboards can help you check API key status, model access, billing, and usage limits.

## Common HTTP Errors

| Error | What It Usually Means | What to Try |
|---|---|---|
| **401 Unauthorized** | The API key is missing, invalid, expired, or incorrectly copied. | Re-enter the API key from the provider dashboard. Check the selected provider and remove extra spaces. |
| **403 Forbidden** | The account or API key does not have permission to access the requested resource. | Check key permissions, account status, region restrictions, and model access. |
| **429 Too Many Requests** | The request rate limit or available quota has been exceeded. | Wait and retry with backoff. Check billing, credits, and usage limits. |
| **500 Internal Server Error** | The provider encountered an unexpected server error. | Check the provider status page and retry after a few minutes. |
| **503 Service Unavailable** | The provider or selected model is temporarily unavailable. | Wait and retry or select another available model. |

Error messages vary between providers. Model access or invalid model errors may also appear as HTTP 400 or 404.

## Invalid or Expired API Keys

1. Confirm that you selected the correct provider.
2. Generate or copy a valid API key from the official provider dashboard.
3. Check that the key is active and has the required permissions.
4. Verify account billing and available quota.
5. If the key may have been exposed, revoke it and generate a replacement.

For standard interactive runs, enter your API key directly in the application.

**Security reminder:** Never share API keys in issues, screenshots, chat messages, source files, or public repositories. Clear your key when using a shared device.

## Provider-Specific Checks

### OpenAI

- Check your API key: https://platform.openai.com/api-keys
- Review usage: https://platform.openai.com/usage
- Check project limits: https://platform.openai.com/settings/organization/limits
- Check service status: https://status.openai.com/

### Anthropic

- Check your API key and workspace: https://console.anthropic.com/
- Verify API access and billing.
- Confirm that your selected model is available.

### Google Gemini

- Check your API key: https://aistudio.google.com/apikey
- Verify that the Gemini API is enabled.
- Check available quota and model access.

### OpenRouter

- Visit: https://openrouter.ai/
- Check your API key and account balance.
- Verify that the selected model is available.

## Network Failures and Timeouts

- Check your internet connection.
- Verify that the provider API is accessible.
- Retry the request after a short delay.
- Try another supported model if the issue continues.

## Still Having Problems?

If the issue persists:

1. Note the error message and HTTP status code.
2. Check the provider's status page.
3. Verify your API key and account limits.
4. Open an issue in the iloveAgents repository with the error details.

**Important:** Remove API keys and other sensitive information before sharing error logs.


If a request hangs or reports a network error:

- Check that your internet connection is working, then retry the request.
- Check the provider's status page for an outage or degraded service.
- Temporarily disable browser extensions that block requests, such as privacy or
  script-blocking extensions, and retry.
- Try a shorter prompt or a different model if the request repeatedly times out.
- If you are on a managed network, ask whether it blocks requests to the provider.

If the problem persists, note the provider, model, approximate time, and exact error
message when asking for help. Remove API keys and other private information first.
