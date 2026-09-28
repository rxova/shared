---
name: rx-aws
description: Picks the fastest AWS path for a hackathon (Amplify Hosting, ECS Express Mode, Lambda with SST or SAM, S3 plus CloudFront, RDS, Aurora Serverless or DynamoDB, Cognito) with safe credentials, a budget alarm and a tear-down checklist. Use when a project must run on AWS, uses sponsor credits, or needs to be cleaned up afterwards to avoid a bill.
---

# rx-aws

AWS can do anything, which is the problem at a hackathon. Set a budget alarm first, pick one
managed service per job, deploy with a tool that can also delete everything, and tear down
when judging ends.

## When to use

- The event, sponsor or team requires AWS, or you have AWS credits.
- Choosing between the many ways to host a web app, container or function on AWS.
- The hackathon is over and resources are still running.

## Which service

| Need                                       | Fast path                                                |
| ------------------------------------------ | -------------------------------------------------------- |
| Next.js or SPA from a Git repo             | Amplify Hosting                                          |
| Container with an HTTPS URL                | ECS Express Mode (App Runner is closed to new customers) |
| Functions and an HTTP API                  | Lambda + API Gateway via SST or AWS SAM                  |
| Static site                                | S3 (private) + CloudFront with origin access control     |
| Relational data, steady use                | RDS Postgres (smallest instance)                         |
| Relational data, spiky or idle             | Aurora Serverless v2 (check its minimum capacity cost)   |
| Key-value access patterns, pay per request | DynamoDB on-demand                                       |
| User sign-in                               | Cognito (or a non-AWS provider; see rx-auth)             |
| Files                                      | S3 with presigned upload URLs                            |

## Steps

1. **Budget alarm first.** Billing and Cost Management, Budgets, create a monthly cost budget
   (for example 20 USD) with email alerts at 50% and 100%.
2. **Credentials:** use IAM Identity Center (SSO) with `aws configure sso` and
   `aws sso login --profile hack`, then `export AWS_PROFILE=hack`. Never use root keys, never
   commit `~/.aws` or access keys, and do not paste keys into `.env` files that get deployed.
3. **Least privilege:** give the app's runtime role only the actions and resources it uses
   (one bucket, one table). CI deploys via GitHub OIDC with an assumable role, not stored keys.
4. **Pick one region** and use it for everything; note it in the README.
5. **Deploy:**
   - Amplify Hosting: connect the repo in the Amplify console, set env vars there, push.
   - ECS Express Mode: push an image to ECR, then create the service in the ECS console or
     with `aws ecs create-express-gateway-service` (it needs an execution role and an
     infrastructure role). It provisions Fargate, a load balancer and a URL.
   - SST: `npx sst@latest init`, `npx sst dev`, `npx sst deploy --stage prod`.
   - SAM: `sam init`, `sam build`, `sam deploy --guided`.
6. **Secrets:** SSM Parameter Store (SecureString) or Secrets Manager, read by the runtime
   role; SST has its own `sst secret set`.
7. **Tag everything** with `project=<name>` so you can find it for tear-down.

## Example

```ts
// sst.config.ts: API on Lambda + a DynamoDB table + a secret (SST v3 style)
/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: 'hack-api',
      home: 'aws',
      removal: input?.stage === 'prod' ? 'retain' : 'remove',
    };
  },
  async run() {
    const table = new sst.aws.Dynamo('Notes', {
      fields: { pk: 'string', sk: 'string' },
      primaryIndex: { hashKey: 'pk', rangeKey: 'sk' },
    });
    const apiKey = new sst.Secret('AnthropicApiKey');
    const api = new sst.aws.ApiGatewayV2('Api');
    api.route('GET /notes', { handler: 'src/notes.list', link: [table] });
    api.route('POST /notes', { handler: 'src/notes.create', link: [table, apiKey] });
    return { url: api.url };
  },
});
```

Check sst.dev/docs and docs.aws.amazon.com for current component names and CLI flags.

## Tear-down checklist

- [ ] `npx sst remove --stage <stage>` / `sam delete` / delete the CloudFormation stacks.
- [ ] Delete ECS Express services (this removes their load balancer), Amplify apps and
      CloudFront distributions (disable first, then delete).
- [ ] RDS and Aurora: delete instances and clusters; decide on a final snapshot, then delete
      old snapshots too.
- [ ] Empty and delete S3 buckets; delete ECR images.
- [ ] NAT gateways, Elastic IPs and load balancers bill by the hour even when idle.
- [ ] Delete Secrets Manager secrets and CloudWatch log groups you created.
- [ ] Use Resource Groups (tag `project=<name>`) or Tag Editor in each region you used to
      find leftovers.
- [ ] Deactivate or delete any IAM access keys created for the event.
- [ ] Check Cost Explorer the next day: spend should be flat.

## Gotchas

- Wrong region in the console makes resources look missing.
- Aurora Serverless and RDS are not free while idle unless your configuration scales to zero;
  check the current pricing page.
- Lambda in a VPC needs a NAT gateway for internet access, which costs money; avoid VPCs
  unless the database requires it.
- API Gateway and Lambda have payload and timeout limits; stream or offload large work.
- Public S3 buckets are blocked by default for good reason; serve through CloudFront.

## Verify it works

- The budget shows in Budgets with an alert email confirmed.
- `aws sts get-caller-identity --profile hack` shows an SSO role, not root.
- After tear-down, Tag Editor finds no resources tagged with the project.
