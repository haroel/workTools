/**
 * Created by howe (hehao) on 17/2/17.
 */
// let ITEM_TEMPLATE =`<div class="layout horizontal gap tab_left">
//                         <span class="spanc">{ID}</span>
//                         <ui-input class="input_short" id="initial_{ID}" value="{initial}" title="initial"></ui-input>
//                          <ui-input class="input_short1" id="current_{ID}" value="{current}" title="current"></ui-input>
//                     </div>`;

let ITEM_TEMPLATE =`
    <ui-prop name="{ID}" class ="gap">
        <div class="layout horizontal">
            <ui-input class="input_short" id="initial_{ID}" value="{initial}" title="initial"></ui-input>
            <ui-input class="input_short1" id="current_{ID}" value="{current}" title="current"></ui-input>
        </div>
    </ui-prop>`;

var fs    = require('fs');
var path  = require("path");
var trace = console.log;
module.exports.readJsConfig = function ( configJsFilePath )
{
    var jsContent = fs.readFileSync( configJsFilePath, "utf8");
    return JSON.parse(jsContent);
};

module.exports.parseToList = function (configData)
{
    let result = "";
    let ids = [];
    for (let key in configData.modules)
    {
        let itemData = configData.modules[key];
        let itemView = ITEM_TEMPLATE;
        itemView = itemView.replace("{ID}",key);
        itemView = itemView.replace("{ID}",key);
        itemView = itemView.replace("{ID}",key);
        itemView = itemView.replace("{initial}",itemData.initial);
        itemView = itemView.replace("{current}",itemData.current);
        if (key === "common")
        {
            result = itemView + result; // common 放置在最前面
        }else
        {
            result += itemView;
        }
        ids.push( "initial_" + key );
        ids.push( "current_" + key );
    }
    return [result,ids];
};

///Users/baina/Documents/slots/game-js-slots/packages/gametools/tools/hot_update/copy.js
module.exports.writeJsConfig = function ( configData , configJsFilePath)
{
    let content = JSON.stringify(configData,null,4);
    // var jsContent = fs.readFileSync( configJsFilePath, "utf8");
    // var reg = /(begin)([^]*)(\/\/end)/m;
    // jsContent = jsContent.replace(reg,function (match,$1,$2,$3)
    // {
    //     return  $1 + `\n var config = ` +content + ";\n" + $3;
    // });
    fs.writeFileSync(configJsFilePath,content,"utf8");
    //trace( "热更配置生成完成");
};

// let ddd = module.exports.readJsConfig("/Users/baina/Documents/slots/game-js-slots/packages/gametools/tools/hot_update/index.js");
// ddd.line ="qwerr";
// console.log(ddd);
// module.exports.writeJsConfig(ddd,"/Users/baina/Documents/slots/game-js-slots/packages/gametools/tools/hot_update/index.js");