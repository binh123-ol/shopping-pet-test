const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

describe('Simple Test', function() {
    this.timeout(60000);
    let driver;

    before(async function() {
        console.log('Starting builder simple...');
        let options = new chrome.Options();
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        
        const service = new chrome.ServiceBuilder().build();
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .setChromeService(service)
            .build();
        console.log('Builder built simple.');
    });

    after(async function() {
        if (driver) await driver.quit();
    });

    it('Should navigate to google', async function() {
        await driver.get('https://google.com');
        const title = await driver.getTitle();
        expect(title).to.include('Google');
    });
});
