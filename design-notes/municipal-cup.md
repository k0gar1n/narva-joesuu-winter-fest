# Winter Cup: municipality participant page

Purpose: a municipality receiving an invitation should be able to assess participation, assign a coordinator, plan a budget and prepare its team without searching through other Cup categories.

Page order: invitation and date → short facts → team eligibility and representation → provisional disciplines → outline of the day → fees and registration → travel, food and access → sauna → rules and documents → saved coordinator checklist → organiser contact.

Confirmed: Friday 22 January 2027, Narva-Jõesuu; category for cities and municipalities; team food included; registration through Fienta. Six sports are candidate disciplines from the existing concept, explicitly provisional. No team size, eligibility threshold, fixed schedule, price, cancellation policy, final scoring or sauna inclusion is asserted.

## References examined
- https://joud.ee/et/voistlused/coop-eesti-omavalitsuste-41.-talimangud/97 — municipal representation, overall ranking, sports, locations and contacts.
- https://www.firmasport.ee/talispartakiaad/ — dedicated sport rules, registration steps, prices, accommodation and food logistics.
- https://joud.ee/bw_client_files/joud/public/img/File/2026_EOV_talimangud/2026_EOV_talimangude_vorkpalli_juhend_Rakvere_VK.pdf — example of a separately published discipline rulebook. No rules or prices copied into Winter Fest.

## Maintain / publish
- `content/municipal-cup.json`: candidate disciplines, prices, team size and future PDF links. Empty values mean unconfirmed, not zero/free. `registrationDeadline`, `rulesVersion`, `rulesUpdated` are reserved fields; connect their display when approved.
- `tools/render-municipal-cup.py`: RU/ET/EN copy and page renderer. Run from any directory with Python 3, then `node tools/build-vercel.mjs`. It preserves existing header/footer.
- `docs/config.js`: supply the real Fienta event URL in `registration.municipalities`. Until provided, it follows the existing site convention and opens the Fienta home page for the selected language. This is not a functioning event-specific registration link yet.
- `docs/municipal.css` and `docs/municipal.js`: scoped styles, sport filters, details, anchor navigation, local checklist, sharing and print support.
- Rules are readable HTML first; approved PDFs supplement them. Each approved rulebook should carry its version and publication date and replace the current preparation status. Avoid showing an active download before a file exists.

## Information to obtain before invitation launch
Team size and substitutes; participant connection to the municipality; age/mixed-team criteria; number of teams per municipality; price unit, taxes and payment/invoice arrangements; registration deadline and Fienta link; schedule and entrance/drop-off map; final sports and scoring/appeal rules; safety/weather/cancellation conditions; meal portions/menu/dietary process; sauna inclusion and booking; team flags/introductions; accessibility and on-site contact.

Checklist stores only checked item IDs in this browser, shared across site languages. No forms, personal data collection or invented participant lists were added. Print opens all details and temporarily includes filtered-out sports, restoring the screen afterward.

## Approved conditions — 22 September 2026

Canonical general rules: `content/municipal-rules/{ru,et,en}.md`. These supersede earlier provisional eligibility, fees and inclusion notes above. Five adults per team; municipal staff, subordinate/owned institutions and council members only. Registration by 17 January; roster by 19 January. Prices €90/120/150 by application date. Two meals, equipment and sauna included. Confirmed scoring, ties, appeals and refund conditions are in the rules.

Generate participant pages with `python3 tools/render-municipal-cup.py`, then generate HTML rules and three-page PDFs with `python3 tools/render-municipal-rules.py` (ReportLab required). Static Manrope font instances are bundled in `tools/fonts/`. Finally run `node tools/build-vercel.mjs`.

Discipline regulations and exact individual timetables remain pending. The actual Fienta event URL must still be supplied in `docs/site-config.js` (registration.municipalities); preserve the existing fallback until then.

## Discipline cards and individual regulations

Compact cards link to `/winter-cup/municipalities/disciplines/{id}/` in each language. Five desktop columns, six on wide screens; two on mobile. No filters or card descriptions.

For each discipline, populate `rulesSections[lang]` with `{heading, paragraphs: [...]}` objects and `rulesPdf[lang]` with the actual PDF URL in `content/municipal-cup.json`. Until published, the individual page shows a pending message and has no inactive download button. Run `python3 tools/render-discipline-rules.py` after the municipality and general rules renderers.

Flipper-run illustration: `docs/assets/flipper-run-ribbon.png`, generated from winter-fest-ribbon style-master.png and 01-skier.png. Prompt: isolated natural runner wearing two broad swimming fins; cobalt folded ribbons, navy reverse planes and pale fold seams; no skis, poles, text or shadows; transparent PNG. Native output 1199 × 1312, alpha verified. Original remains in Codex generated_images (exec-6bb04fbb-8958-4601-b6a2-80f68498aab7.png).
