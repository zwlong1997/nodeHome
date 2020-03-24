const {exec} = require('child_process'); //继承相关的  exec可以帮忙执行系统的命令
 
module.exports = url => {
    switch (process.platform) {
        case 'darwin':
            exec(`open ${url}`);
            break;
        case 'win32':
            exec(`start ${url}`);
            break;
    }
};