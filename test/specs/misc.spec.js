import {
  ICONS,
  runTest,
  commandBase, logLastRun,
} from "../utils";

const {expect} = require('chai');

describe('Misc.', () => {

  afterEach(function () {
    if (this.currentTest.state == 'failed') {
      logLastRun();
    }
  });

  it('Should not break normal execution.', async () => {
    await runTest(commandBase([], ['successful.spec.js']), (error, stdout, stderr) => {
      expect(stdout).to.not.contain(`error`);
      expect(stdout).to.not.contain(`CypressError`);
      expect(stdout).to.contain(`1 passing`);
    });
  }).timeout(60000);

  it('Should properly set the breaking command in logs.', async () => {
    await runTest(commandBase([], [`waitFail.spec.js`]), (error, stdout, stderr) => {
      expect(stdout).to.contain(`cy:command ${ICONS.error}  get\t.breaking-wait`);
      expect(stdout).to.not.contain(`cy:route ${ICONS.error}`);
      expect(stdout).to.contain(`cy:route ${ICONS.route}  (getComment) GET https://jsonplaceholder.cypress.io/comments/1`);
    });
  }).timeout(60000);

  it('Should be able to disable verbose.', async () => {
    await runTest(commandBase(['generateNestedOutput=1', 'disableVerbose=1'], ['multiple.dots.in.spec.js']), (error, stdout) => {
      expect(stdout).to.not.contain(`[cypress-terminal-report] Wrote custom logs to txt.`);
      expect(stdout).to.not.contain(`[cypress-terminal-report] Wrote custom logs to json.`);
      expect(stdout).to.not.contain(`[cypress-terminal-report] Wrote custom logs to custom.`);
    });
  }).timeout(60000);

  it('Should display correctly in console with multiple contexts.', async () => {
    await runTest(commandBase([], ['mochaContexts.spec.js']), (error, stdout, stderr) => {
      expect(stdout).to.contain(`\n      cy:command ${ICONS.error}  get\t.breaking-get 1\n`);
      expect(stdout).to.contain(`\n        cy:command ${ICONS.error}  get\t.breaking-get 2\n`);
      expect(stdout).to.contain(`\n          cy:command ${ICONS.error}  get\t.breaking-get 3\n`);
    });
  }).timeout(60000);

  it('Should filter and process late update logs correctly.', async () => {
    await runTest(commandBase(['filterKeepOnlyWarningAndError=1,processAllLogs=1'], ['lateCommandUpdate.spec.js']), (error, stdout, stderr) => {
      expect(stdout).to.contain(`cy:command ${ICONS.error}  | get\t.breaking-get`);
      expect(stdout).to.contain(`cy:route ${ICONS.warning}  | (putComment) PUT https://example.cypress.io/comments/10`);
    });
  }).timeout(30000);

  it('Should not send logs outside of tests and it should not break cypress errors.', async () => {
    await runTest(commandBase([], ['errorsOutside.spec.js']), (error, stdout, stderr) => {
      expect(stdout).to.contain(`Cannot call \`cy.log()\` outside a running test.`);
      expect(stdout).to.not.contain(`TypeError: Cannot read property 'relativeFile' of undefined`);
    });
  }).timeout(30000);

  it('Should print logs for all cypress retries.', async () => {
    await runTest(commandBase(['breaking=1'], ['retries.spec.js']), (error, stdout, stderr) => {
      expect(stdout).to.contain(`(Attempt 1 of 3) fails
      cy:command ${ICONS.error}  get\tbreaking


    (Attempt 2 of 3) fails
      cy:command ${ICONS.error}  get\tbreaking


    1) fails
      cy:command ${ICONS.error}  get\tbreaking`);
    });
  }).timeout(30000);

});
