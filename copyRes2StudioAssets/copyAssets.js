/**
 * Created by baina on 2017/3/9.
 */

const fs    = require('fs');
const path  = require("path");
const co = require("co");

const fsEx = require("../fsEx");
const trace = console.log;

module.exports = co.wrap( function *(target_dir, des_dir ,projectPath, needRemove)
{
    let orignRes = path.join( des_dir,"res" );
    let orignSrc = path.join( des_dir,"src" );
    let orignAssets = path.join( des_dir,"frameworks/runtime-src/proj.android-studio/app/assets" );
    let originMainJS = path.join( orignAssets,"main.jsc" );
    let originJson = path.join( orignAssets,"project.json" );
    let originScripts = path.join( orignAssets,"script" );

    let targetRes = path.join( target_dir,"res" );
    let targetSrc = path.join( target_dir,"src" );
    let targetScripts = path.join( target_dir,"script" );
    // let targetMainJS = path.join( target_dir,"main.jsc" );
    let targetJson = path.join( target_dir,"project.json" );

    yield fsEx.deleteFileOrDir( targetRes );
    trace( " 已删除" + targetRes);
    yield fsEx.deleteFileOrDir( targetSrc );
    trace( " 已删除" + targetSrc);
    yield fsEx.deleteFileOrDir( targetScripts );
    trace(" 已删除" + targetScripts  );
    // yield fsEx.deleteFileOrDir( targetMainJS );
    // trace(" 已删除" + targetMainJS);
    yield fsEx.deleteFileOrDir( targetJson );
    trace( " 已删除" + targetJson);

    yield fsEx.copyFileOrDir(orignRes,targetRes );
    yield fsEx.copyFileOrDir(orignSrc,targetSrc );
    yield fsEx.copyFileOrDir(originScripts,targetScripts );
    // yield fsEx.copyFileOrDir(originMainJS,targetMainJS );
    yield fsEx.copyFileOrDir(originJson,targetJson );
    
    trace("build目录下res、src、script和project.json已拷贝到发布项目的目录!");
    
    if (needRemove)
    {
        // var targetRes = 'studio_slots/runtime-src/proj.android-studio/app/assets/res/raw-assets/resources/';
        // var resPath   = path.join(Editor.projectInfo.path, targetRes);    // 安卓游戏资源文件夹
        let resPath = path.join( targetRes,"raw-assets/resources/");
        let modules   = "";                                               // 游戏模块（例：10001，10002）
        if (modules){
            let moduleArray = modules.split(",");
            for (let i = 0; i < moduleArray.length; i++)
            {
                let moduleDir = path.join(resPath ,moduleArray[i] );
                if ( yield fsEx.isExist(moduleDir) )
                {
                    yield fsEx.deleteFileOrDir(moduleDir);
                    trace("模块" + moduleArray[i] + "已删除");
                }else
                {
                    trace("模块" + moduleArray[i] + "不存在");
                }
            }
        }
        else {
            let dirNmas = fs.readdirSync(resPath);
            for (let i = 0; i < dirNmas.length; i++){
                let name = dirNmas[i];
                let p = path.join(resPath, name);
                let f = fs.statSync(p);
                if (f.isDirectory()) {
                    if (name != "10001" && name != "common" && name != "version"){
                        if (fs.existsSync(p))
                        {
                            yield fsEx.deleteFileOrDir(p);
                            trace("模块" + name+ "已删除");
                        }
                        else
                        {
                            trace("模块" + name + "不存在");
                        }
                    }
                }
            }
        }
    }
    return "Copy Assets finished!";
} );