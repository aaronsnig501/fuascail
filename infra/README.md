# Fuascail Static Hosting

OpenTofu provisions:

- a private S3 bucket for the built site assets
- a CloudFront distribution with Origin Access Control
- an ACM certificate in `us-east-1` with Route53 DNS validation
- Route53 `A` and `AAAA` alias records for the site hostname
- SPA-friendly CloudFront error responses mapping `403` and `404` to `/index.html`

## Usage

```sh
cd infra
tofu init
tofu plan -var='domain_name=fuascail.example.com' -var='hosted_zone_name=example.com'
tofu apply -var='domain_name=fuascail.example.com' -var='hosted_zone_name=example.com'
```

Build and upload the app after the infrastructure exists:

```sh
npm run build
aws s3 sync build/ "s3://$(tofu -chdir=infra output -raw bucket_name)/" --delete
aws cloudfront create-invalidation \
  --distribution-id "$(tofu -chdir=infra output -raw cloudfront_distribution_id)" \
  --paths '/*'
```
