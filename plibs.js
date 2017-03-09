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
            let msg = data.toString();
            if (msg)
            {
                _trace( msg);
            }
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

module.exports = m;