# To-do

## Start menu

Done:
- [x] Internet Explorer, Notepad, My Computer, My Documents
- [x] Shut Down... (goes straight to the BSOD)
- [x] Run...

Planned, in this order:
- [x] Help: small Help window about the site and how to use it
- [x] Programs ▶: needs a submenu mechanism (Accessories, Chant Page shortcut, etc.)
- [x] Settings ▶: Control Panel (Display, System) and Display... (desktop color, saved in localStorage). Taskbar settings not done.
- [x] Display Properties wallpapers: auto Tile (< 640x480) or Stretch; list lives in `WALLPAPERS` in `public/script.js` (update with the folder)
- [ ] Add the remaining Windows 2000 wallpapers to `public/wallpapers/` (then add to `WALLPAPERS` and `NEOCITIES_FILES`)
- [ ] `images/` folder isn't listed in My Documents (no `directory` entry in `NEOCITIES_FILES`)
- [x] Search ▶: For Files or Folders... (searches `NEOCITIES_FILES`, supports * and ?) and On the Internet... (Wikipedia search)
- [ ] Documents ▶: recent files (`about.txt`, `chant.html`)
- [ ] Favorites ▶: shortcuts to chant resources (Antiochian.org etc.)
- [ ] Log Off...: confirmation dialog, then a login/welcome screen
- [ ] Shut Down dialog: real "Shut Down Windows" dialog, keep the BSOD as one option
- [ ] Windows Update: joke/easter-egg item (optional)

## Bugs / fixes

- [x] Make Settings ▶ and Search ▶ arrows match Programs ▶ (right-aligned `.sub-arrow`)
- [x] Fix "Chant Page" link (desktop icon now opens the IE window)
- [ ] Outside sites (Google, Wikipedia, etc.) refuse to load in the IE iframe; consider a clearer "Cannot display page" screen

## Reminders

- When adding or removing files in `public/`, update `NEOCITIES_FILES` in `public/script.js`.
- `index.html` and `script.js` use CRLF line endings; keep them that way so diffs stay small.
