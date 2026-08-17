AHENQOR TECHNOLOGIES — FINAL CLOUDFLARE PAGES BUILD
===================================================

This package removes the mailto form submission flow.

FINAL STRUCTURE
/
  index.html
  merchandiser-ai.html
  hotel-control-tower.html
  ahenqor-home.html
  _worker.js
  retailrecon-ai/
    index.html

WHAT CHANGED
- RetailRecon AI, Merchandiser AI and Hotel Control Tower submit to POST /api/lead.
- Inline sending, success and error states.
- Existing browser validation is preserved.
- Honeypot anti-spam field added.
- No visitor email client is opened.
- All other page content/design remains based on the green AHENQOR build.

CLOUDFLARE SETUP REQUIRED ONCE
1. Deploy this folder with Cloudflare Pages.
2. In Cloudflare, enable Email Routing for your AHENQOR domain.
3. Create a "Send Email" Worker binding with binding name:
      SEND_EMAIL
   Restrict the destination to:
      hello@ahenqor.com
   (or your actual lead inbox)
4. Add these Worker/Pages environment variables:
      LEAD_TO=hello@ahenqor.com
      LEAD_FROM=website@ahenqor.com
5. Ensure the LEAD_FROM address/domain is allowed by your Cloudflare Email Routing setup.
6. Redeploy once after adding the binding/variables.

IMPORTANT
- _worker.js requires Cloudflare Pages/Workers. GitHub Pages alone cannot execute it.
- If your public site is still served only from GitHub Pages, deploy the same files to
  Cloudflare Pages or use a separately deployed Worker URL and change fetch('/api/lead')
  to that Worker URL.
- Test each form after deployment.

TEST
Submit one test lead from:
- RetailRecon AI
- Merchandiser AI
- Hotel Control Tower

Confirm the browser shows the green success message and the lead arrives in the configured inbox.
