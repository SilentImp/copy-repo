const { Octokit } = require('octokit');

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
    homepage: html_url,
    include_all_branches: false,
    private: false,
    headers: {
        'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  await octokit.request(`POST /repos/${owner}/${templateRepo}/pages`, {
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

  const { html_url: newRepoURL } = await octokit.request(`GET /repos/${owner}/${templateRepo}/pages`, {
    owner,
    name: templateRepo,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  await octokit.request(`PATCH /repos/${owner}/${templateRepo}`, {
    owner,
    name: templateRepo,
    homepage: newRepoURL,
    headers: {
        'X-GitHub-Api-Version': '2022-11-28'
    }
  });

};

module.exports = {
  copyRepoTo
};
