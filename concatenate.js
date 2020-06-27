const fs = require('fs-extra');
const concat = require('concat');
(async function build() {
    const files = [
        './dist/alpdesk-automationclient/runtime.js',
        './dist/alpdesk-automationclient/polyfills.js',
        //'./dist/alpdesk-automationclient/scripts.js',
        './dist/alpdesk-automationclient/main.js',
    ]
    await fs.ensureDir('elements')
    await concat(files, 'elements/alpdesk-elements.js');
    await fs.copyFile('./dist/alpdesk-automationclient/styles.css', 'elements/styles.css')
    await fs.copy('./dist/alpdesk-automationclient/assets/', 'elements/assets/')
})()
