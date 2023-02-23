# Pull Request Updater

This is a GitHub Action that updates a pull request body with a provided template. The pull request body can either be prefixed, suffixed or replaced.

Forked and modified from [pr-update-action](https://github.com/tzkhan/pr-update-action)

## Usage

Create a workflow yaml file (for e.g. `.github/workflows/update-pr.yml`). See [Creating a Workflow file](https://docs.github.com/en/free-pro-team@latest/actions/learn-github-actions/introduction-to-github-actions#create-an-example-workflow).

### Inputs

#### Required
- `repo-token`: secret token to allow making calls to GitHub's rest API (for e.g. `${{ secrets.GITHUB_TOKEN }}`)

#### Optional
- `head-branch-regex`: regex to match text from the head branch name
- `lowercase-branch`: whether to lowercase branch name before matching (default: `true`)
- `body-template`: text template to update body with
- `body-update-action`: whether to prefix or replace body with body-template (default: `prefix`)
- `body-newline-count`: number of newlines to separate body and its prefix or suffix (default: `2`)
- `body-uppercase-base-match`: whether to uppercase matched text from base branch in body (default: `true`)
- `body-uppercase-head-match`: whether to uppercase matched text from head branch in body (default: `true`)

#### Notes:

- Value for the `head-branch-regex` should be provided, otherwise the action will return an error. The value should be a [Javascript regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).
- `body-template` can contain any of the following tokens (can be repeated if required) which will be replaced by the matched text from branch name:
  - `%headbranch%`
- `title-update-action` and `body-update-action` can be set to one of the following values:
  - `prefix`
  - `suffix`
  - `replace`
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
    - uses: devindford/Append_PR_Comment@v1.1.1
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        head-branch-regex: 'foo-\d+'
        body-template: |
          This was added after the action ran
          Isn't this cool!
        body-update-action: 'suffix'
        body-uppercase-base-match: false
```

The PR body will now have the template language after the initial PR body message
