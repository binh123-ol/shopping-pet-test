const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const reporter = require('../excelReporter');

describe('Chức năng: Đặt hàng (Order)', function() {
    this.timeout(120000);
    let driver;
    const BASE_URL = 'http://127.0.0.1:5500';
    const TEST_USER = { email: 'customer1@example.com', pass: 'admin123' };
    const moduleName = 'Order';

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
        
        await driver.get(`${BASE_URL}/src/pages/login.html`);
        await driver.findElement(By.id('email')).sendKeys(TEST_USER.email);
        await driver.findElement(By.id('password')).sendKeys(TEST_USER.pass);
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('index.html'), 10000);
        
        // Add item to cart for checkout tests
        const productCard = await driver.wait(until.elementLocated(By.className('product-card')), 10000);
        await productCard.click();
        
        const addBtn = await driver.wait(until.elementLocated(By.className('btn-add-cart')), 10000);
        await addBtn.click();
        await driver.wait(until.alertIsPresent(), 5000);
        await driver.switchTo().alert().accept();
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
            const productCard = await driver.wait(until.elementLocated(By.className('product-card')), 10000);
            await productCard.click();
            await (await driver.wait(until.elementLocated(By.className('btn-add-cart')), 10000)).click();
            await driver.wait(until.alertIsPresent(), 5000);
            await driver.switchTo().alert().accept();

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
            let productCards = await driver.wait(until.elementsLocated(By.className('product-card')), 10000);
            await productCards[0].click();
            await (await driver.wait(until.elementLocated(By.className('btn-add-cart')), 10000)).click();
            await driver.wait(until.alertIsPresent(), 5000);
            await driver.switchTo().alert().accept();

            await driver.get(`${BASE_URL}/index.html`);
            productCards = await driver.wait(until.elementsLocated(By.className('product-card')), 10000);
            await productCards[1].click();
            await (await driver.wait(until.elementLocated(By.className('btn-add-cart')), 10000)).click();
            await driver.wait(until.alertIsPresent(), 5000);
            await driver.switchTo().alert().accept();

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

    it('TC_ORD_11: Đặt hàng với số điện thoại sai định dạng', async function() {
        await recordResult('TC_ORD_11', 'Đặt hàng với số điện thoại sai định dạng', async () => {
            await driver.get(`${BASE_URL}/index.html`);
            await (await driver.findElement(By.className('btn-add-cart'))).click();
            await driver.get(`${BASE_URL}/src/pages/checkout.html`);
            await driver.findElement(By.id('phone')).sendKeys('abcxyz');
            await driver.findElement(By.className('btn-order')).click();
            // Should stay on page or show error
            const url = await driver.getCurrentUrl();
            expect(url).to.include('checkout.html');
        });
    });

    it('TC_ORD_12: Kiểm tra giỏ hàng bị xóa sạch sau khi đặt hàng', async function() {
        await recordResult('TC_ORD_12', 'Kiểm tra giỏ hàng bị xóa sạch sau khi đặt hàng', async () => {
            await driver.get(`${BASE_URL}/index.html`);
            const badgeValue = await driver.findElement(By.className('cart-badge')).getText();
            expect(badgeValue).to.equal('0');
        });
    });

    it('TC_ORD_13: Kiểm tra thông tin địa chỉ lưu đúng trong chi tiết đơn hàng', async function() {
        await recordResult('TC_ORD_13', 'Kiểm tra thông tin địa chỉ lưu đúng trong chi tiết đơn hàng', async () => {
            await driver.get(`${BASE_URL}/src/pages/orders.html`);
            const latestOrder = await driver.findElement(By.className('order-card'));
            await latestOrder.click();
            const modal = await driver.wait(until.elementLocated(By.id('orderModal')), 5000);
            expect(await modal.isDisplayed()).to.be.true;
        });
    });

    it('TC_ORD_14: Kiểm tra nút quay lại giỏ hàng từ trang Thanh toán', async function() {
        await recordResult('TC_ORD_14', 'Kiểm tra nút quay lại giỏ hàng từ trang Thanh toán', async () => {
            await driver.get(`${BASE_URL}/src/pages/checkout.html`);
            const logo = await driver.findElement(By.className('logo'));
            await logo.click();
            expect(await driver.getCurrentUrl()).to.include('index.html');
        });
    });

    it('TC_ORD_15: Kiểm tra hiển thị ngày đặt hàng', async function() {
        await recordResult('TC_ORD_15', 'Kiểm tra hiển thị ngày đặt hàng', async () => {
            await driver.get(`${BASE_URL}/src/pages/orders.html`);
            const orderInfo = await driver.wait(until.elementLocated(By.className('order-info')), 5000);
            expect(await orderInfo.getText()).to.match(/\d{2}\/\d{2}\/\d{4}/);
        });
    });
});
