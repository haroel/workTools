/**
 * Created by howe (hehao) on 17/2/20.
 */
var fs    = require('fs');
var path  = require("path");
const child_process = require('child_process');
const spawn = child_process.spawn;
const exec = child_process.exec;

let trace = console.log;

var m = {};

// 简单的co
m.runWithGenerator = function (gen) {
    //var gen = generator();
    function next(data)
    {
        var ret = gen.next(data);
        if(ret.done)
        {
            return Promise.resolve(ret.value);
        }
        return Promise.resolve(ret.value)
            .then(data => next(data))
            .catch(ex => {
                gen.throw(ex)
            });
    }
    try
    {
        return next();
    } catch(ex)
    {
        return Promise.reject(ex);
    }
};

// 将node.js 调用变成一个Promise语法

m.toPromise = function( func, ...rest )
{
    let handler = function (resolve,reject) {
        func(...rest,function (error,...rest1)
        {
            if (error)
            {
                reject(error);
            }else
            {
                resolve(...rest1);
            }
        })
    };
    return new Promise(handler);
};

//递归创建目录 异步方法
function mkdirs(dirname, callback) {
    fs.exists(dirname, function (exists) {
        if (exists) {
            callback();
        } else {
            //trace(path.dirname(dirname));
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
            });
        }
    });
}

//递归创建目录 同步方法
function mkdirsSync(dirname) {
    //trace(dirname);
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}


const ignoreFileFormat = [".svn",".DS_Store",".git"];       // 忽略文件格式
function isIgnore(files)
{
    for (let f of ignoreFileFormat)
    {
        if (files.indexOf(f) >= 0)
        {
            return true;
        }
    }
    return false;
}

function loopDir( dir_path, path_arr ,_patternFileFormat )
{
    try{
        if (!fs.existsSync(dir_path))
        {
            return;
        }
        let files = fs.readdirSync(dir_path);
        for (let filename of files)
        {
            if (isIgnore(filename) == false)
            {
                let fPath = path.join(dir_path, filename );
                let stats = fs.lstatSync( fPath ); // 同步读取文件信息
                if (stats.isDirectory())
                {
                    loopDir( fPath, path_arr ,_patternFileFormat)
                }else
                {
                    if ( _patternFileFormat.has(path.extname( filename )))
                    {
                        path_arr.push(fPath)
                    }
                }
            }
        }
    }catch (error)
    {
        trace(error)
    }
}

m.copyFile = function ( originpath,targetpath )
{
    let handler = function (resolve,reject)
    {
        if (fs.existsSync(targetpath))
        {
            fs.unlinkSync(targetpath);
        }
        let readStream = fs.createReadStream(originpath);
        let writeStream = fs.createWriteStream(targetpath);
        readStream.pipe(writeStream );
        readStream.on('end', function() { // 当没有数据时，关闭数据流
            writeStream.end();
            resolve( targetpath + " copy finish! ");
        });

        readStream.on('error', function()
        { // 当没有数据时，关闭数据流
            writeStream.end();
            reject("copy error!")
        });
    };
    return new Promise(handler);
};

m.spawnToPromise = function ( command ,params , msgcall )
{
    // let _log = "";
    // let _logcall = function ()
    // {
    //     if (_log)
    //     {
    //         if (msgcall)
    //         {
    //             msgcall(_log)
    //         }else
    //         {
    //             trace(_log);
    //         }
    //         _log = ""
    //     }
    // };
    // let _logTime = setInterval(_logcall,1500);
    //
    // let _trace = function (...args)
    // {
    //     _log += "\n" + args.toString();
    // };
    let _trace = msgcall ? msgcall :trace;
    let handle = function (resolve,reject)
    {
        _trace(command,params);
        let errorStr = "";
        let isSuccess = true;
        let free = spawn(command, params);
        free.stdout.on('data', function (data)
        {
            _trace( data);
        });
        free.stderr.on('data', function (data)
        {
            errorStr +=data;
            isSuccess = false;
        });
        free.on('exit', function (code, signal)
        {
            _trace('child process eixt ,exit:' + code);
            _trace("提示信息:" + errorStr);
            if (code == 0)
            {
                resolve("done");
            }else
            {
                reject(errorStr);
            }
            // _logcall();
            // clearInterval(_logTime);
            // _logTime = null;
            // _log = null;
        });
    };
    return new Promise(handle);
};


m.mkdirs = mkdirs;
m.mkdirsSync= mkdirsSync;
m.loopDir = loopDir;

module.exports = m;