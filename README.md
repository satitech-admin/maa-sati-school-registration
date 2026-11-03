# Maa Sati Technologies — School Session Registration

[Open live registration](https://satitech-admin.github.io/maa-sati-school-registration/)

One-week AI & Coding session for Classes 9–12. Fee: ₹199 per student.

## Current implementation
- GitHub Pages serves the branded HTML page and original uncropped logo.
- A published Google Form is embedded in the page, with a direct-link fallback.
- Required fields: responder email, student name, class, school, city, guardian mobile and guardian permission.
- Mobile validation: 10 digits, starting with 6–9.
- Google Forms response receipts are configured to **Always**.
- Responses are linked to the owner's private spreadsheet named **Maa Sati — One Week Registrations**.
- Download the spreadsheet with File → Download → Microsoft Excel (.xlsx).
- Results summary is disabled; student response data is not published in this repository.

## Email and access
Email receipts come from Google Forms. They are copies of the submitted registration, not custom emails sent by Apps Script. Correct email spelling and inbox/spam delivery remain important. Google may show a CAPTCHA for abuse protection.

No unverified Apps Script authorization is needed. The old Code.gs file is historical source only and is not used by the live page. The static page does not read private spreadsheet data and contains no email credentials.

## Validation
Live form and original logo render; required questions and invalid-phone rejection checked. A synthetic end-to-end submission reached Google's CAPTCHA, so final saved-row and email-delivery verification await that human check. No successful submission or delivered email is claimed yet.
