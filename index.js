const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const headTokenRegex = new RegExp('%headbranch%', "g");

    const inputs = {
      token: core.getInput('repo-token', {required: true}),
      headBranchRegex: core.getInput('head-branch-regex'),
      lowercaseBranch: (core.getInput('lowercase-branch').toLowerCase() === 'true'),
      bodyTemplate: core.getInput('body-template'),
      bodyUpdateAction: core.getInput('body-update-action').toLowerCase(),
      bodyNewlineCount: parseInt(core.getInput('body-newline-count')),
      bodyUppercaseBaseMatch: (core.getInput('body-uppercase-base-match').toLowerCase() === 'true'),
      bodyUppercaseHeadMatch: (core.getInput('body-uppercase-head-match').toLowerCase() === 'true'),
    }

    const headBranchRegex = inputs.headBranchRegex.trim();
    const matchHeadBranch = headBranchRegex.length > 0;

    if (!matchHeadBranch) {
      core.setFailed('No branch regex values have been specified');
      return;
    }

    const matches = {
      headMatch: ''
    }

    if (matchHeadBranch) {
      const headBranchName = github.context.payload.pull_request.head.ref;
      const headBranch = inputs.lowercaseBranch ? headBranchName.toLowerCase() : headBranchName;
      core.info(`Head branch: ${headBranch}`);

      const headMatches = headBranch.match(new RegExp(headBranchRegex));
      if (!headMatches) {
        core.setFailed('Head branch name does not match given regex');
        return;
      }

      matches.headMatch = headMatches[0];
      core.info(`Matched head branch text: ${matches.headMatch}`);

      core.setOutput('headMatch', matches.headMatch);
    }

    const request = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request.number,
    }

    const upperCase = (upperCase, text) => upperCase ? text.toUpperCase() : text;

    const body = github.context.payload.pull_request.body || '';
    const processedBodyText = inputs.bodyTemplate
      .replace(headTokenRegex, upperCase(inputs.bodyUppercaseHeadMatch, matches.headMatch));
    core.info(`Processed body text: ${processedBodyText}`);

    const updateBody = ({
      prefix: !body.toLowerCase().startsWith(processedBodyText.toLowerCase()),
      suffix: !body.toLowerCase().endsWith(processedBodyText.toLowerCase()),
      replace: body.toLowerCase() !== processedBodyText.toLowerCase(),
    })[inputs.bodyUpdateAction] || false;

    core.setOutput('bodyUpdated', updateBody.toString());

    if (updateBody) {
      request.body = ({
        prefix: processedBodyText.concat('\n'.repeat(inputs.bodyNewlineCount), body),
        suffix: body.concat('\n'.repeat(inputs.bodyNewlineCount), processedBodyText),
        replace: processedBodyText,
      })[inputs.bodyUpdateAction];
      core.debug(`New body: ${request.body}`);
    } else {
      core.warning('No updates were made to PR body');
    }

    if (!updateBody) {
      return;
    }

    const octokit = github.getOctokit(inputs.token);
    const response = await octokit.pulls.update(request);

    core.info(`Response: ${response.status}`);
    if (response.status !== 200) {
      core.error('Updating the pull request has failed');
    }
  }
  catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run()