'use strict';
// 把生成的dsym上传至bugly后台

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var spawn = child_process.spawn;

let jarPath = path.join( __dirname , "__buglySymboliOS2", "buglySymboliOS.jar");
let settingPath = path.join( __dirname , "__buglySymboliOS2", "settings.txt");

module.exports.Upload = function ( dsymPath , packageName , version )
{
    let handler = function (resolve,reject)
    {
        let settingContent = fs.readFileSync( settingPath,"utf-8");
        let reg = /\b(\w+)\b\=(.+)/gm;
        let settingMap = new Map();
        while(true)
        {
            let matches = reg.exec(settingContent);
            if (!matches)
            {
                break;
            }
            settingMap.set(matches[1],matches[2]);
        }
        console.log("\n 上传iOS dsym符号表到bugly后台 " + dsymPath );
        console.log("\n bugly参数",settingMap);

        // cd /Users/batman/Downloads/buglySymboliOS
        // java -jar buglySymboliOS.jar -i /Users/batman/Desktop/test.app.dSYM
        // -u -id 900012345 -key abcdefghijk -package com.batman.demo -version
        // 2.3.1
        let params = [
            '-jar', jarPath,
            '-i', dsymPath,
            '-u',
            '-id',settingMap.get("ID"),
            '-key',settingMap.get("Key"),
            '-package',packageName,
            '-version',version
        ];
        let isSucces = true;
        let free = spawn('java', params);
        // 捕获标准输出并将其打印到控制台
        free.stdout.on('data', function (data) {
            console.log(' ' + data);
        });
        // 捕获标准错误输出并将其打印到控制台
        free.stderr.on('data', function (data) {
            console.log('standard error output:\n' + data);
            isSucces = false
        });
        // 注册子进程关闭事件
        free.on('exit', function (code, signal) {
            if (isSucces)
            {
                resolve("ok");
            }else
            {
                reject("error");
            }
            console.log("bugly 符号表上传操作完成")
        });
    };
    return new Promise(handler);
};
