/**
 * Created by howe (hehao) on 17/2/14.
 *  node.js调用加密脚本
 */
var fs = require('fs');
var path = require('path');

var child_process = require('child_process');
var spawn = child_process.spawn;
const os = require("os");

var trace = console.log;

trace("\n\n开始运行加密脚本 \n 参数：",process.argv);

function toPromise( func, ...rest )
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
}

function runWithGenerator(gen) {
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
}

let callHandler = function ( respath , key, dir  ,isInCreator)
{
    let _configPath = path.join( dir, "__config.txt" );
    let execPath = path.join( dir, "ToXXTea" );

    if (os.platform() === "win32")
    {
        execPath = path.join( dir, "ToXXTeaProj_win32.exe" );
    }

    let progress = function *()
    {
        if (!respath && !key) {
            if (fs.existsSync(_configPath)) {
                return;
            }
            yield Promise.reject("error ,参数和__config.txt必须有一个存在!");
        }
        let config_content =  respath +"="+key;
        yield toPromise( fs.writeFile, _configPath, config_content );
    };
    let handler = function (resolve,reject)
    {
        runWithGenerator( progress() )
        .then(function ( data ) {
            child_process.exec( execPath, {
                encoding: 'utf8',
                maxBuffer: 2000*1024,
            },function (error, stdout, stderr)
            {
                if (error) {
                    trace(`exec error: ${error}`);
                    reject(error);
                    return;
                }else
                {
                    trace(`stdout: ${stdout}`);
                    trace(`stderr: ${stderr}`);
                }
                resolve("success")
            } );
        })
        .catch(function (err) {
            reject(err)
        });
    };
    return new Promise(handler);
};
let respath = process.argv[2];
let key = process.argv[3];

if (respath && key)
{
    callHandler(respath,key,__dirname).catch(function (err)
    {
        trace(err);
    })
}
module.exports = callHandler;

