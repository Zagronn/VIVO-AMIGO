# Cloudflare Domain Setup

This guide configures the vivoamigo domains behind Cloudflare. It describes the expected records and verification contract; it does not claim that external DNS, certificates, or provider accounts are active.

## DNS Records

Create the records in the authoritative Cloudflare zone with the proxy setting required by the deployment:

| Target | Type | Name | Content | Proxy |
| --- | --- | --- | --- | --- |
| Vercel | `A` | `vivoamigo.com` or delegated hostname | `76.76.21.21` | As approved for the edge route |
| AWS CloudFront | `CNAME` | deployment hostname | `vivoamigo.cloudfront.net` | As approved for the edge route |

The application verifier expects the exact provider-specific type and content. It also checks the record name, proxy flag, and active status. Never mark a domain active from configuration text alone.

## SSL/TLS Strict Mode

1. Set Cloudflare SSL/TLS encryption mode to `Full (strict)`.
2. Install a valid origin certificate on the Vercel or CloudFront origin.
3. Confirm the origin certificate hostname and validity chain.
4. Verify HTTPS redirects and HSTS behavior at the edge.
5. Run `syncCloudflareDomain` through Agent #105 and require `ENFORCED_FULL_STRICT` before release.

The code uses the invariant `sslMode: 'FULL_STRICT'`. Invalid or pending TLS configuration is rejected or reported as pending; it is never treated as a successful deployment.

## Vercel Integration

- Add the production domain to the Vercel project and complete Vercel ownership verification.
- Configure the Cloudflare DNS record for the intended Vercel target.
- Keep the Vercel origin certificate active while Cloudflare proxies traffic.
- Confirm the deployed app route resolves `/` to `VivoShowcaseLanding` before changing DNS.

For AWS CloudFront, use the distribution hostname, attach the validated ACM certificate in the correct region, and configure the CloudFront alternate domain name before the CNAME is activated.

## Agent #105 Verification

`services/cloudflareDomainSync.ts` identifies the operation as Agent `#105` and delegates to the credential-gated Cloudflare adapter in `services/cloudflareDomainVerification.ts`. The default adapter is unavailable by design. Production wiring must supply authenticated Cloudflare API calls for DNS and SSL checks.

Required release evidence:

- DNS query or Cloudflare API response matching the expected record.
- Cloudflare SSL mode confirmed as `Full (strict)`.
- Valid origin certificate and HTTPS response.
- Vercel or CloudFront deployment ID and rollback reference.
- Audit timestamp and operator identity.