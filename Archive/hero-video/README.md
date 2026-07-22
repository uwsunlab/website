# Archived homepage hero video

Removed from the homepage on 2026-07-22. Kept only in case it is ever needed again —
nothing in the build references this folder (Astro only builds `src/` and `public/`).

## What it is

A 10-second stock clip of a person in headphones recording a podcast at a microphone.
It is unrelated to the group's research, and almost certainly a leftover from a
Squarespace template: it was served from a **different** Squarespace site ID
(`624b503d11269629b387b9cc`) than every image on the site (`64bc55503de4ca604bd09dac`).

## Why it was removed

- The `<video>` element carried a single HLS (`.m3u8`) source and no hls.js fallback,
  so it only ever played in Safari. Chrome, Firefox and Edge silently ignored it and
  showed the SVG-only hero — which is now what every browser gets.
- Where it did play, the busy mid-tones cost the `<h1>` most of its contrast.
- It was the site's last runtime dependency on the Squarespace CDN.

## Original source

```
https://video.squarespace-cdn.com/content/v1/624b503d11269629b387b9cc/27959d14-057c-4485-ac6a-2f21b2e42c80/playlist.m3u8
```

The master playlist offered two H.264 variants, 640x360 and 1920x1080. Segment URLs
inside it are signed with short expiries, so this link is expected to stop working
once the Squarespace account lapses — hence the local copy.

## The file

`hero-1080.mp4` — 1920x1080, 25 fps, 10.0 s, H.264, 3.3 MB. Remuxed from the 1080p
HLS variant with `-c copy` (no re-encode, so it is bit-identical to what the CDN
served). The audio track was dropped, since the element was `muted`.

## Restoring it

Move the file into `public/`, then re-add to `src/pages/index.astro` inside
`<section class="home-hero">`, above the `.home-hero-draw` div:

```astro
<video class="home-hero-video" autoplay muted loop playsinline preload="metadata" aria-hidden="true">
  <source src="/hero-1080.mp4" type="video/mp4" />
</video>
```

The matching `.home-hero-video` rule was deleted from `src/styles/global.css` at the
same time and would need restoring too:

```css
.home-hero-video {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
  mix-blend-mode: multiply;
  pointer-events: none;
}
```

Serving it as MP4 rather than HLS would also make it play in every browser, not just
Safari.
