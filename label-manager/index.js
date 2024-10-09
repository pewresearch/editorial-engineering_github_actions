const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('repo-token');
    const { payload, repo } = github.context;
    const octokit = github.getOctokit(token);
    const issue_number = payload.issue.number;
    const newLabel = payload.label.name;
    const labelConfig = JSON.parse(core.getInput('label-config'));
    let assignees = [];
    Object.keys(labelConfig.labels).forEach((label) => {
      if (label === newLabel) {
        assignees = labelConfig.labels[label].assignees;
      }
    });
    if (assignees !== undefined && assignees.length > 0) {
      console.log(`Assigning ${assignees.join(', ')} to issue ${issue_number}`);
      const newAssignee = octokit.rest.issues.addAssignees({
        owner: repo.owner,
        repo: repo.repo,
        issue_number,
        assignees,
      });
    } else {
      console.log(`No assignees for label ${newLabel}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
