const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const reporter = require('../excelReporter');

describe('Chức năng: Đăng ký (Register)', function() {
    this.timeout(60000);
    let driver;
    const BASE_URL = 'http://127.0.0.1:5500';
    const moduleName = 'Register';

    before(async function() {
        let options = new chrome.Options();
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    });

    after(async function() {
        if (driver) await driver.quit();
        await reporter.save(); // Save after each suite for safety
    });

    const randomEmail = () => `reg_test_${Math.floor(Math.random() * 100000)}@gmail.com`;
    const validUser = { name: 'User Test', email: randomEmail(), pass: '123456' };

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

    it('TC_REG_01: Đăng ký thành công với thông tin hợp lệ', async function() {
        await recordResult('TC_REG_01', 'Đăng ký thành công với thông tin hợp lệ', async () => {
            await driver.get(`${BASE_URL}/src/pages/register.html`);
            await driver.findElement(By.id('fullName')).sendKeys(validUser.name);
            await driver.findElement(By.id('email')).sendKeys(validUser.email);
            await driver.findElement(By.id('password')).sendKeys(validUser.pass);
            await driver.findElement(By.css('button[type="submit"]')).click();
            
            const msg = await driver.wait(until.elementLocated(By.id('successMessage')), 10000);
            await driver.wait(async () => (await msg.getText()).length > 0, 5000);
            expect(await msg.getText()).to.include('thành công');
        });
    });

    it('TC_REG_02: Đăng ký thất bại khi để trống tất cả các trường', async function() {
        await recordResult('TC_REG_02', 'Đăng ký thất bại khi để trống tất cả các trường', async () => {
            await driver.get(`${BASE_URL}/src/pages/register.html`);
            await driver.findElement(By.css('button[type="submit"]')).click();
            const success = await driver.findElement(By.id('successMessage'));
            expect(await success.isDisplayed()).to.be.false;
        });
    });

    it('TC_REG_03: Đăng ký thất bại với email đã tồn tại', async function() {
        await recordResult('TC_REG_03', 'Đăng ký thất bại với email đã tồn tại', async () => {
            await driver.get(`${BASE_URL}/src/pages/register.html`);
            await driver.findElement(By.id('fullName')).sendKeys('Duplicate');
            await driver.findElement(By.id('email')).sendKeys(validUser.email);
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[type="submit"]')).click();
            const err = await driver.wait(until.elementLocated(By.id('errorMessage')), 10000);
            const text = await err.getText();
            expect(text).to.satisfy(t => t.includes('tồn tại') || t.includes('đã được sử dụng'));
        });
    });

    it('TC_REG_04: Đăng ký thất bại khi nhập email sai định dạng', async function() {
        await recordResult('TC_REG_04', 'Đăng ký thất bại khi nhập email sai định dạng', async () => {
            await driver.get(`${BASE_URL}/src/pages/register.html`);
            await driver.findElement(By.id('email')).sendKeys('invalid-email');
            await driver.findElement(By.css('button[type="submit"]')).click();
            const url = await driver.getCurrentUrl();
            expect(url).to.include('register.html');
        });
    });

    it('TC_REG_05: Đăng ký thất bại khi mật khẩu quá ngắn', async function() {
        await recordResult('TC_REG_05', 'Đăng ký thất bại khi mật khẩu quá ngắn', async () => {
            await driver.get(`${BASE_URL}/src/pages/register.html`);
            await driver.findElement(By.id('fullName')).sendKeys('Short Pass');
            await driver.findElement(By.id('email')).sendKeys(randomEmail());
            await driver.findElement(By.id('password')).sendKeys('123');
            await driver.findElement(By.css('button[type="submit"]')).click();
            const err = await driver.wait(until.elementLocated(By.id('errorMessage')), 5000);
            expect(await err.isDisplayed()).to.be.true;
        });
    });

    it('TC_REG_06: Đăng ký thất bại khi để trống tên người dùng', async function() {
        await recordResult('TC_REG_06', 'Đăng ký thất bại khi để trống tên người dùng', async () => {
            await driver.get(`${BASE_URL}/src/pages/register.html`);
            await driver.findElement(By.id('email')).sendKeys(randomEmail());
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[type="submit"]')).click();
            const success = await driver.findElement(By.id('successMessage'));
            expect(await success.isDisplayed()).to.be.false;
        });
    });

    it('TC_REG_07: Đăng ký thành công với email có khoảng trắng ở đầu/cuối', async function() {
        await recordResult('TC_REG_07', 'Đăng ký thành công với email có khoảng trắng ở đầu/cuối', async () => {
            await driver.get(`${BASE_URL}/src/pages/register.html`);
            const emailWithSpace = `  ${randomEmail()}  `;
            await driver.findElement(By.id('fullName')).sendKeys('Trim Test');
            await driver.findElement(By.id('email')).sendKeys(emailWithSpace);
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[type="submit"]')).click();
            const msg = await driver.wait(until.elementLocated(By.id('successMessage')), 10000);
            expect(await msg.getText()).to.include('thành công');
        });
    });

    it('TC_REG_08: Kiểm tra nút "Đăng nhập" dẫn về trang login.html', async function() {
        await recordResult('TC_REG_08', 'Kiểm tra nút "Đăng nhập" dẫn về trang login.html', async () => {
            await driver.get(`${BASE_URL}/src/pages/register.html`);
            await driver.findElement(By.linkText('Đăng nhập')).click();
            expect(await driver.getCurrentUrl()).to.include('login.html');
        });
    });

    it('TC_REG_09: Kiểm tra thông báo thành công hiển thị đúng nội dung', async function() {
        await recordResult('TC_REG_09', 'Kiểm tra thông báo thành công hiển thị đúng nội dung', async () => {
            await driver.get(`${BASE_URL}/src/pages/register.html`);
            await driver.findElement(By.id('fullName')).sendKeys('Content Test');
            await driver.findElement(By.id('email')).sendKeys(randomEmail());
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[type="submit"]')).click();
            const msg = await driver.wait(until.elementLocated(By.id('successMessage')), 10000);
            expect(await msg.getText()).to.include('đăng ký thành công');
        });
    });

    it('TC_REG_10: Tự động chuyển hướng sang trang Login sau khi đăng ký', async function() {
        await recordResult('TC_REG_10', 'Tự động chuyển hướng sang trang Login sau khi đăng ký', async () => {
            await driver.get(`${BASE_URL}/src/pages/register.html`);
            await driver.findElement(By.id('fullName')).sendKeys('Redirect Test');
            await driver.findElement(By.id('email')).sendKeys(randomEmail());
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[type="submit"]')).click();
            await driver.wait(until.urlContains('login.html'), 10000);
            expect(await driver.getCurrentUrl()).to.include('login.html');
        });
    });
});
