# Security

## How iloveAgents Keeps Your API Key Safe

iloveAgents works on a simple principle — your API key never leaves your browser.

Here is exactly what happens:
- You paste your API key into the app
- The app sends your request directly to OpenAI, Anthropic, or Google — no middleman
- Your key is never saved anywhere — not in a database, not in cookies, not in localStorage
- There is no backend server that could ever see your key
- There is no analytics or tracking of any kind

If you want to verify this yourself, the two files that handle your key are:
- `src/lib/llmAdapter.js`
- `src/lib/useApiKey.js`

Both are short and easy to read.

## Note for Contributors

If you are contributing code, please do not add anything that:
- Sends data to a third-party service
- Logs or stores the API key anywhere
- Adds analytics or tracking scripts

Any PR that does this will be closed, even if it was not intentional.

## Key Rotation

If a key was pasted into a file by mistake:
1. Revoke it in the provider dashboard first.
2. Generate a new key and put it in your local `.env` file.
3. Clear sessionStorage in the browser so the old key is gone.
4. Run `git status` and confirm `.env` does not show up before committing.

## Found a Problem?

If you find something that looks like a security issue, please **do not open a public GitHub issue**.

Instead, email me directly at **aditthyassdeepa@gmail.com**.

Tell me what you found and how to reproduce it. I will get back to you within 48 hours.
