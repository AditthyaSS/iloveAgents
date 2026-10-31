# API Provider Error Troubleshooting Guide

This guide provides practical steps and explanations for resolving common API provider errors encountered when working with `iloveAgents`.

## Common HTTP Error Codes

### HTTP 401: Unauthorized
* **Cause**: Invalid, missing, or expired API key.
* **Resolution**: Verify that your API key is correctly copied into your environment configuration without extra spaces or quotes. Check provider dashboard to ensure key hasn't expired or been revoked.

### HTTP 403: Forbidden
* **Cause**: Lack of permission or scope access for the requested model/resource.
* **Resolution**: Ensure your account tier has access to the requested model endpoint (e.g., specific Anthropic or OpenAI models).

### HTTP 429: Too Many Requests (Rate Limit Exceeded)
* **Cause**: Exceeded tier limits for requests per minute (RPM) or tokens per minute (TPM).
* **Resolution**: Implement retry logic with exponential backoff. Check usage limits and billing quotas on your provider account.

### HTTP 500 & 503: Internal Server Error / Service Unavailable
* **Cause**: Upstream provider outage or temporary infrastructure instability.
* **Resolution**: Check the provider's official status page. Retry request after a brief delay.

## Network & Timeout Troubleshooting
* Check network stability and proxy/firewall rules blocking outbound HTTPS calls.
* Increase client request timeout settings for long streaming completions.

## Safe API Key Handling
* Never commit real API keys or credentials to public repositories.
* Store API keys safely in `.env` files added to `.gitignore`.
