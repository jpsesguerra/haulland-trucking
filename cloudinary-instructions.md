# Cloudinary Image & Video Hosting — Setup Playbook

This documents how we migrated a static HTML site's local images/videos to Cloudinary, the problems we hit, and the exact process that avoided them. Use this as a checklist for the next project.

## Why Cloudinary for a static HTML site

- Offloads asset hosting from the web server (Hostinger, etc.) — keeps the deployed repo small
- CDN delivery + automatic format/quality optimization (`f_auto`, `q_auto`)
- On-the-fly resizing via URL parameters — no need to pre-generate multiple image sizes

## Step 1 — Clean up local assets BEFORE uploading

If the site was exported from a builder (Webflow, Squarespace, etc.), it likely auto-generated multiple responsive variants per image, e.g.:

```
photo.jpg
photo-p-500.jpeg
photo-p-800.jpeg
photo-p-1080.jpeg
```

**Delete all the `-p-###` (or similarly suffixed) variant files before uploading.** Cloudinary regenerates any size on demand via URL transforms (`w_500`, `w_800`, etc.), so you only need the original file.

```bash
# Identify variants vs originals
ls images/ | grep -E '\-p\-[0-9]+'   # variants — delete these
ls images/ | grep -v -E '\-p\-[0-9]+' # originals — keep these

# Delete variants
ls images/ | grep -E '\-p\-[0-9]+' | xargs rm
```

This alone cut our upload count from 160 files to 66.

## Step 2 — Do NOT use Cloudinary's web upload UI for bulk uploads

**This was the main issue we hit.** Dragging files into the Cloudinary Media Library UI auto-appends a random suffix to every filename (e.g. `time-clock.svg` becomes `time-clock_vmtxty.svg`), and there's no setting in the standard upload dialog to disable it reliably. This breaks any predictable URL referencing scheme.

**Fix: upload via the Cloudinary API/SDK with an explicit `public_id`.** This guarantees the exact filename (minus extension) is preserved, with zero random suffixes.

```python
# pip3 install cloudinary
import cloudinary
import cloudinary.uploader
import os

cloudinary.config(
    cloud_name="YOUR_CLOUD_NAME",
    api_key="YOUR_API_KEY",
    api_secret="YOUR_API_SECRET"
)

images_dir = "images"
folder = "your-project-folder"

for fname in os.listdir(images_dir):
    name, ext = os.path.splitext(fname)
    public_id = f"{folder}/{name}"
    cloudinary.uploader.upload(
        os.path.join(images_dir, fname),
        public_id=public_id,
        resource_type="image",      # use "video" for video files
        overwrite=True,
        unique_filename=False,      # critical — disables the random suffix
        use_filename=True
    )
```

Result: predictable URLs like:
```
https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{filename}.{ext}
```

For video, same pattern but `resource_type="video"` and the URL path is `/video/upload/` instead of `/image/upload/`.

## Step 3 — Get API credentials safely

In Cloudinary dashboard: **Settings (gear icon) → API Keys**. You need:
- Cloud name (visible everywhere, not secret)
- API Key (semi-public, fine to share for setup)
- API Secret (sensitive — reveal via the eye icon, use once, don't commit it anywhere)

Never commit API secret to a git repo. Use it only in a local one-off script, never save it into the codebase.

## Step 4 — Update all HTML/CSS references in one pass

Once Cloudinary URLs are predictable, swap local references with a single script — don't hand-edit each file.

```python
import os

CLOUD = "YOUR_CLOUD_NAME"
FOLDER = "your-project-folder"
BASE_URL = f"https://res.cloudinary.com/{CLOUD}/image/upload/{FOLDER}"

for fname in [f for f in os.listdir('.') if f.endswith('.html')]:
    with open(fname) as f:
        content = f.read()
    updated = content.replace('src="images/', f'src="{BASE_URL}/')
    updated = updated.replace('srcset="images/', f'srcset="{BASE_URL}/')
    if updated != content:
        with open(fname, 'w') as f:
            f.write(updated)
```

If `srcset` attributes reference the old `-p-500`/`-p-800` variant files (before you delete them), rewrite those into Cloudinary width transforms instead of separate files:

```
<!-- Before -->
srcset="images/photo-p-500.jpeg 500w, images/photo-p-800.jpeg 800w, images/photo.jpg 1280w"

<!-- After -->
srcset="https://res.cloudinary.com/CLOUD/image/upload/w_500/FOLDER/photo.jpg 500w,
        https://res.cloudinary.com/CLOUD/image/upload/w_800/FOLDER/photo.jpg 800w,
        https://res.cloudinary.com/CLOUD/image/upload/FOLDER/photo.jpg 1280w"
```

Regex to convert automatically:
```python
import re
updated = re.sub(
    r'BASE_URL/([^"\']+?)-p-(\d+)\.(jpe?g|png|webp)\s+(\d+)w',
    lambda m: f"{BASE_URL_WITH_TRANSFORM}/w_{m.group(2)}/{FOLDER}/{m.group(1)}.{m.group(3)} {m.group(2)}w",
    content
)
```

## Step 5 — Handle favicon, webclip, and other small refs separately

Easy to miss: `<link rel="shortcut icon">`, `<link rel="apple-touch-icon">`, and any inline CSS `background-image` refs. Grep for `images/` or `videos/` again after the main pass to catch stragglers.

```bash
grep -rh 'images/\|videos/' *.html css/*.css
```

## Step 6 — Videos

Same API-upload approach as images, just with `resource_type="video"`. Only upload the source `.mp4` — skip `.webm` and any `-transcode` variants Webflow/builders generate; Cloudinary serves the right format automatically per browser if you reference it directly, or you can request `.webm` via URL by changing the extension (Cloudinary transcodes on the fly).

```python
cloudinary.uploader.upload(
    "videos/hero.mp4",
    public_id="your-project-folder/hero",
    resource_type="video",
    overwrite=True,
    unique_filename=False
)
```

Update `<source src="">` tags and `<video poster="">` the same way as images.

## Step 7 — Verify before declaring done

Pull one asset back via the API to confirm the URL matches exactly what's referenced in HTML:

```python
import cloudinary.api
r = cloudinary.api.resource("your-project-folder/some-file")
print(r['secure_url'])
```

Then grep the codebase to confirm zero local references remain:

```bash
grep -rc 'src="images/' *.html   # should be 0 everywhere
```

## Summary checklist

- [ ] Delete builder-generated responsive variant files locally before upload
- [ ] Upload via API/SDK script with explicit `public_id`, `unique_filename=False` — never the drag-and-drop UI for bulk uploads
- [ ] Use one folder per project in Cloudinary for clean organization
- [ ] Script the HTML reference swap — don't hand-edit
- [ ] Convert `srcset` variant files into Cloudinary `w_` transforms instead of multiple uploads
- [ ] Don't forget favicon/webclip/CSS background-image refs
- [ ] Videos: same API approach, `resource_type="video"`, only upload originals
- [ ] Verify with a pulled resource URL + grep for zero remaining local refs
