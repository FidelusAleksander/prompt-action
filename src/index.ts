import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    // Get the context of the action
    const context = github.context;

    // Log the event that triggered the action
    core.info(`Event that triggered the action: ${context.eventName}`);

    // You can get inputs defined in action.yml using:
    // const myInput = core.getInput('input-name');

    // Set output
    core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
