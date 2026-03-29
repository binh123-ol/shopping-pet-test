const Mocha = require('mocha');
const path = require('path');
const reporter = require('./excelReporter');

async function run() {
    const mocha = new Mocha({
        timeout: 120000,
        reporter: 'spec'
    });

    const suites = [
        'suites/register_test.js',
        'suites/login_test.js',
        'suites/cart_test.js',
        'suites/order_test.js'
    ];

    suites.forEach(file => {
        mocha.addFile(path.join(__dirname, file));
    });

    mocha.run(async (failures) => {
        console.log(`Tests finished with ${failures} failures.`);
        await reporter.save();
        process.exitCode = failures ? 1 : 0;
    });
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
