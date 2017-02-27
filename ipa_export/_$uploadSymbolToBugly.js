'use strict';
// 把生成的symbol上传至bugly后台

const PLATFORM = {
    "com.moonton.rslg":"proj.android",
    "com.moonton.rslg.qihoo":"proj.android360",
    "com.moonton.rslg.huawei":"proj.androidHW",
    "com.moonton.rslg.bsj":"proj.benshouji",
    "com.elex.magicwars":"proj.google",
    "com.moonton.rslg.nearme.gamecenter":"proj.oppo",
    "com.moonton.srzz":"proj.orc",
    "com.tencent.tmgp.rslg":"proj.tencent",
    "com.moonton.rslg.uc":"proj.uc",
    "com.moonton.rslg.vivo":"proj.vivo",
}

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var spawn = child_process.spawn;

let jarPath = path.join( __dirname , "__buglySymbolAndroid2", "buglySymbolAndroid.jar");
let settingPath = path.join( __dirname , "__buglySymbolAndroid2", "settings.txt");

let Upload = function ( packageName , version )
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
    if (!PLATFORM[packageName])
    {
        return;
    }

    let dsymPath =  path.join( __dirname , PLATFORM[packageName],"obj");

    console.log("\n 上传Android symbol符号表到bugly后台 " + dsymPath );
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
    let free = spawn('java', params);
    // 捕获标准输出并将其打印到控制台
    free.stdout.on('data', function (data) {
        console.log(' ' + data);
    });
    // 捕获标准错误输出并将其打印到控制台
    free.stderr.on('data', function (data) {
        console.log('standard error output:\n' + data);
    });
    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
        console.log('child process eixt ,exit:' + code);
        console.log("bugly 符号表上传操作完成")
    });
}

let packageName = process.argv[2]
let version = process.argv[3]

if (packageName && version)
{
    Upload(packageName,version);
}


