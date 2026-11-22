# API Provider Troubleshooting Guide

This guide explains common errors you may encounter when running AI agents in iloveAgents and provides steps to resolve them.

## 1. Quick Error Reference

| Error | Meaning | Recommended Action |
| --- | --- | --- |
| 400 Bad Request | The provider rejected the request format or parameters. | Check the selected model, inputs, and request configuration. |
| 401 Unauthorized | Authentication failed. | Verify that your API key is valid and belongs to the selected provider. |
| 403 Forbidden | The request is not permitted. | Check account permissions, model access, and provider restrictions. |
| 404 Not Found | The requested model or endpoint could not be found. | Confirm the model identifier and provider endpoint. |
| 408 Request Timeout | The request did not complete within the allowed time. | Retry after checking your connection and request size. |
| 429 Too Many Requests | A provider rate limit or usage quota was reached. | Wait before retrying and review your provider's limits. |
| 500 Internal Server Error | The provider encountered an internal error. | Retry later and check the provider's status page. |
| 502 Bad Gateway | An upstream service returned an invalid response. | Retry later if the problem persists. |
| 503 Service Unavailable | The provider is temporarily unavailable. | Check the provider's status page and try again later. |
| 504 Gateway Timeout | An upstream service did not respond in time. | Retry later or reduce the request size. |

Note: Exact error messages and status codes vary between providers.

## 2. API Key Authentication Errors

### Symptoms

- The agent displays an authentication error.
- The provider returns HTTP 401 or 403.
- Requests fail immediately after execution starts.

### Troubleshooting Steps

1. Confirm that you selected the intended AI provider.
2. Verify that the API key belongs to that provider.
3. Check for accidental spaces or missing characters.
4. Confirm that the key is active and has not expired or been revoked.
5. Verify that your account has access to the requested model.
6. Reconfigure the key through the application's supported settings.
7. Retry the agent.

### Security Reminder

Never paste API keys into GitHub issues, pull requests, screenshots, or public discussions.

If a key is accidentally exposed, revoke or rotate it immediately using your provider's dashboard.

## 3. Rate Limits and Usage Quotas

### Symptoms

- The provider returns HTTP 429.
- Requests fail after several successful executions.
- The provider reports insufficient quota or exhausted credits.

### Troubleshooting Steps

1. Check your provider's usage dashboard.
2. Confirm that your account has sufficient credits or quota.
3. Review request-per-minute and token-per-minute limits.
4. Wait before retrying when the error indicates a temporary rate limit.
5. Reduce unnecessary repeated requests.
6. Use exponential backoff when implementing automated retries.

Important: A rate-limit error and an exhausted billing quota may both produce HTTP 429. Adding a delay will not resolve an exhausted quota.

## 4. Invalid Model or Endpoint

### Symptoms

- HTTP 400 or 404 is returned.
- The provider reports that the model does not exist.
- The selected model is unavailable to your account.

### Troubleshooting Steps

1. Verify the model identifier.
2. Check whether the model is supported by the selected provider.
3. Confirm that your account has access to the model.
4. Check the provider's documentation for renamed or retired models.
5. Try another supported model when appropriate.

## 5. Network Errors and Timeouts

### Symptoms

- Failed to fetch
- Network request failed
- Request timed out
- Connection interrupted

### Troubleshooting Steps

1. Confirm that your internet connection is working.
2. Check whether the provider's service is experiencing an outage.
3. Retry after a short delay.
4. Try a smaller input if the request is unusually large.
5. Check whether a firewall, proxy, VPN, or browser extension is interfering with the request.
6. If the issue continues, inspect the browser developer console for non-sensitive diagnostic information.

Do not share authorization headers, API keys, or sensitive request payloads when reporting errors.

## 6. Provider-Specific Checks

### OpenAI

- Verify your API key and project permissions.
- Check model availability and usage limits.
- Review the official documentation: https://platform.openai.com/docs
- Check service status: https://status.openai.com/

### Anthropic

- Confirm that the API key is valid.
- Check model access, account credits, and usage limits.
- Review the official documentation: https://docs.anthropic.com/
- Check service status: https://status.anthropic.com/

### Google Gemini

- Confirm that the API key is configured for the Gemini API.
- Verify model availability and applicable quotas.
- Review the official documentation: https://ai.google.dev/gemini-api/docs
- Check service status: https://status.cloud.google.com/

### OpenRouter

- Confirm that your OpenRouter API key is valid.
- Check available credits, model routing, and provider availability.
- Review the official documentation: https://openrouter.ai/docs
- Check service status: https://status.openrouter.ai/

## 7. Safe Troubleshooting Checklist

Before reporting a problem, verify the following:

- [ ] The correct AI provider is selected.
- [ ] The API key is configured and active.
- [ ] The selected model is supported and accessible.
- [ ] The provider account has sufficient quota or credits.
- [ ] The internet connection is working.
- [ ] The provider is not experiencing an outage.
- [ ] The request has been retried when safe and appropriate.
- [ ] No sensitive credentials are included in the error report.

## 8. Reporting an Unresolved Problem

If the issue persists, open a GitHub issue with:

- The selected provider and model name
- The HTTP status code, if available
- A short description of the problem
- Steps to reproduce the error
- Expected behavior
- Actual behavior
- Browser and operating system
- A screenshot with sensitive information removed, if helpful

Report issues here:

https://github.com/AditthyaSS/iloveAgents/issues

**Never include API keys, access tokens, passwords, or private user data in an issue.**

---

This guide provides general troubleshooting advice. Provider behavior, API limits, model availability, and error messages may change over time.

For the latest provider-specific information, refer to the official documentation linked above.
