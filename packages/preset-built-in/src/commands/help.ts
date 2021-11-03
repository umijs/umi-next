import { chalk, lodash, logger } from '@umijs/utils';
import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'help',
    description: 'show commands help',
    details: `
umi help build
umi help dev
`,
    fn() {
      const subCommand = api.args._[0];
      if (subCommand) {
        if (subCommand in api.service.commands) {
          if (
            api.service.commands[subCommand].name === 'g' ||
            api.service.commands[subCommand].name === 'generate'
          ) {
            showGenerateHelp(
              api.service.commands[subCommand],
              api.service.generators,
            );
          } else {
            showHelp(api.service.commands[subCommand]);
          }
        } else {
          logger.error(`Invalid sub command ${subCommand}.`);
        }
      } else {
        showHelps(api.service.commands);
      }
    },
  });

  function showGenerateHelp(command: any, generators: any) {
    console.log(`
Usage: umi ${command.name} [type] [options]
${command.description ? `${chalk.gray(command.description)}.\n` : ''}
${command.options ? `Options:\n${padLeft(command.options)}\n` : ''}
${command.details ? `Details:\n${padLeft(command.details)}` : ''}
Types:

${getDeps(generators)}
`);
  }

  function showHelp(command: any) {
    console.log(`
Usage: umi ${command.name} [options]
${command.description ? `${chalk.gray(command.description)}.\n` : ''}
${command.options ? `Options:\n${padLeft(command.options)}\n` : ''}
${command.details ? `Details:\n${padLeft(command.details)}` : ''}
`);
  }

  function showHelps(commands: typeof api.service.commands) {
    console.log(`
Usage: umi <command> [options]

Commands:

${getDeps(commands)}
`);
    console.log(
      `Run \`${chalk.bold(
        'umi help <command>',
      )}\` for more information of specific commands.`,
    );
    console.log(
      `Visit ${chalk.bold('https://umijs.org/')} to learn more about Umi.`,
    );
    console.log();
  }

  function getDeps(commands: any) {
    return Object.keys(commands)
      .map((key) => {
        return `    ${chalk.green(lodash.padEnd(key, 10))}${
          commands[key].description || ''
        }`;
      })
      .join('\n');
  }

  function padLeft(str: string) {
    return str
      .trim()
      .split('\n')
      .map((line: string) => `    ${line}`)
      .join('\n');
  }
};
