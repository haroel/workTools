/**
 * Created by baina on 2017/3/9.
 *
 * 测试例文件
 */
const fsEx = require("./fsEx.js");

fsEx.moveFileOrDir( "/Users/baina/Desktop/test1/co","/Users/baina/Desktop/test/co"  )
    .then(function () {
    }).catch(function (e) {
    console.log(e);
});


fsEx.moveFileOrDir( "/Users/baina/Desktop/test.js","/Users/baina/Desktop/test/testcopy.js"  )
.then(function () {
}).catch(function (e) {
    console.log(e);
});
