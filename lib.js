const { Octokit } = require('octokit');

/**
 * This method create a copy of repository in other organization. Only main branch copied.
 * @param {string} token - token to use GitHub API
 * @param {string} templateOwner - organization from which we copy repository
 * @param {string} templateRepo - name of the repository we copy
 * @param {string} owner - organization where we want to copy repository
 * @param {string} description - description we add to repository
 */

const copyRepo = async ({
  token,
  templateOwner,
  templateRepo,
  owner,
  description,
}) => {
  const octokit = new Octokit({
    auth: token,
  });

  await octokit.request(`POST /repos/${templateOwner}/${templateRepo}/generate`, {
    owner,
    name: templateRepo,
    description,
    include_all_branches: false,
    private: false,
    headers: {
        'X-GitHub-Api-Version': '2022-11-28'
    }
  });
};

module.exports = {
  copyRepo
};
