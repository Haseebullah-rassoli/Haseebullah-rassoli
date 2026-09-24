# Opportunity Publisher — Owner guide

This publishing system is installed in the existing GitHub Pages repository. It uses GitHub Actions as the owner-only publishing form. No coding, paid CMS, database, Google Sheets, or public password page is needed for each new opportunity.

## Publish an opportunity
1. Sign into the GitHub account with write access to this repository.
2. Open **Actions → Publish opportunity → Run workflow**. On mobile, GitHub's Desktop site or a laptop may be easier.
3. Fill title, category, summary, details, official source URL, official application URL, deadline (YYYY-MM-DD, optional), funding, and status.
4. Choose **Draft** to save without showing a public page, or **Open** to publish. Press the green **Run workflow** button.
5. Wait for the workflow to succeed and GitHub Pages to deploy the commit. Visit `opportunities.html` and open the listing.
6. Copy the listing URL into LinkedIn; readers visit your summary and then choose the official application link.

## Edit, close, or draft
Use the same form with **listing_id** set to the existing filename without `.html` (e.g. `gks-undergraduate-2027`). Set status to Closed to retain the informational page but remove its application button. Set Draft to remove the public detail page and hide the listing from the browse page. Never delete a published slug manually if it has already been shared.

## Editorial and security
Only publish after checking the original source, relevant eligibility, funding and deadline. Use HTTPS official links. Summarize in your own words; don't copy entire notices. Do not claim a listing is verified merely because it was published. The date checked is automatically recorded from the workflow run. The details field supports plain text and line breaks, not HTML. Do not enter API tokens or personal applicant information.

## Technical notes
The form uses GitHub's authenticated workflow_dispatch UI. The script validates input, writes `opportunities-data.json`, and generates `opportunity/<slug>.html`. The public browse page loads the JSON with safe text rendering. There are at most ten GitHub Actions form fields, so include eligibility and requirements in Details. Draft is the default to prevent accidental publication. The workflow needs repository Actions enabled and permission to write repository contents. If a workflow run fails, inspect its logs before retrying. GitHub Pages must publish from the main branch as configured for this existing website. If GitHub Actions is disabled by repository or account settings, enable it in repository Settings → Actions; if the token lacks write access, enable workflow read/write permissions in Settings → Actions → General. No external CMS account is required.

This system does not automatically research or fact-check announcements, and the owner must verify each source before choosing Open.
