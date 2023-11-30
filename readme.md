# arc-plugin-lambdalith

- API Gateway fronting a single Lambda function running a FastifyJS webserver
- RDS running Postgres on the smallest instance possible

### Prereq  

- Install deps by running `npm i`
- Make sure you are running a local Postgres database; I like this one on Mac https://postgresapp.com
- Postgres database will be created by CloudFormation but you still need these env vars:
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_SERVICE`
  - `POSTGRES_PORT`
  - `POSTGRES_DB`

## Local dev

- Run `npm t` to run the tests
- Run `npm start` to run locally

## Deploying 

- Run `npm run deploy` to deploy to a staging CloudFormation stack
- Run `npm run deploy:production` to deploy to a production CloudFormation stack

test
