import { join } from 'node:path';
import { list, repeat, reportsIn, selectors, value, writeRunnerFile } from '@cairul/plugin-kit/runner';
import { junit } from '@cairul/plugin-kit/reports';

const init = `allprojects {
  tasks.withType(org.gradle.api.tasks.testing.Test).configureEach {
    reports.junitXml.required.set(true)
    reports.junitXml.outputLocation.fileValue(new File(System.getenv("CAIRUL_TEST_REPORTS"), path.substring(1).replace(':', '/')))
  }
}`;

export default {
  command: ['gradle'],
  select: selectors({ task: value, tests: list }, ['tests']),
  build({ task = 'test', tests }, temp) {
    const script = join(temp, 'cairul.gradle');
    return {
      args: ['--console=plain', '--rerun-tasks', '--init-script', script, task, ...repeat('--tests', tests)],
      env: { CAIRUL_TEST_REPORTS: temp },
      prepare: () => writeRunnerFile(script, init),
      read: reportsIn('.xml', junit),
    };
  },
};
