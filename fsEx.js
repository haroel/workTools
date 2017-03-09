/**
 * Created by baina on 2017/3/8.
 */
const fs    = require('fs');
const path  = require("path");
const co = require("co");

const trace = console.log;

const TAG = "fsEx";

let _toPromise = function( func, ...rest )
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
let mkdirs = function (dirname, callback) {
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
};

//递归创建目录 同步方法
let mkdirsSync = function (dirname) {
    //trace(dirname);
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
};

/*是否存在*/
let isExist = function ( originPath )
{
    let handler = function (resolve,reject)
    {
        let stats = fs.stat( originPath,function (error,stat)
        {
            if (error)
            {
                // trace(error);
                resolve(false);
            }else
            {
                resolve(true);
            }
        } )
    };
    return new Promise(handler);
};

let deleteFile = function ( originPath )
{
    let handler = function (resolve,reject)
    {
        let stats = fs.unlink( originPath,function (error,stat)
        {
            if (error)
            {
                // trace(error);
                resolve(false);
            }else
            {
                // trace(`${TAG}:deleteFile ${originPath} success`);
                resolve(true);
            }
        } )
    };
    return new Promise(handler);
};

let deleteDir = function ( originPath )
{
    let handler = function (resolve,reject)
    {
        let stats = fs.rmdir( originPath,function (error,stat)
        {
            if (error)
            {
                // trace(error);
                resolve(false);
            }else
            {
                // trace(`${TAG}:deleteDir ${originPath} success`);
                resolve(true);
            }
        } )
    };
    return new Promise(handler);
};

let deleteFileOrDir = co.wrap( function * (originPath)
{
    let stats = yield _toPromise(fs.stat,originPath);
    if (stats.isDirectory())
    {
        let files = yield _toPromise(fs.readdir,originPath);
        for (let filename of files)
        {
            yield deleteFileOrDir( path.join( originPath , filename ) );
        }
        yield deleteDir(originPath);
    }else
    {
        yield deleteFile( originPath );
    }
});

/*清空目标目录*/
let clearDir = co.wrap( function * (originPath)
{
    let stats = yield _toPromise(fs.stat,originPath);
    if (stats.isDirectory())
    {
        let files = yield _toPromise(fs.readdir,originPath);
        for (let filename of files)
        {
            yield deleteFileOrDir( path.join( originPath , filename ) );
        }
    }
});

/*拷贝文件*/
let copyFile = function ( originPath,targetPath )
{
    let handler = function (resolve,reject)
    {
        if (fs.existsSync(targetPath))
        {
            fs.unlinkSync(targetPath);
        }
        let readStream = fs.createReadStream(originPath);
        let writeStream = fs.createWriteStream(targetPath);
        readStream.pipe(writeStream );
        readStream.on('end', function() {
            // 当没有数据时，关闭数据流
            writeStream.end();
            // trace(`${TAG}: copyFile ${targetPath} success`);
            resolve( true );
        });
        readStream.on('error', function()
        { // 当没有数据时，关闭数据流
            writeStream.end();
            reject(`${TAG}: copyFile Error`);
        });
    };
    return new Promise(handler);
};

/*
拷贝文件或者目录
*/
let copyFileOrDir = co.wrap( function * ( originPath,targetPath )
{
    let stats = yield _toPromise(fs.stat,originPath);
    if (stats.isDirectory())
    {
        mkdirsSync(targetPath);
        let files = yield _toPromise(fs.readdir,originPath);
        for (let filename of files)
        {
            let fileFullpath = path.join( originPath , filename );
            let targetFullpath = path.join( targetPath , filename );
            yield copyFileOrDir(fileFullpath, targetFullpath );
        }
    }else
    {
        mkdirsSync( path.dirname(targetPath) );
        yield copyFile( originPath, targetPath );
    }
});

let moveFile = co.wrap( function *(originPath,targetPath)
{
    let stats = yield _toPromise(fs.stat,originPath);
    if (!stats.isDirectory())
    {
        yield deleteFile(targetPath);
        yield copyFile( originPath, targetPath);
        yield deleteFile( originPath );
        // trace( `${TAG} moveFile : ${originPath} succ`);
    }
    return `${TAG} moveFile : 不可移动目录 ${originPath} `;
});

let moveFileOrDir = co.wrap( function * ( originPath,targetPath )
{
    let stats = yield _toPromise(fs.stat,originPath);
    if (stats.isDirectory())
    {
        mkdirsSync(targetPath);
        let files = yield _toPromise(fs.readdir,originPath);
        for (let filename of files)
        {
            let fileFullpath = path.join( originPath , filename );
            let targetFullpath = path.join( targetPath , filename );
            yield moveFileOrDir(fileFullpath, targetFullpath );
        }
        yield deleteDir(originPath);
    }else
    {
        mkdirsSync( path.dirname(targetPath) );
        trace( yield moveFile( originPath, targetPath ) );
    }
});

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

let m = {};
m.mkdirs = mkdirs;
m.mkdirsSync= mkdirsSync;
m.loopDir = loopDir;

m.copyFileOrDir = copyFileOrDir;
m.moveFileOrDir = moveFileOrDir;
m.deleteFileOrDir = deleteFileOrDir;
m.clearDir = clearDir;

m.isExist = isExist;

module.exports = m;
