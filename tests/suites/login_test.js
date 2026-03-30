const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const reporter = require('../excelReporter');

describe('Chức năng: Đăng nhập (Login)', function() {
    this.timeout(60000);
    let driver;
    const BASE_URL = 'http://127.0.0.1:5500';
    const TEST_USER = { email: 'customer1@example.com', pass: 'admin123' };
    const ADMIN_USER = { email: 'admin@shoppet.vn', pass: 'admin123' };
    const moduleName = 'Login';

    before(async function() {
        let options = new chrome.Options();
        // options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu'); // Fix AMD GPU errors
        options.addArguments('--disable-software-rasterizer');
        options.addArguments('--disable-features=CalculateNativeWinOcclusion');
        options.addArguments('--disable-notifications');
        options.addArguments('--disable-popup-blocking');
        options.addArguments('--disable-features=PasswordLeakDetection'); // Hard disable leak detection
        options.addArguments('--password-store=basic'); // Use basic password store
        
        // Disable password manager and leak detection popups
        options.setUserPreferences({
            'credentials_enable_service': false,
            'profile.password_manager_enabled': false,
            'profile.password_manager_leak_detection': false, // Explicitly disable leak detection pref
            'autofill.profile_enabled': false,
            'autofill.password_enabled': false
        });

        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
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

    it('TC_LOG_01: Đăng nhập thành công với tài khoản User', async function() {
        await recordResult('TC_LOG_01', 'Đăng nhập thành công với tài khoản User', async () => {
            await driver.get(`${BASE_URL}/src/pages/login.html`);
            await driver.findElement(By.id('email')).sendKeys(TEST_USER.email);
            await driver.findElement(By.id('password')).sendKeys(TEST_USER.pass);
            await driver.findElement(By.css('button[type="submit"]')).click();
            await driver.wait(until.urlContains('index.html'), 20000);
            expect(await driver.getCurrentUrl()).to.include('index.html');
        });
    });

    it('TC_LOG_02: Đăng nhập thành công với tài khoản Admin', async function() {
        await recordResult('TC_LOG_02', 'Đăng nhập thành công với tài khoản Admin', async () => {
            await driver.get(`${BASE_URL}/src/pages/login.html`);
            await driver.findElement(By.id('email')).sendKeys(ADMIN_USER.email);
            await driver.findElement(By.id('password')).sendKeys(ADMIN_USER.pass);
            await driver.findElement(By.css('button[type="submit"]')).click();
            await driver.wait(until.urlContains('admin.html'), 10000);
            expect(await driver.getCurrentUrl()).to.include('admin.html');
        });
    });

    it('TC_LOG_03: Đăng nhập thất bại khi sai mật khẩu', async function() {
        await recordResult('TC_LOG_03', 'Đăng nhập thất bại khi sai mật khẩu', async () => {
            await driver.get(`${BASE_URL}/src/pages/login.html`);
            await driver.findElement(By.id('email')).sendKeys(TEST_USER.email);
            await driver.findElement(By.id('password')).sendKeys('wrongpass');
            await driver.findElement(By.css('button[type="submit"]')).click();
            const err = await driver.wait(until.elementLocated(By.id('errorMessage')), 10000);
            expect(await err.isDisplayed()).to.be.true;
        });
    });

    it('TC_LOG_04: Đăng nhập thất bại với email không tồn tại', async function() {
        await recordResult('TC_LOG_04', 'Đăng nhập thất bại với email không tồn tại', async () => {
            await driver.get(`${BASE_URL}/src/pages/login.html`);
            await driver.findElement(By.id('email')).sendKeys('notfound@test.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[type="submit"]')).click();
            const err = await driver.wait(until.elementLocated(By.id('errorMessage')), 10000);
            expect(await err.getText()).to.include('không tồn tại');
        });
    });

    it('TC_LOG_05: Đăng nhập thất bại khi để trống email', async function() {
        await recordResult('TC_LOG_05', 'Đăng nhập thất bại khi để trống email', async () => {
            await driver.get(`${BASE_URL}/src/pages/login.html`);
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[type="submit"]')).click();
            const err = await driver.findElement(By.id('errorMessage'));
            expect(await err.isDisplayed()).to.be.false; 
        });
    });

    it('TC_LOG_06: Đăng nhập thất bại khi để trống mật khẩu', async function() {
        await recordResult('TC_LOG_06', 'Đăng nhập thất bại khi để trống mật khẩu', async () => {
            await driver.get(`${BASE_URL}/src/pages/login.html`);
            await driver.findElement(By.id('email')).sendKeys(TEST_USER.email);
            await driver.findElement(By.css('button[type="submit"]')).click();
            const err = await driver.findElement(By.id('errorMessage'));
            expect(await err.isDisplayed()).to.be.false;
        });
    });

    it('TC_LOG_07: Đăng nhập thất bại khi email sai định dạng', async function() {
        await recordResult('TC_LOG_07', 'Đăng nhập thất bại khi email sai định dạng', async () => {
            await driver.get(`${BASE_URL}/src/pages/login.html`);
            await driver.findElement(By.id('email')).sendKeys('invalid-email');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.css('button[type="submit"]')).click();
            const url = await driver.getCurrentUrl();
            expect(url).to.include('login.html');
        });
    });

    it('TC_LOG_08: Kiểm tra Token được lưu vào LocalStorage sau khi đăng nhập', async function() {
        await recordResult('TC_LOG_08', 'Kiểm tra Token được lưu vào LocalStorage sau khi đăng nhập', async () => {
            await driver.get(`${BASE_URL}/src/pages/login.html`);
            await driver.findElement(By.id('email')).sendKeys(TEST_USER.email);
            await driver.findElement(By.id('password')).sendKeys(TEST_USER.pass);
            await driver.findElement(By.css('button[type="submit"]')).click();
            await driver.wait(until.urlContains('index.html'), 10000);
            const token = await driver.executeScript('return localStorage.getItem("token");');
            expect(token).to.not.be.null;
        });
    });

    it('TC_LOG_09: Kiểm tra nút "Đăng ký" dẫn về trang register.html', async function() {
        await recordResult('TC_LOG_09', 'Kiểm tra nút "Đăng ký" dẫn về trang register.html', async () => {
            await driver.get(`${BASE_URL}/src/pages/login.html`);
            await driver.findElement(By.linkText('Đăng ký ngay')).click();
            expect(await driver.getCurrentUrl()).to.include('register.html');
        });
    });

    it('TC_LOG_10: Kiểm tra trạng thái đăng nhập được duy trì sau khi tải lại trang (F5)', async function() {
        await recordResult('TC_LOG_10', 'Kiểm tra trạng thái đăng nhập được duy trì sau khi tải lại trang (F5)', async () => {
            await driver.get(`${BASE_URL}/index.html`);
            await driver.navigate().refresh();
            const token = await driver.executeScript('return localStorage.getItem("token");');
            expect(token).to.not.be.null;
        });
    });

    it('TC_LOG_11: Đăng xuất thành công', async function() {
        await recordResult('TC_LOG_11', 'Đăng xuất thành công', async () => {
            await driver.get(`${BASE_URL}/index.html`);
            const logoutBtn = await driver.wait(until.elementLocated(By.linkText('Đăng xuất')), 10000);
            await logoutBtn.click();
            await driver.wait(until.urlContains('index.html'), 10000);
            const token = await driver.executeScript('return localStorage.getItem("token");');
            expect(token).to.be.null;
        });
    });

    it('TC_LOG_12: Đăng nhập với Email viết hoa', async function() {
        await recordResult('TC_LOG_12', 'Đăng nhập với Email viết hoa', async () => {
            await driver.get(`${BASE_URL}/src/pages/login.html`);
            await driver.findElement(By.id('email')).sendKeys(TEST_USER.email.toUpperCase());
            await driver.findElement(By.id('password')).sendKeys(TEST_USER.pass);
            await driver.findElement(By.css('button[type="submit"]')).click();
            await driver.wait(until.urlContains('index.html'), 10000);
            expect(await driver.getCurrentUrl()).to.include('index.html');
        });
    });

    it('TC_LOG_13: Truy cập trang Login khi đã đăng nhập', async function() {
        await recordResult('TC_LOG_13', 'Truy cập trang Login khi đã đăng nhập', async () => {
            await driver.get(`${BASE_URL}/src/pages/login.html`);
            // Should redirect to index or show user is logged in
            const url = await driver.getCurrentUrl();
            // expect(url).to.include('index.html');
        });
    });

    it('TC_LOG_14: Kiểm tra hiển thị tên người dùng trên Header', async function() {
        await recordResult('TC_LOG_14', 'Kiểm tra hiển thị tên người dùng trên Header', async () => {
            await driver.get(`${BASE_URL}/index.html`);
            const welcomeMsg = await driver.wait(until.elementLocated(By.id('authLinks')), 10000);
            expect(await welcomeMsg.getText()).to.include('Chào');
        });
    });

    it('TC_LOG_15: Kiểm tra thông tin liên hệ ở chân trang Login', async function() {
        await recordResult('TC_LOG_15', 'Kiểm tra thông tin liên hệ ở chân trang Login', async () => {
            await driver.get(`${BASE_URL}/src/pages/login.html`);
            const footer = await driver.findElement(By.className('auth-footer'));
            expect(await footer.isDisplayed()).to.be.true;
        });
    });
});
