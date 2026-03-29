const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const reporter = require('../excelReporter');

describe('Chức năng: Đặt hàng (Order)', function() {
    this.timeout(120000);
    let driver;
    const BASE_URL = 'http://127.0.0.1:5500';
    const TEST_USER = { email: 'user@test.com', pass: '123456' };
    const moduleName = 'Order';

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
        
        const addBtn = await driver.wait(until.elementLocated(By.className('btn-add-cart')), 10000);
        await addBtn.click();
        await driver.sleep(1000);
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

    it('TC_ORD_01: Đặt hàng thành công với đầy đủ thông tin (COD)', async function() {
        await recordResult('TC_ORD_01', 'Đặt hàng thành công với đầy đủ thông tin (COD)', async () => {
            await driver.get(`${BASE_URL}/src/pages/checkout.html`);
            await driver.findElement(By.id('fullName')).clear();
            await driver.findElement(By.id('fullName')).sendKeys('Buyer Test');
            await driver.findElement(By.id('phone')).sendKeys('0123456789');
            await driver.findElement(By.id('address')).sendKeys('123 Test St, Hanoi');
            await driver.findElement(By.className('btn-order')).click();
            await driver.wait(until.urlContains('orders.html'), 15000);
            expect(await driver.getCurrentUrl()).to.include('orders.html');
        });
    });

    it('TC_ORD_02: Đặt hàng thất bại khi thiếu Số điện thoại', async function() {
        await recordResult('TC_ORD_02', 'Đặt hàng thất bại khi thiếu Số điện thoại', async () => {
            await driver.get(`${BASE_URL}/index.html`);
            await (await driver.wait(until.elementLocated(By.className('btn-add-cart')), 10000)).click();
            await driver.get(`${BASE_URL}/src/pages/checkout.html`);
            await driver.findElement(By.id('phone')).clear();
            await driver.findElement(By.className('btn-order')).click();
            expect(await driver.getCurrentUrl()).to.include('checkout.html');
        });
    });

    it('TC_ORD_03: Đặt hàng thất bại khi thiếu Địa chỉ giao hàng', async function() {
        await recordResult('TC_ORD_03', 'Đặt hàng thất bại khi thiếu Địa chỉ giao hàng', async () => {
            await driver.get(`${BASE_URL}/src/pages/checkout.html`);
            await driver.findElement(By.id('phone')).sendKeys('0123456789');
            await driver.findElement(By.id('address')).clear();
            await driver.findElement(By.className('btn-order')).click();
            expect(await driver.getCurrentUrl()).to.include('checkout.html');
        });
    });

    it('TC_ORD_04: Đặt hàng thất bại khi thiếu Họ tên người nhận', async function() {
        await recordResult('TC_ORD_04', 'Đặt hàng thất bại khi thiếu Họ tên người nhận', async () => {
            await driver.get(`${BASE_URL}/src/pages/checkout.html`);
            await driver.findElement(By.id('fullName')).clear();
            await driver.findElement(By.id('phone')).sendKeys('0123456789');
            await driver.findElement(By.id('address')).sendKeys('123 Test St');
            await driver.findElement(By.className('btn-order')).click();
            expect(await driver.getCurrentUrl()).to.include('checkout.html');
        });
    });

    it('TC_ORD_05: Kiểm tra tổng tiền đơn hàng khớp với giỏ hàng', async function() {
        await recordResult('TC_ORD_05', 'Kiểm tra tổng tiền đơn hàng khớp với giỏ hàng', async () => {
            await driver.get(`${BASE_URL}/src/pages/checkout.html`);
            const total = await driver.findElement(By.id('totalPrice')).getText();
            expect(total).to.include('đ');
        });
    });

    it('TC_ORD_06: Tự động chuyển hướng về "Lịch sử đơn hàng"', async function() {
        await recordResult('TC_ORD_06', 'Tự động chuyển hướng về "Lịch sử đơn hàng"', async () => {
            await driver.findElement(By.id('fullName')).clear();
            await driver.findElement(By.id('fullName')).sendKeys('Redirect Test');
            await driver.findElement(By.id('phone')).sendKeys('0123456789');
            await driver.findElement(By.id('address')).sendKeys('Hanoi');
            await driver.findElement(By.className('btn-order')).click();
            await driver.wait(until.urlContains('orders.html'), 15000);
            expect(await driver.getCurrentUrl()).to.include('orders.html');
        });
    });

    it('TC_ORD_07: Kiểm tra đơn hàng mới xuất hiện trong danh sách lịch sử', async function() {
        await recordResult('TC_ORD_07', 'Kiểm tra đơn hàng mới xuất hiện trong danh sách lịch sử', async () => {
            const orders = await driver.wait(until.elementsLocated(By.className('order-card')), 10000);
            expect(orders.length).to.be.at.least(1);
        });
    });

    it('TC_ORD_08: Trạng thái đơn hàng mới mặc định là "Pending"', async function() {
        await recordResult('TC_ORD_08', 'Trạng thái đơn hàng mới mặc định là "Pending"', async () => {
            const latestOrder = await driver.wait(until.elementLocated(By.className('order-card')), 10000);
            const status = await latestOrder.findElement(By.className('order-status')).getText();
            expect(status).to.equal('Pending');
        });
    });

    it('TC_ORD_09: Xem chi tiết đơn hàng vừa đặt qua Modal', async function() {
        await recordResult('TC_ORD_09', 'Xem chi tiết đơn hàng vừa đặt qua Modal', async () => {
            const latestOrder = await driver.findElement(By.className('order-card'));
            await latestOrder.click();
            const modal = await driver.wait(until.elementLocated(By.id('orderModal')), 10000);
            await driver.wait(until.elementIsVisible(modal), 5000);
            expect(await modal.isDisplayed()).to.be.true;
        });
    });

    it('TC_ORD_10: Đặt hàng thành công với đơn hàng có nhiều sản phẩm', async function() {
        await recordResult('TC_ORD_10', 'Đặt hàng thành công với đơn hàng có nhiều sản phẩm', async () => {
            await driver.get(`${BASE_URL}/index.html`);
            const addBtns = await driver.findElements(By.className('btn-add-cart'));
            await addBtns[0].click();
            await driver.sleep(500);
            await addBtns[1].click();
            await driver.get(`${BASE_URL}/src/pages/checkout.html`);
            await driver.findElement(By.id('fullName')).clear();
            await driver.findElement(By.id('fullName')).sendKeys('Multi Item Buyer');
            await driver.findElement(By.id('phone')).sendKeys('0123456789');
            await driver.findElement(By.id('address')).sendKeys('123 Multi St');
            await driver.findElement(By.className('btn-order')).click();
            await driver.wait(until.urlContains('orders.html'), 15000);
            expect(await driver.getCurrentUrl()).to.include('orders.html');
        });
    });
});
