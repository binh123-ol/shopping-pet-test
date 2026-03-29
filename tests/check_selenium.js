const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test() {
    console.log('Starting builder...');
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    try {
        let driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        console.log('Driver built successfully!');
        await driver.get('https://google.com');
        console.log('Navigated to Google');
        await driver.quit();
        console.log('Driver quit successfully!');
    } catch (err) {
        console.error('Error building driver:', err);
    }
}

test();
