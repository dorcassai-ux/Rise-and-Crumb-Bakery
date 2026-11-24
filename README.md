# Rise & Crumb Bakery Website

A static bakery website (HTML, CSS, JavaScript) hosted on **Amazon S3** and delivered through **Amazon CloudFront**.

**Live site:** https://d12jppejux9oyw.cloudfront.net

![Rise & Crumb website](screenshots/02-website-live.png)

## Features

- Daily menu with category filters (Bread, Pastry, Cakes, Cookies)
- Basket for pickup orders
- Sold-out item indicators
- Serverless hosting with HTTPS and global caching

## Architecture

```
Visitor  ->  CloudFront  ->  S3 bucket (static files)
```

## Project Structure

```
index.html
css/
js/
```

## Setup

1. Create an S3 bucket (this project uses `bitha-bakery-service-24-11-26`).
2. Upload `index.html`, `css/` and `js/`, keeping the folder structure.
3. Create a CloudFront distribution with the bucket as its origin.
4. Set the default root object to `index.html`.

![CloudFront distribution](screenshots/03-cloudfront-distribution.png)

## Verification

1. Wait until the distribution status is **Enabled**.
2. Open the CloudFront domain name in a browser.
3. Confirm the page loads with styling, the filters work and items can be added to the basket.

## Updating the Site

Upload the changed files to the bucket, then create a CloudFront invalidation (e.g. `/*`) so the update shows immediately.

## Limitations

The site is static: no server-side code, logins or stored orders. These are planned for the next level of the project.

## Documentation

See [Bakery_S3_CloudFront_Documentation.docx](Bakery_S3_CloudFront_Documentation.pdf) for the full step-by-step guide.
