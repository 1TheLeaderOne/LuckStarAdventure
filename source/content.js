import {
    lib,
    game,
    ui,
    get,
    ai,
    _status
} from '../../../noname.js'
export default async function content(config, pack) {
    //若当前模式不符合，移除本扩展的武将包等一切数据
    if (lib.config.mode != "StarAdventure") {
        //前置准备
        lib.config.characters.remove("jxmx");
        //第一种情况
        var list = ["characterPack", "characterSort"];
        for (var i of list) delete lib[i].jxmx;
        //第二种情况
        var list2 = ["group"];
        for (var i of list2) {
            for (var j = 0; j < lib[i].length; j++) {
                if (lib[i][j].startsWith("jxmx" + i + "_")) lib[i][j] = undefined;
            }
            lib[i] = lib[i].filter(j => j != undefined);
        };
        //第三种情况
        var list3 = ["groupnature", "character", "characterIntro", "characterTitle", "translate"];
        for (var i of list3) {
            var removes = [];
            for (var j in lib[i]) {
                if (i == "groupnature" && j.startsWith("jxmxgroup_")) {
                    removes.push(j);
                    continue;
                }
                if (i == "translate" && (j.startsWith("jxmx_") || j.startsWith("jxmxgroup_") || j.startsWith("jxmxsort_"))) {
                    removes.push(j);
                    continue;
                }
                if (j.startsWith("jxmx_")) removes.push(j);
            }
            for (var j of removes) delete lib[i][j];
        };
    }
    //反之，将skill与translate数据覆盖入库
    else {
        for (var i in lib.jxmx_skillData) {
            for (var j in lib.jxmx_skillData[i]) {
                lib.skill[i + "_" + j] = lib.jxmx_skillData[i][j];
            }
        }
        for (var i in lib.jxmx_translateData) {
            for (var j in lib.jxmx_translateData[i]) {
                lib.translate[i + "_" + j] = lib.jxmx_translateData[i][j];
            }
        }
    }
}