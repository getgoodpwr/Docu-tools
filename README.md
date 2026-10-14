# GoodPWR HR Hub

Free, browser-based HR tools for the GoodPWR team. No database, no logins, no uploads: every file is processed on the user's own computer.

## Tools
| Tool | File | Replaces |
|---|---|---|
| PDF Editor | tools/pdf-editor.html | Adobe Acrobat Pro |
| Fillable Form Builder | tools/form-builder.html | Acrobat Pro, Jotform |
| Sign a PDF | tools/sign-pdf.html | DocuSign / Adobe Sign (self-signing) |
| Compare PDFs | tools/pdf-compare.html | Acrobat Compare, Draftable |
| OCR / Searchable Scans | tools/ocr.html | Acrobat Pro, ABBYY |
| Bates Numbering | tools/bates-numbering.html | Acrobat Pro |
| Mail Merge to PDF | tools/mail-merge.html | Formstack, Word add-ons |
| Certificate Designer | tools/certificate-designer.html | Canva Pro |
| Announcement Graphics | tools/social-graphics.html | Canva Pro |
| Background Remover | tools/background-remover.html | remove.bg |
| Email Signature Builder | tools/email-signature.html | WiseStamp, Exclaimer |
| Time Zone Planner | tools/time-zones.html | World Time Buddy Pro |
| QR & Barcode Labels | tools/label-maker.html | Avery Design Pro |

## Put it online (GitHub Pages)
1. Create a repository, e.g. `hr-hub`.
2. Upload everything in this folder, keeping the `assets` and `tools` folders.
3. Add the GoodPWR logo as `assets/logo.png` (optional; the name "GoodPWR" shows if it's missing).
4. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
5. The hub is live at `https://<username>.github.io/hr-hub/`.

## Adding a tool later
Copy any file in `tools/`, change it, and add a card for it in the `TOOLS` list near the bottom of `index.html`.

## Changing the brand color
Edit `--accent` at the top of `assets/hub.css`.
