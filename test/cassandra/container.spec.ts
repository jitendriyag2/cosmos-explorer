import "expect-puppeteer";
import crypto from 'crypto'

jest.setTimeout(300000);
const RENDER_DELAY = 400
const LOADING_STATE_DELAY = 1800

describe('Collection Add and Delete Cassandra spec', () => {
  it('creates a collection', async () => {
    try {
      const keyspaceId = `keyspaceid${crypto.randomBytes(8).toString("hex")}`;
      const tableId = `tableid${crypto.randomBytes(3).toString('hex')}`;
      const prodUrl = "https://localhost:1234/hostedExplorer.html";
      page.goto(prodUrl);

      // log in with connection string
      const handle = await page.waitForSelector('iframe');
      const frame = await handle.contentFrame();
      await frame.waitFor('div > p.switchConnectTypeText', { visible: true });
      await frame.click('div > p.switchConnectTypeText');
      const connStr = process.env.CASSANDRA_CONNECTION_STRING;
      await frame.type("input[class='inputToken']", connStr);
      await frame.click("input[value='Connect']");

      // create new table
      await frame.waitFor('button[data-test="New Table"]', { visible: true });
      await frame.waitForSelector('div[class="splashScreen"] > div[class="title"]', { visible: true });
      await frame.click('button[data-test="New Table"]');      

      // type keyspace id
      await frame.waitFor('input[id="keyspace-id"]', { visible: true });
      await frame.type('input[id="keyspace-id"]', keyspaceId);      

      // type table id
      await frame.waitFor('input[class="textfontclr"]');
      await frame.type('input[class="textfontclr"]', tableId); 

      // click submit
      await frame.waitFor('#cassandraaddcollectionpane > div > form > div.paneFooter > div > input');
      await frame.click('#cassandraaddcollectionpane > div > form > div.paneFooter > div > input');

      // open database menu
      await frame.waitForSelector('div[class="splashScreen"] > div[class="title"]', { visible: true });

      await frame.waitFor(`div[data-test="${keyspaceId}"]`, { visible: true });
      await frame.waitFor(LOADING_STATE_DELAY)
      await frame.waitFor(`div[data-test="${keyspaceId}"]`, { visible: true });
      await frame.click(`div[data-test="${keyspaceId}"]`);
      await frame.waitFor(`span[title="${tableId}"]`, { visible: true });

      // delete container

      // click context menu for container
      await frame.waitFor(`div[data-test="${tableId}"] > div > button`, { visible: true });
      await frame.click(`div[data-test="${tableId}"] > div > button`);

      // click delete container
      await frame.waitForSelector('body > div.ms-Layer.ms-Layer--fixed');
      await frame.waitFor(RENDER_DELAY)
      const elements = await frame.$$('span[class="treeComponentMenuItemLabel deleteCollectionMenuItemLabel"]')
      await elements[0].click()

      // confirm delete container
      await frame.type('input[data-test="confirmCollectionId"]', tableId.trim());

      // click delete
      await frame.click('input[data-test="deleteCollection"]');
      await frame.waitFor(LOADING_STATE_DELAY);
      await frame.waitForSelector('div[class="splashScreen"] > div[class="title"]', { visible: true });

      await expect(page).not.toMatchElement(`div[data-test="${tableId}"]`);

      // click context menu for database
      await frame.waitFor(`div[data-test="${keyspaceId}"] > div > button`);
      const button = await frame.$(`div[data-test="${keyspaceId}"] > div > button`);
      await button.focus();
      await button.asElement().click();

      // click delete database
      await frame.waitFor(RENDER_DELAY);
      const dbElements = await frame.$$('span[class="treeComponentMenuItemLabel deleteDatabaseMenuItemLabel"]')
      await dbElements[0].click();

      // confirm delete database
      await frame.type('input[data-test="confirmDatabaseId"]', keyspaceId.trim());

      // click delete
      await frame.click('input[data-test="deleteDatabase"]');
      await frame.waitForSelector('div[class="splashScreen"] > div[class="title"]', { visible: true });
      await expect(page).not.toMatchElement(`div[data-test="${keyspaceId}"]`);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const testName = (expect as any).getState().currentTestName
      await page.screenshot({path: `Test Failed ${testName}.png`});
      throw error;
    } 
  });
});