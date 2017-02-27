'use strict';
// ipa 核心打包脚本

var fs = require('fs');
var path = require('path');

var child_process = require('child_process');
var spawn = child_process.spawn;

var trace = console.log

// 清理target configuration :release/debug
function cleanXcodeTarget( xcodeproj_fullpath , targetName , configuration )
{
	let handler = function ( resolve , reject )
	{
		let isSuccess = true;
		// xcodebuild -project $projpath -scheme $targetName -configuration Release clean
		let tag = "-project";
		if ( path.extname(xcodeproj_fullpath) == ".xcodeproj")
		{
			tag = "-project";
		}else if ( path.extname(xcodeproj_fullpath) == ".xcworkspace")
		{
			tag = "-workspace";
		}
	    let params = [
			tag, xcodeproj_fullpath,
	        '-scheme', targetName,
	        '-configuration', configuration ,
	        'clean'
	    ];
	    trace("\n开始清理工程 target " + targetName)
	    let free = spawn('xcodebuild', params);
	    // 捕获标准输出并将其打印到控制台
	    free.stdout.on('data', function (data) {
	         trace('-' + data);
	    });
	    // 捕获标准错误输出并将其打印到控制台
	    free.stderr.on('data', function (data) {
	        trace('standard error output:\n' + data);
	        isSuccess = false;
	    });
	    // 注册子进程关闭事件
	    free.on('exit', function (code, signal) 
	    {
	        trace('child process eixt ,exit:' + code);
	        trace("工程清理完成 target " + targetName + "\n")
	        if (isSuccess)
	    	{
	    		resolve( targetName );
	    	}else
	    	{
	    		reject( targetName + " cleanXcodeTarget error" );
	    	}
	    });
	}
	return new Promise( handler );
}

// 生成.app 文件
function generalArchive( xcodeproj_fullpath , targetName , configuration , output_dir , app_path)
{	
	let handler = function ( resolve , reject )
	{
		let tag = "-project";
		if ( path.extname(xcodeproj_fullpath) == ".xcodeproj")
		{
			tag = "-project";
		}else if ( path.extname(xcodeproj_fullpath) == ".xcworkspace")
		{
			tag = "-workspace";
		}
	    let params = [
			tag, xcodeproj_fullpath,
	        '-scheme', targetName,
	        '-configuration', configuration,
	        "SYMROOT=" + output_dir
	    ];
		trace("generalArchive ",params);
	    let free = spawn('xcodebuild', params);
	    free.stdout.on('data', function (data) {
	        trace("-" + data);
	    });
	    free.stderr.on('data', function (data) {
	        trace('error output:\n' + data);
	    });
	    free.on('exit', function (code, signal) {
	        // 判断是否存在.app文件，否则本次构建失败
	        let flag = true;
			try
			{
			   fs.accessSync(app_path, fs.F_OK);
			}catch(e)
			{
			    flag = false;
			}
	        if (flag)
	    	{
	    		resolve( targetName );
	    	}else
	    	{
	    		reject( targetName + " generalArchive error" );
	    	}
	    });
	}
	return new Promise( handler );
}

function exportToIpa( targetName , ipa_path , app_path )
{
	let handler = function ( resolve , reject )
	{
		let isSuccess = true;
	    // 执行xcrun命令
	    let params = [
	        '-sdk', 'iphoneos', 'PackageApplication',
	        '-v', app_path,
	        '-o', ipa_path
	    ];
	    trace("导出ipa包 " + ipa_path + " begin")
	    let free = spawn('xcrun', params);
	    free.stdout.on('data', function (data) {
	        trace( "-" + data);
	    });
	    free.stderr.on('data', function (data) {
	    	trace('standard error output:\n' + data);
	    	isSuccess = false;
	    });
	    free.on('exit', function (code, signal) {
	        trace('child process eixt ,exit:' + code);
	        if (isSuccess)
	    	{
	    		resolve( targetName );
	    	}else
	    	{
	    		reject( targetName + " exportToIpa error" );
	    	}
	    });
	}
	return new Promise( handler );
}

module.exports.cleanXcodeTarget = cleanXcodeTarget;
module.exports.generalArchive = generalArchive;
module.exports.exportToIpa = exportToIpa;

/* 
清理再构建ipa
*/
module.exports.buildWithClean = function ( xcodeproj_fullpath , targetName , configuration ,
										   output_dir, app_path , ipa_path   )
{
	let handler = function (resolve, reject)
	{
		cleanXcodeTarget( xcodeproj_fullpath , targetName , configuration )
		.then( function (data)
		{
			return generalArchive( xcodeproj_fullpath , targetName , configuration , output_dir , app_path );
		})
		.then( function (data)
		{
			return exportToIpa( targetName , ipa_path , app_path );
		})
		.then(function()
		{
			resolve( targetName );
		})
		.catch( function(error)
		{
			reject( error );
		})
	};
	return new Promise( handler );
}


module.exports.build = function ( xcodeproj_fullpath , targetName , configuration ,
										   output_dir, app_path , ipa_path )
{
	let handler = function (resolve, reject)
	{
		generalArchive( xcodeproj_fullpath , targetName , configuration , output_dir , app_path )
		.then( function (data)
		{
			return exportToIpa( targetName , ipa_path , app_path );
		})
		.then(function()
		{
			resolve( targetName );
		})
		.catch( function(error)
		{
			reject( error );
		})
	}
	return new Promise( handler );
}

