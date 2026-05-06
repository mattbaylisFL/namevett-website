# NameVett Website

Static landing page + privacy policy + terms of service for the
NameVett iOS app. Designed to host on **GitHub Pages** at no cost.

This is a separate public repo from the app source — the app code
lives at [`mattbaylisFL/vett`](https://github.com/mattbaylisFL/vett)
and stays private; only this static marketing/legal site is public.

## Files

| File | Purpose |
|---|---|
| `index.html` | Marketing landing page |
| `privacy.html` | Privacy policy (linked from App Store Connect privacy URL) |
| `terms.html` | Terms of service |
| `style.css` | Single stylesheet shared across all pages |
| `icon.png` | 1024×1024 app icon (used as og:image and apple-touch-icon) |
| `favicon.png` | 128×128 favicon |
| `screenshot-locked.png` | Hero screenshot (placeholder of the locked report) |

## Deploy via GitHub Pages

The site lives at the **root** of this repo, so deployment is one click.

1. Push the repo to GitHub (default branch `main`).
2. **Settings → Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/ (root)`
3. Click Save. Pages will publish at:
   - `https://mattbaylisFL.github.io/namevett-website/`
4. The `<link rel="canonical">` URLs in each HTML file are pre-set to
   that path. If you connect a custom domain (e.g. `namevett.app`),
   update the canonical hrefs across `index.html`, `privacy.html`,
   `terms.html` and the in-text URL near the bottom of `terms.html`.

### Optional — User-page domain (`mattbaylisFL.github.io`)

If you ever want this at the root user-page URL instead of a project
subpath:

1. Rename or move the contents into a repo named exactly
   `mattbaylisFL.github.io`.
2. Settings → Pages → Source: Deploy from `main` / `/ (root)`.
3. URL becomes `https://mattbaylisFL.github.io/`.
4. Update canonical hrefs again.

## After deploy — wire the URL into App Store Connect

When ASC asks for the **Privacy Policy URL**, paste:

```
https://mattbaylisFL.github.io/namevett-website/privacy.html
```

The privacy URL must be reachable before you submit for review.

## Updating

Plain static HTML/CSS — no build step. Edit the `.html` / `.css` files,
push to `main`, GitHub Pages republishes within a minute or two.

## Why no analytics or tracking

The app's privacy policy says we collect nothing. Adding GA / PostHog /
similar to the marketing site would contradict that. If you ever want
basic visit counts, [Plausible](https://plausible.io) or
[Goatcounter](https://goatcounter.com) are privacy-respecting options
that don't require updating the privacy policy meaningfully.
