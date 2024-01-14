const { Octokit } = require('octokit');
const path = require('path');

/**
 * This method create a copy of repository in other organization. Only main branch copied.
 * @param {string} token - token to use GitHub API
 * @param {string} templateOwner - organization from which we copy repository
 * @param {string} templateRepo - name of the repository we copy
 * @param {string} owner - organization where we want to copy repository
 * @param {string} description - description we add to repository
 */

const copyRepoTo = async ({
  token,
  templateOwner,
  templateRepo,
  owner,
  description,
}) => {

  const octokit = new Octokit({
    auth: token,
  });

  const { data: {
    html_url,
    description: repoDescription,
  } } = await await octokit.request(`GET /repos/${owner}/${templateRepo}`, {
    owner,
    name: templateRepo,
    headers: {
        'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  await octokit.request(`POST /repos/${templateOwner}/${templateRepo}/generate`, {
    owner,
    name: templateRepo,
    description: description ?? repoDescription,
    include_all_branches: false,
    private: false,
    headers: {
        'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  const waitForBranch = () => new Promise((resolve, reject) => {
    const BRANCH_CHECK_TIMER = 1000;
    let TIMES_LEFT = 10;
    const checkForBranch = async () => {
      if (TIMES_LEFT <= 0) {
        reject('Branch creation timeout');
      }
      TIMES_LEFT--;
      const { data } = await octokit.request(`GET /repos/${owner}/${templateRepo}/branches`, {
        owner,
        repo: templateRepo,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      if (data.find(({name})=>(name === 'main')) !== undefined) {
        resolve('branch found');
      } else {
        startCheckBranchTimer();
      }
    };
    const startCheckBranchTimer = () => new setTimeout(checkForBranch, BRANCH_CHECK_TIMER);
    checkForBranch();
  });

  await waitForBranch();

  const {data} = await octokit.request(`POST /repos/${owner}/${templateRepo}/pages`, {
    owner,
    name: templateRepo,
    source: {
      branch: 'main',
      path: '/'
    },
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  const { data: { html_url: GitHubPagesBaseURL}} = await octokit.request(`GET /repos/${owner}/${templateRepo}/pages`, {
    owner,
    name: templateRepo,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  const {data: filesList} = await octokit.request(`GET /repos/${owner}/${templateRepo}/contents/`, {
    owner,
    repo: templateRepo,
    path: '/',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  const fileNamesList = filesList
    .filter(({type}) => (type === 'file'))
    .filter(({path: filePath}) => path.extname(filePath) === '.html')
    .map(({name}) => name);
  const hasHTML = fileNamesList.length > 0;
  const hasSingleHTML = fileNamesList.length === 1;
  const hasIndex = fileNamesList.find((name)=>(name === 'index.html')) !== undefined;
  const GitHubPagesURL = (hasHTML && !hasIndex && hasSingleHTML) ? `${GitHubPagesBaseURL}${fileNamesList[0]}`: GitHubPagesBaseURL;

  await octokit.request(`PATCH /repos/${owner}/${templateRepo}`, {
    owner,
    repo: templateRepo,
    is_template: false,
    homepage: GitHubPagesURL,
    headers: {
        'X-GitHub-Api-Version': '2022-11-28'
    }
  });

};

module.exports = {
  copyRepoTo
};
