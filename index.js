const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {

    const inputs = {
      token: core.getInput('repo-token', {required: true}),
      bodyTemplate: core.getInput('body-template'),
      bodyUpdateAction: core.getInput('body-update-action').toLowerCase(),
      bodyNewlineCount: parseInt(core.getInput('body-newline-count')),
      bodyUppercaseBaseMatch: (core.getInput('body-uppercase-base-match').toLowerCase() === 'true'),
      bodyUppercaseHeadMatch: (core.getInput('body-uppercase-head-match').toLowerCase() === 'true'),
    }


    const request = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request.number,
    }

    const upperCase = (upperCase, text) => upperCase ? text.toUpperCase() : text;

    const body = github.context.payload.pull_request?.body || '';
    core.info( `Processed body text: ${ body }`);

    const updateBody = ({
      prefix: !body.toLowerCase().startsWith(inputs.bodyTemplate.toLowerCase()),
      suffix: !body.toLowerCase().endsWith(inputs.bodyTemplate.toLowerCase())
    })[inputs.bodyUpdateAction] || false;

    core.setOutput('bodyUpdated', updateBody.toString());

    if (updateBody) {
      request.body = ({
        prefix: inputs.bodyTemplate.concat('\n'.repeat(inputs.bodyNewlineCount), body),
        suffix: body.concat('\n'.repeat(inputs.bodyNewlineCount), inputs.bodyTemplate)
      })[inputs.bodyUpdateAction];
      core.debug(`New body: ${request.body}`);
    } else {
      core.warning('PR body already includes the template, no update made to the PR');
    }

    if (!request.pull_number) {
      core.error('Unable to retrieve the pull request number')
    }
    
    if (!updateBody) {
      return;
    }

    const octokit = github.getOctokit(inputs.token);
    const response = await octokit.rest.pulls.update(request);

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
