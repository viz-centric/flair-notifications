var Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path');


var mocha  = new Mocha({
    timeout: 20000,
    reporter: 'mochawesome',
    reporterOptions: {
    reportFilename: 'test-report',
    reportDir: './app/test',
    quiet: true
  }
});

var testDir = './app/test'

fs.readdirSync(testDir).filter(function(file) {
    // Only keep the .js files
    return file.substr(-3) === '.js';

}).forEach(function(file) {
    mocha.addFile(
        path.join(testDir, file)
    );
});

// Run the tests.
mocha.run(function(failures) {
  process.exitCode = failures ? 1 : 0;  // exit with non-zero status if there were failures
  process.exit();
});