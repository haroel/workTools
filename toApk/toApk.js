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
let trace = console.log;

// 将构建的so库拷贝到待build的Android Studio工程 位于studio_slots
let copySoLibToAndroidStudio = function ( target_projdir, des_projdir)
{
    let handler = function ( resolve,reject)
    {
        trace("将so文件拷贝到AndroidStudio工程下...");

        let originPath = path.join(  target_projdir, "app","libs","armeabi","libcocos2djs.so");
        if (!fs.existsSync(originPath))
        {
            reject("libcocos2djs.so不存在");
            return;
        }
        let targetPath = path.join(  des_projdir, "app","libs","armeabi","libSlotsRoyale2017.so");
        plibs.mkdirsSync( path.dirname(targetPath) );
        if (fs.existsSync(targetPath))
        {
            fs.unlinkSync(targetPath);
        }
        trace("原始so路径",originPath);
        var readStream = fs.createReadStream(originPath);
        var writeStream = fs.createWriteStream(targetPath);
        readStream.pipe(writeStream);
        writeStream.on('close',function(){
            resolve("libSlotsRoyale2017.so拷贝完成" );
        });
        writeStream.on('error',function(){
            reject("error copy"+targetPath);
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

/** 删除文件夹里面的内容 */
function clearDir(path)
{
    if (fs.existsSync(path)) {
        let files = fs.readdirSync(path);
        files.forEach(function(file, index){
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            }
            else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

let gradleBuildApks = function ( gradle_path, studioProjPath ,debugOrRelease,projpath ,outputPath )
{
    trace(`gradleBuildApks ${debugOrRelease}....... `);
    let handler = function *()
    {
        // yield spawnPromise(gradle_path,["build","-p",studioProjPath]);
        trace( yield spawnPromise(gradle_path,["clean","-p",studioProjPath],trace));
        if (debugOrRelease === "debug")
        {
            trace( yield spawnPromise(gradle_path,["assembleDebug","-p",studioProjPath],trace) );
        }else if (debugOrRelease === "both")
        {
            trace( yield spawnPromise(gradle_path,["build","-p",studioProjPath],trace) );
        }else
        {
            trace( yield spawnPromise(gradle_path,["assembleRelease","-p",studioProjPath],trace) );
        }
        let gObj = yield parseBuildGradle(path.join( studioProjPath,"app" ,"build.gradle" ) );
        trace(gObj);

        // trace( "apk生成目录:\n",path.join(studioProjPath,"app","build","apk") );
        // const config = require("../__config.js");
        // trace(config);
        // trace( "apkdir " + path.join(projpath, config.APK_DIR ));
        clearDir( path.join(projpath, outputPath ) ); // 清空输出目录
        plibs.mkdirsSync( path.join(projpath, outputPath ) );

        let apk_arr = [];
        plibs.loopDir( path.join(  studioProjPath , "app", "build","outputs"), apk_arr, new Set([".apk"]) );
        for (let originApkPath of apk_arr)
        {
            let filename = path.parse(originApkPath ).name;
            let newApkPath = filename + "_" + gObj.versionName + "_" + gObj.versionCode + ".apk";
            trace( yield plibs.copyFile(originApkPath, path.join( projpath , outputPath ,newApkPath) ) );
        }
        trace("APK导出路径" + outputPath);
        return Promise.resolve( "Success, all apk files has been copy to dir!!!");
    };
    return co( handler );
};


module.exports.copySoLibToAndroidStudio = copySoLibToAndroidStudio;
module.exports.gradleBuildApks = gradleBuildApks;