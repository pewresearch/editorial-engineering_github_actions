# Deploy Manager

Forked from https://github.com/Automattic/vip-actions

This action allows you to use the release feature from GitHub to create a new deployable artifact from any GitHub Repo and deploy it to any of your WordPress VIP environments. 
To run this you need to ensure that the `WPVIP_DEPLOY_TOKEN` secret and `ENVIRONMENT_ALIAS` variable are set correctly as well as the `DEPLOY_BRANCH` in your action input.

## Inputs

* `WPVIP_DEPLOY_TOKEN`: (required) The deployment token you can obtain on the "repository" page for your applications.
* `ENVIRONMENT_ALIAS`: (required) The environment alias (e.g. @appid.environment) used in the CLI to specify which application environment you're referencing.
* `RELEASE_NAME`: (required) The name of the release, typically sourced from the GitHub event data.
* `DEPLOY_BRANCH`: (required) The branch to generate a deploy from.

## Example

```yaml
name: Run Deploy
on:
  workflow_dispatch:
  release:
    types: [published]

jobs:
  deploy-action:
    name: Deploy action
    runs-on: ubuntu-latest
    steps:
      - uses: pewresearch/editorial-engineering_github_actions/deploy-manager@trunk
        with:
          WPVIP_DEPLOY_TOKEN: ${{ secrets.WPVIP_DEPLOY_TOKEN }}
          ENVIRONMENT_ALIAS: ${{ vars.ENVIRONMENT_ALIAS }}
          RELEASE_NAME: ${{ github.event.pull_request.title }}
          DEPLOY_BRANCH: ${{ github.event.pull_request.base.ref }}

```