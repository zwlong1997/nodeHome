
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const mime = require('./mime');
const compress = require('./compress');
const range = require('./range');
const isFresh = require('./cache');

const tplPath = path.join(__dirname,'../template/dir.tpl');
const source = fs.readFileSync(tplPath,'utf-8');
const template = Handlebars.compile(source);

module.exports = async function(req,res,filePath,config) {
    try{
        const stats = await stat(filePath);
        if(stats.isFile()) {
            const ContentType = mime(filePath);
            res.setHeader('Content-Type', ContentType);
            if(isFresh(stats,req,res)){
                res.statusCode = 304;
                res.end();
                return;
            }else{
                let rs;
                const {code,start,end} = range(stats.size,req,res); //获取指定长度文件内容
                if(code === 200){
                    res.statusCode = 200;
                    rs = fs.createReadStream(filePath);
                }else{
                    res.statusCode = 206;
                    rs = fs.createReadStream(filePath,{start,end});
                }
                if(filePath.match(config.compress)){//压缩文件
                    rs = compress(rs,req,res);
                }
                rs.pipe(res);
            }

        }else if(stats.isDirectory()){
            const files = await readdir(filePath);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            const dir = path.relative(config.root,filePath);
            const data = {
                title: path.basename(filePath), //取得文件名
                dir: dir ? `/${dir}` : '',
                files: files.map(file => {
                    return {
                        file, //目录里的各个文件
                        icon: mime(file) //文件类型，图标
                    }
                })
            }

            res.end(template(data));
        }
    }catch (ex){
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`${filePath} is not a directory or file`);
    }
}