/**
 * Created by howe on 17/2/8.
 */
var ipa_build_core = require("./_$ipa_build_core.js");

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

var spawn = child_process.spawn;
var exec = child_process.exec;

var trace = console.log;
/**
 * Created by howe on 2016/11/26.
 * 简单版本的co模块
 */
function run(generator) {
    var gen = generator();
    function next(data) {
        var ret = gen.next(data);
        if(ret.done) return Promise.resolve("done");
        return Promise.resolve(ret.value)
            .then(data => next(data))
            .catch(ex => gen.throw(ex));
    }
    try{
        return next();
    } catch(ex) {
        return Promise.reject(ex);
    }
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


function  toPromise( func, ...rest )
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

module.exports.handler = function ( xcodeproj_fullpath,  targetInfo , configuration )
{
    let packageName = targetInfo["packageName"];
    let targetName =  targetInfo["targetName"];
    let version =  targetInfo["version"];

    let workplace = path.join(__dirname,"_____" + packageName ); // 工作目录

    let build_path = path.join( workplace , configuration + "-iphoneos" );

    let app_path = build_path + "/" + targetName +".app";
    let ipa_path = workplace + "/" + targetName + "_" + version + '.ipa';

    let _gene = function *()
    {
        // 清空之前的workplace目录
        yield toPromise(exec, "rm -rf " + workplace);
        trace(`${workplace}已清空`);
        yield toPromise(fs.mkdir,workplace);
        trace(`${workplace}创建`);
        yield ipa_build_core.buildWithClean( xcodeproj_fullpath , targetName , configuration , workplace , app_path , ipa_path);
    };
    runWithGenerator( _gene() ).then( function ()
    {

    } ).catch(function(error)
    {
        trace("发生错误" +error);
        throw new Error("打包错误" +error);
    });
};
