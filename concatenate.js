const fs = require('fs-extra');
const concat = require('concat');
(async function build() {
    const files = [
        './dist/alpdesk-automationclient/runtime-es2015.js',
        './dist/alpdesk-automationclient/polyfills-es2015.js',
        './dist/alpdesk-automationclient/scripts.js',
        './dist/alpdesk-automationclient/main-es2015.js',
    ]
    const files_es5 = [
        './dist/alpdesk-automationclient/runtime-es5.js',
        './dist/alpdesk-automationclient/polyfills-es5.js',
        './dist/alpdesk-automationclient/scripts.js',
        './dist/alpdesk-automationclient/main-es5.js',
    ]
    await fs.ensureDir('elements')
    await concat(files, 'elements/alpdesk-elements_es2015.js');
    await concat(files_es5, 'elements/alpdesk-elements_es5.js');
    await fs.copyFile('./dist/alpdesk-automationclient/styles.css', 'elements/styles.css')
    await fs.copy('./dist/alpdesk-automationclient/assets/', 'elements/assets/')
})()
