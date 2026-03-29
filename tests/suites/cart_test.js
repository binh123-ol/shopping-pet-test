const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const reporter = require('../excelReporter');

describe('Chức năng: Thêm vào giỏ hàng (Add to Cart)', function() {
    this.timeout(120000);
    let driver;
    const BASE_URL = 'http://127.0.0.1:5500';
    const TEST_USER = { email: 'user@test.com', pass: '123456' };
    const moduleName = 'Cart';

    before(async function() {
        let options = new chrome.Options();
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
        
        await driver.get(`${BASE_URL}/src/pages/login.html`);
        await driver.findElement(By.id('email')).sendKeys(TEST_USER.email);
        await driver.findElement(By.id('password')).sendKeys(TEST_USER.pass);
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('index.html'), 10000);
    });

    after(async function() {
        if (driver) await driver.quit();
        await reporter.save();
    });

    async function recordResult(id, description, testFn) {
        const start = Date.now();
        try {
            await testFn();
            reporter.addResult(moduleName, id, description, 'Passed', '', Date.now() - start);
        } catch (err) {
            reporter.addResult(moduleName, id, description, 'Failed', err.message, Date.now() - start);
            throw err;
        }
    }

    it('TC_CRT_01: Thêm sản phẩm thành công từ trang chủ', async function() {
        await recordResult('TC_CRT_01', 'Thêm sản phẩm thành công từ trang chủ', async () => {
            await driver.get(`${BASE_URL}/index.html`);
            const addBtn = await driver.wait(until.elementLocated(By.className('btn-add-cart')), 10000);
            await addBtn.click();
            const badge = await driver.findElement(By.className('cart-badge'));
            expect(await badge.getText()).to.not.equal('0');
        });
    });

    it('TC_CRT_02: Kiểm tra Badge giỏ hàng tăng lên khi thêm sản phẩm', async function() {
        await recordResult('TC_CRT_02', 'Kiểm tra Badge giỏ hàng tăng lên khi thêm sản phẩm', async () => {
            const badge = await driver.findElement(By.className('cart-badge'));
            const countBefore = parseInt(await badge.getText());
            const addBtns = await driver.findElements(By.className('btn-add-cart'));
            await addBtns[1].click();
            await driver.sleep(1000);
            const countAfter = parseInt(await badge.getText());
            expect(countAfter).to.be.greaterThan(countBefore);
        });
    });

    it('TC_CRT_03: Thêm sản phẩm từ trang chi tiết sản phẩm', async function() {
        await recordResult('TC_CRT_03', 'Thêm sản phẩm từ trang chi tiết sản phẩm', async () => {
            await driver.get(`${BASE_URL}/index.html`);
            const productCard = await driver.wait(until.elementLocated(By.className('product-card')), 10000);
            await productCard.click();
            await driver.wait(until.urlContains('product-detail.html'), 10000);
            const addBtn = await driver.wait(until.elementLocated(By.className('btn-add-cart')), 10000);
            await addBtn.click();
            const badge = await driver.findElement(By.className('cart-badge'));
            expect(await badge.getText()).to.not.equal('0');
        });
    });

    it('TC_CRT_04: Thêm nhiều sản phẩm khác nhau vào giỏ hàng', async function() {
        await recordResult('TC_CRT_04', 'Thêm nhiều sản phẩm khác nhau vào giỏ hàng', async () => {
            await driver.get(`${BASE_URL}/index.html`);
            const addBtns = await driver.findElements(By.className('btn-add-cart'));
            await addBtns[0].click();
            await driver.sleep(500);
            await addBtns[2].click();
            await driver.sleep(500);
            const badge = await driver.findElement(By.className('cart-badge'));
            expect(parseInt(await badge.getText())).to.be.at.least(2);
        });
    });

    it('TC_CRT_05: Thêm cùng một sản phẩm nhiều lần', async function() {
        await recordResult('TC_CRT_05', 'Thêm cùng một sản phẩm nhiều lần', async () => {
            await driver.get(`${BASE_URL}/index.html`);
            const addBtn = await driver.findElement(By.className('btn-add-cart'));
            await addBtn.click();
            await driver.sleep(500);
            await addBtn.click();
            await driver.sleep(500);
            const badge = await driver.findElement(By.className('cart-badge'));
            expect(parseInt(await badge.getText())).to.be.at.least(1);
        });
    });

    it('TC_CRT_06: Thêm sản phẩm khi chưa đăng nhập', async function() {
        await recordResult('TC_CRT_06', 'Thêm sản phẩm khi chưa đăng nhập', async () => {
            await driver.executeScript('localStorage.clear();');
            await driver.get(`${BASE_URL}/index.html`);
            const addBtn = await driver.wait(until.elementLocated(By.className('btn-add-cart')), 10000);
            await addBtn.click();
            await driver.wait(until.urlContains('index.html'), 5000); 
        });
    });

    it('TC_CRT_07: Kiểm tra sản phẩm trong giỏ hàng khớp với sản phẩm đã chọn', async function() {
        await recordResult('TC_CRT_07', 'Kiểm tra sản phẩm trong giỏ hàng khớp với sản phẩm đã chọn', async () => {
            await driver.get(`${BASE_URL}/src/pages/login.html`);
            await driver.findElement(By.id('email')).sendKeys(TEST_USER.email);
            await driver.findElement(By.id('password')).sendKeys(TEST_USER.pass);
            await driver.findElement(By.css('button[type="submit"]')).click();
            await driver.wait(until.urlContains('index.html'), 10000);

            const firstProduct = await driver.wait(until.elementLocated(By.className('product-card')), 10000);
            const productName = await firstProduct.findElement(By.className('product-name')).getText();
            await firstProduct.findElement(By.className('btn-add-cart')).click();
            
            await driver.get(`${BASE_URL}/src/pages/cart.html`);
            const cartItemName = await driver.wait(until.elementLocated(By.className('cart-item-name')), 10000).getText();
            expect(cartItemName).to.equal(productName);
        });
    });

    it('TC_CRT_08: Badge giỏ hàng cập nhật ngay lập tức', async function() {
        await recordResult('TC_CRT_08', 'Badge giỏ hàng cập nhật ngay lập tức', async () => {
            await driver.get(`${BASE_URL}/index.html`);
            const addBtn = await driver.findElement(By.className('btn-add-cart'));
            await addBtn.click();
            const badge = await driver.findElement(By.className('cart-badge'));
            expect(await badge.getText()).to.not.equal('0');
        });
    });

    it('TC_CRT_09: Thêm sản phẩm sau khi tìm kiếm', async function() {
        await recordResult('TC_CRT_09', 'Thêm sản phẩm sau khi tìm kiếm', async () => {
            const searchInput = await driver.findElement(By.id('searchInput'));
            await searchInput.sendKeys('Chó');
            await driver.findElement(By.id('searchBtn')).click();
            await driver.sleep(1000);
            const addBtn = await driver.wait(until.elementLocated(By.className('btn-add-cart')), 5000);
            await addBtn.click();
            expect(await driver.findElement(By.className('cart-badge')).getText()).to.not.equal('0');
        });
    });

    it('TC_CRT_10: Thêm sản phẩm sau khi lọc theo danh mục', async function() {
        await recordResult('TC_CRT_10', 'Thêm sản phẩm sau khi lọc theo danh mục', async () => {
            await driver.get(`${BASE_URL}/index.html`);
            await driver.findElement(By.css('[data-category="dog"]')).click();
            await driver.sleep(1000);
            const addBtn = await driver.wait(until.elementLocated(By.className('btn-add-cart')), 5000);
            await addBtn.click();
            expect(await driver.findElement(By.className('cart-badge')).getText()).to.not.equal('0');
        });
    });
});
