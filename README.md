# Pull Request Updater

![Update Pull Request](https://github.com/devindford/Append_PR_Comment/actions/workflows/update-pr.yml/badge.svg)
[![Release](https://img.shields.io/github/release/devindford/Append_PR_Comment.svg)](https://github.com/devindford/Append_PR_Comment/releases/latest)

This is a GitHub Action that updates a pull request body with a provided template. The pull request body can either be prefixed or suffixed.

Forked and modified from [pr-update-action](https://github.com/tzkhan/pr-update-action)

## Usage

Create a workflow yaml file (for e.g. `.github/workflows/update-pr.yml`). See [Creating a Workflow file](https://docs.github.com/en/free-pro-team@latest/actions/learn-github-actions/introduction-to-github-actions#create-an-example-workflow).

### Inputs

#### Required
- `repo-token`: secret token to allow making calls to GitHub's rest API (for e.g. `${{ secrets.GITHUB_TOKEN }}`). The token will need read and write permissions.

#### Optional
- `lowercase-branch`: whether to lowercase branch name before matching (default: `true`)
- `body-template`: text template to update body with
- `body-update-action`: whether to prefix or replace body with body-template (default: `suffix`)
- `body-newline-count`: number of newlines to separate body and its prefix or suffix (default: `2`)

#### Notes:

- Value for the `head-branch-regex` should be provided, otherwise the action will return an error. The value should be a [Javascript regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).
- `body-template` can contain any text you want to append to the beginning or end of the PR body
- `body-update-action` can be set to one of the following values:
  - `prefix`
  - `suffix`
- `body-template` can be set to a GitHub secret if necessary to avoid leaking sensitive data. `body-template: ${{ secrets.PR_BODY_TEMPLATE }}`

### Outputs

- `headMatch`: matched text from head branch if any
- `bodyUpdated`: whether the PR body was updated

## Example

So the following yaml

```
name: "Update Pull Request"
on: pull_request

jobs:
  update_pr:
    runs-on: ubuntu-latest
    steps:
    - uses: devindford/Append_PR_Comment@v1.1.2
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        body-template: |
          This was added after the action ran
          Isn't this cool!
        body-update-action: 'suffix'
```

The PR body will now have the template language after the initial PR body message