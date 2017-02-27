/**
 * Author By gangDong, Edited by howe (hehao) on 17/2/17.
 */

var fs    = require('fs');
var path  = require("path");

var trace = console.log;
//递归创建目录 同步方法
function mkdirsSync(dirname) {
    if (!dirname)
    {return false;}
    //console.log(dirname);
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}
/** 删除文件夹 */
function deleteFolderRecursive(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
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
};

var doCopy = function ( target_dir, des_dir ,projectPath, needRemove )
{
    let copyDir = require( path.join(projectPath, "tools/copyRes2StudioAssets/copy.js" ));
    let handler = function (resolve,reject)
    {
        var targetRes = path.join( target_dir,"res" );
        var targetSrc = path.join( target_dir,"src" );
        var targetScripts = path.join( target_dir,"script" );
        mkdirsSync(targetScripts);

        deleteFolderRecursive( targetScripts );
        deleteFolderRecursive( targetRes );
        deleteFolderRecursive( targetSrc );

        var orignRes = path.join( des_dir,"res" );
        var orignSrc = path.join( des_dir,"src" );

        copyDir( orignSrc , targetSrc , function (err) {
            if (err) {
                console.log("更新 Android Studio assets/src 目录资源失败");
            }
            else {
                console.log("更新 Android Studio assets/src 目录资源完成");
            }
        });

        copyDir( orignRes , targetRes , function (err) {
            if (err) {
                console.log("更新 Android Studio assets/res 目录资源失败");
                reject(err);
            }
            else {
                console.log("更新 Android Studio assets/res 目录资源完成");
                if (needRemove)
                {
                    deleteAssets();
                }else
                {
                    resolve("-- 保留所有主题资源资源 --");
                }
            }
        });

        var orignAssets = path.join( des_dir,"frameworks/runtime-src/proj.android-studio/app/assets" );
        if (fs.existsSync(orignAssets))
        {
            // 拷贝main.jsc
            var _mainJsc = path.join( orignAssets,"main.jsc" );
            var _projJson = path.join( orignAssets,"project.json" );

            var mainJsc = path.join( target_dir,"main.jsc" );
            var projJson = path.join( target_dir,"project.json" );

            fs.createReadStream( _mainJsc ).pipe( fs.createWriteStream( mainJsc ));
            fs.createReadStream( _projJson ).pipe(fs.createWriteStream( projJson ));
            trace("更新 Android Studio assets/main.jsc ");
            trace("更新 Android Studio assets/project.json ");

            // 拷贝 scripts目录
            copyDir( path.join( orignAssets,"script" ) , targetScripts , function (err) {
                if (err) {
                    console.log("更新 Android Studio assets/script 目录资源失败");
                }
                else {
                    console.log("更新 Android Studio assets/script 目录资源完成");
                }
            });
        }



        function deleteAssets(){
            // var targetRes = 'studio_slots/runtime-src/proj.android-studio/app/assets/res/raw-assets/resources/';
            // var resPath   = path.join(Editor.projectInfo.path, targetRes);    // 安卓游戏资源文件夹
            var resPath = path.join( targetRes,"raw-assets/resources/");
            var modules   = "";                                               // 游戏模块（例：10001，10002）
            //----------------------------------------------------------------------------------------------------
            if (modules){
                var moduleArray = modules.split(",");
                for (var i = 0; i < moduleArray.length; i++){
                    var folder = resPath + moduleArray[i];
                    if (fs.existsSync(folder)) {
                        deleteFolderRecursive(folder);
                        trace("模块" + moduleArray[i] + "已删除");
                    }
                    else
                        trace("模块" + moduleArray[i] + "不存在");
                }
            }
            else {
                var dirNmas = fs.readdirSync(resPath);
                for (var i = 0; i < dirNmas.length; i++){
                    var name = dirNmas[i];
                    var p = resPath + name
                    var f = fs.statSync(p);
                    if (f.isDirectory()) {
                        if (name != "10001" && name != "common" && name != "version"){
                            if (fs.existsSync(p)) {
                                deleteFolderRecursive(p);
                                trace("模块" + name+ "已删除");
                            }
                            else
                                trace("模块" + name + "不存在");

                        }
                    }
                }
            }
            resolve("完成删除安卓包中不需要打包的玩法资源");
        }
    };
    return new Promise(handler);
};

module.exports.doCopy = doCopy;