#! /usr/bin/env node

const { program } = require('commander');
const packageJSON = require("./package.json");
const { copyRepo } = require('./lib');

program
  .name(packageJSON.name)
  .description(packageJSON.description)
  .version(packageJSON.version)
  .requiredOption('-t, --token <string>', 'user personal token, which we use for GitHub auth')
  .option('-o, --oldOwner <string>', 'repository owner name: user or organisation', 'prjctr-ytb')
  .requiredOption('-r, --repo <string>', 'name of the repository we want to copy')
  .option('-n, --newOwner <string>', 'name of organization we are copying repo to', 'prjctr-ytb-code')
  .option('--desc <string>', 'description of the repository that will be added to the repository', '')
  .action(async (options) => {
    const {
      oldOwner: templateOwner,
      repo: templateRepo,
      token,
      newOwner: owner,
      desc: description,
    } = options;
    try {

      await copyRepo({
        token,
        templateOwner,
        templateRepo,
        owner,
        description,
      });

    } catch (error) {
      program.error(error.message);
    }
  });


program.parse();
