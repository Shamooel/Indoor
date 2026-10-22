# Stage 1 role-based UX and themes

Implemented on 2026-10-22. This extends the existing uncommitted Stage 1 work; no backend, dependencies, commits or pushes were added.

## Preserved foundation

Shared demo account/community/competition state, immediate account activation, editable player records, guided booking with own-team creation and existing opponents, local requests, public profiles, 3D cards, fixtures, statistics and animations were already implemented. These remain the underlying systems.

The approved `pages/Home.jsx` is unchanged from the start of this request (SHA256 `362334B43C1CEBDAE48224D21C9677DCAB5782DE306E1D75E4F2FE4C7ED98C43`). Its layout/content were not rewritten. Existing CSS colors now use theme tokens with the exact original light values as fallbacks. Shared navigation has the requested simpler hierarchy.

## New structure

- Main navigation: Home, Book Turf, Teams, Matches, Rankings, My Account. Explore contains Players, Player Leaderboards, Rivalries and account shortcuts. The visible text theme toggle is in Explore and Account Settings.
- `/account`: compact identity and links, rather than a long management dashboard.
- `/account/profile`, `/account/teams`, `/account/bookings`, `/account/matches`, `/account/statistics`, `/account/invitations`, `/account/settings`: focused personal tasks. `/account/edit` still edits the single shared player record.
- `/account/teams`: captain/player groups, roles, member counts, public/team-management links, pending personal invitations/requests and confirmed member departure.
- `/teams/:id/manage`: team-specific captain workspace. Overview, Players, Join Requests, Invitations, Team Settings. Search registered eligible players by name, ID, position/role; invite/cancel, approve/reject, confirm removal, update team details. Optional `?tab=Players` (and other exact section labels) opens a section directly.
- Public team profiles contain public records and personal membership entry actions. Administration has moved into the captain workspace.
- Challenges and inbox use one selected captain team. Conversation lists, reply identity and challenge actions follow that team, including when one account captains both participating teams.
- Team management's booking link selects that captain team in the existing guided flow.

## Permissions and state

Route gates protect account subpages, booking, team creation, captain workspaces, challenges and inbox. Reducers independently reject unauthorized mutations. Captain permission belongs to the team, not an account type.

Members may browse booking options and select teams they play for, but only the selected team's captain can submit. The form explains this and links to the captain's public profile. Existing opponents only; same sport; no self-opponent. Demo requests never reserve turf or confirm matches.

Members can cancel their own pending join requests or leave with confirmation. Captains can remove other members with confirmation. Captains cannot leave/remove themselves; transfer is not implemented. Leaving/removal updates the shared roster, cancels obsolete pending membership entries and clears the affected selected-team booking draft. Recorded results and past requests remain intact. Settings validate names, duplicates and description length while preserving sport, captain and roster.

All community state still resets on refresh. Authorization is simulated frontend authorization only. Theme preference alone persists in localStorage.

## Theme behavior

`state/theme.jsx` resolves a stored light/dark choice or the device preference synchronously before the first React render. With no explicit preference it follows system changes. Storage-disabled environments retain an in-memory selection; storage events sync other tabs. Tokens and explicit selected/focus/disabled/status styles cover shared forms, tables, cards, slots, dialogs and competition UI. Existing reduced-motion support remains active. A native dialog provides modal confirmation and focus restoration.

## Verification

Commands:

- `node frontend/src/ui/verify-refinement.cjs`
- `node frontend/src/ui/verify-refinement.cjs --http=http://localhost:3001`
- `npm.cmd run build --prefix frontend`
- `git diff --check`

Passed: 123 server-rendered page/component cases, including all account pages, all five captain sections, denied management views, public routes, visitor gates, custom/sample identities and missing records. Reducer checks cover account creation/editing, invitations, requests/cancellation, leave/remove permissions, settings validation, captain-only booking submission, shared rosters/drafts, scoped challenge actions, messages and unchanged statistics/innings calculations. CSS syntax, internal link resolution and the static 2D card fallback pass. Simulated-DOM theme checks cover system initialization/change, explicit preference persistence/reload, storage sync and blocked storage. HTTP checks pass for 32 direct/query/nested/fallback routes and initial scripts.

Production build succeeds. Webpack retains warnings for the approximately 251 KiB initial entry and optional 362/371 KiB Three.js chunks. React/runtime account for about 217 KiB of the initial entry; shared UI/theme styling and routing account for about 34 KiB. The large optional chunks originate in Three.js core/module files. The 3D viewer remains demand-loaded; Three.js is not an entry script. No size limits were raised and warnings were not suppressed.

## Remaining verification limits

The browser tool failed to start its runtime (`The system cannot find the path specified`). No visual, actual keyboard, touch, screen-reader, real-browser theme flash/contrast, or WebGL/GPU checks are claimed. The simulated-DOM tests do not replace browser testing.

Manual follow-up: inspect all routes in both themes at desktop/mobile widths; toggle/reload and test system preference; check navigation Escape/outside click and focus; confirm leave/remove dialogs and focus restoration; complete booking/challenge/inbox forms as visitor/member/captain; inspect selected/disabled contrast and table overflow; test the 3D viewer and reduced motion on a browser/GPU. No known requested implementation is intentionally omitted; captain transfer and real persistence/authorization remain outside Stage 1.
