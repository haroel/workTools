/**
 * Created by howe (hehao) on 17/2/20.
 */
const fs    = require('fs');
const path  = require("path");
const child_process = require('child_process');
const spawn = child_process.spawn;
const exec = child_process.exec;
const os = require("os");
var co = require('co');

const plibs = require("../plibs");
const fsEx = require("../fsEx");

let trace = console.log;

// 将构建的so库拷贝到待build的Android Studio工程 位于studio_slots
let copySoLibToAndroidStudio = function ( target_projdir, des_projdir)
{
    let handler = function ( resolve,reject)
    {
        trace("将so文件拷贝到AndroidStudio工程下...");

        let originPath = path.join(  target_projdir, "app","libs","armeabi","libcocos2djs.so");
        let targetPath = path.join(  des_projdir, "app","libs","armeabi","libSlotsRoyale2017.so");
        fsEx.copyFileOrDir( originPath, targetPath)
        .then(function () {
            resolve("libSlotsRoyale2017.so拷贝完成");
        }).catch(function (e)
        {
            trace("so,拷贝错误");
            reject(e);
        });
    };
    return new Promise(handler);
};

let spawnPromise = plibs.spawnToPromise;


let parseBuildGradle = function (gradlePath )
{
     return new Promise(function (resolve,reject)
     {
         fs.readFile(gradlePath,"utf8",function (error,data)
         {
             if (error)
             {
                 reject(error);
                 return;
             }

             let data_arr = data.split("\n");
             let obj = {};
                for (var d of data_arr)
                {
                    if (d.indexOf("versionCode") >= 0)
                    {
                        obj.versionCode = d.match( /\d+/)[0]; // build 号
                    }
                    if (d.indexOf("versionName") >= 0)
                    {
                        obj.versionName = d.match(  /\"([\d\.]+)\"/ )[1]; // 版本号
                    }
                    if (d.indexOf("applicationId") >= 0)
                    {
                        obj.applicationId = d.match(  /\"([\w\.]+)\"/ )[1]; // 包名
                    }
                }
                resolve(obj);
         }  )
     })
};

let gradleBuildApks = function ( gradle_path, studioProjPath ,debugOrRelease,projpath ,outputPath )
{
    trace(`生成apk: gradleBuildApks ${debugOrRelease}....... `);
    let handler = function *()
    {
        // yield spawnPromise(gradle_path,["build","-p",studioProjPath]);
        trace( yield spawnPromise(gradle_path,["clean","-p",studioProjPath,"--stacktrace"],trace));
        if (debugOrRelease === "debug")
        {
            trace( yield spawnPromise(gradle_path,["assembleDebug","-p",studioProjPath,"--stacktrace"],trace) );
        }else if (debugOrRelease === "both")
        {
            trace( yield spawnPromise(gradle_path,["build","-p",studioProjPath,"--stacktrace"],trace) );
        }else
        {
            trace( yield spawnPromise(gradle_path,["assembleRelease","-p",studioProjPath,"--stacktrace"],trace) );
        }
        let gObj = yield parseBuildGradle(path.join( studioProjPath,"app" ,"build.gradle" ) );
        trace(gObj);
        yield fsEx.clearDir( path.join(projpath, outputPath ) );
        trace(` 已清空 ${outputPath}`);
        let apk_arr =[];
        fsEx.loopDir( path.join(  studioProjPath , "app", "build","outputs"), apk_arr, new Set([".apk"]) );
        for (let originApkPath of apk_arr)
        {
            let filename = path.parse(originApkPath ).name;
            let newApkPath = filename + "_" + gObj.versionName + "_" + gObj.versionCode + ".apk";
            yield fsEx.copyFileOrDir(originApkPath, path.join( projpath , outputPath ,newApkPath) );
        }
        trace("APK导出路径" + outputPath);
        return Promise.resolve( "Success, all apk files has been copy to dir!!!");
    };
    return co( handler );
};


module.exports.copySoLibToAndroidStudio = copySoLibToAndroidStudio;
module.exports.gradleBuildApks = gradleBuildApks;