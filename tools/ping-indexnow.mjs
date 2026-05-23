#!/usr/bin/env node
/**
 * IndexNow auto-ping.
 *
 * Notifies Bing, Yandex, Seznam, Naver (and indirectly Google via Bing)
 * that the sitemap has changed. Run after the GitHub Pages deploy succeeds.
 *
 * Why not also ping Google directly? Google deprecated its sitemap-ping
 * endpoint in June 2023 and explicitly told publishers to stop pinging.
 * Their only blessed automation API (Indexing API) is officially limited
 * to JobPosting and BroadcastEvent pages — using it for regular content
 * pages risks a Search Console penalty per Google's own docs. For Google,
 * the realistic path is manual Search Console re-submit, which triggers
 * the same crawl that IndexNow→Bing→Google secondary indexing achieves.
 *
 * Protocol spec: https://www.indexnow.org/documentation
 *
 * Reads sitemap.xml from this site (only URLs whose <lastmod> matches
 * today's date are submitted — that limits noise on day-to-day deploys
 * that don't actually change much). To force a full re-submit of every
 * URL, run with FORCE_ALL=1.
 *
 * GitHub Pages project-pages wrinkle: the IndexNow `host` is the apex
 * github.io subdomain (mattbaylisfl.github.io), but the key file lives
 * under the project subpath. We pin KEY_LOCATION explicitly rather than
 * letting it default to `https://${HOST}/${KEY}.txt`.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---- Per-site config (edit these for each portfolio site) ----
const HOST = 'mattbaylisfl.github.io';
const KEY = 'dd022a7ab1d0057e111cb6883cb1e86c';
// GH Pages project site: key file is served from the project subpath,
// NOT the apex. Override the usual `https://${HOST}/${KEY}.txt` default.
const KEY_LOCATION = `https://mattbaylisfl.github.io/namevett-website/${KEY}.txt`;
// --------------------------------------------------------------

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const __dirname = dirname(fileURLToPath(import.meta.url));

// Locate sitemap.xml — look one level up from tools/ first, then cwd.
function findSitemap() {
    const candidates = [
        join(__dirname, '..', 'sitemap.xml'),
        join(process.cwd(), 'sitemap.xml'),
    ];
    for (const path of candidates) {
        if (existsSync(path)) return path;
    }
    throw new Error(`sitemap.xml not found in ${candidates.join(' or ')}`);
}

function parseSitemap(xml) {
    const urls = [];
    const re = /<url>([\s\S]*?)<\/url>/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
        const block = m[1];
        const loc = (block.match(/<loc>([^<]+)<\/loc>/) || [, ''])[1].trim();
        const lastmod = (block.match(/<lastmod>([^<]+)<\/lastmod>/) || [, ''])[1].trim();
        if (loc) urls.push({ loc, lastmod });
    }
    return urls;
}

async function main() {
    const sitemapPath = findSitemap();
    const xml = readFileSync(sitemapPath, 'utf-8');
    const entries = parseSitemap(xml);

    if (!entries.length) {
        console.error('No <url> entries in sitemap; aborting.');
        process.exit(1);
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const forceAll = process.env.FORCE_ALL === '1';
    const selected = forceAll
        ? entries
        : entries.filter(e => e.lastmod === today);

    if (!selected.length) {
        console.log(`IndexNow: nothing to submit (no URLs with lastmod=${today}). Set FORCE_ALL=1 to submit all ${entries.length}.`);
        return;
    }

    const urlList = selected.map(e => e.loc);
    const payload = {
        host: HOST,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList,
    };

    console.log(`IndexNow: submitting ${urlList.length} URL${urlList.length === 1 ? '' : 's'} (host=${HOST}, forceAll=${forceAll})…`);

    try {
        const resp = await fetch(INDEXNOW_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload),
        });
        const body = await resp.text();
        if (resp.status >= 200 && resp.status < 300) {
            console.log(`IndexNow: OK (${resp.status})`);
        } else {
            // Non-fatal — deploys shouldn't fail because IndexNow had a hiccup.
            console.warn(`IndexNow: non-2xx ${resp.status}: ${body.slice(0, 400)}`);
        }
    } catch (err) {
        console.warn(`IndexNow: request failed (non-fatal): ${err.message}`);
    }
}

main();
