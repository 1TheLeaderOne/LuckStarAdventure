import {
    lib,
    game,
    ui,
    get,
    ai,
    _status
} from '../../../noname.js';
import skillData from '../mode/skill.js';
import translateData from '../mode/translate.js';
export default async function precontent(config, pack) {
    //导入css文件
    lib.init.css("extension/吉星大冒险/mode", "index");
    //skill数据作兼容
    lib.jxmx_skillData = skillData;
    for (var i in skillData) {
        for (var j in skillData[i]) {
            lib.skill[i + "_" + j] = {};
        }
    }
    //translate数据作兼容
    lib.jxmx_translateData = translateData;
    for (var i in translateData) {
        for (var j in translateData[i]) {
            lib.skill[i + "_" + j] = {};
        }
    }
    //自动检索level文件夹下所有js文件
    game.jxmx_loadAllLevelFiles = function() {
        if (game.getFileList) {
            game.getFileList("extension/吉星大冒险/level", (_folders, files) => {
                game.jxmx_stageDataList = [];
                for (const fileName of files) {
                    const match = fileName.match(/^(.+)\.js$/i);
                    if (!match) continue;
                    import(`../level/${fileName}`).then(mod => {
                        if (mod.default) {
                            game.jxmx_stageDataList.push(mod.default);
                        }
                    });
                }
            });
        }
    }
    game.jxmx_loadAllLevelFiles();
    //【封装函数】数字转换字母
    game.jxmx_numToLetters = function(num) {
        let result = '';
        while (num > 0) {
            num--;
            result = String.fromCharCode(65 + (num % 26)) + result;
            num = Math.floor(num / 26);
        }
        return result;
    };
    //【封装函数】字母转换数字
    game.jxmx_lettersToNum = function(str) {
        let num = 0;
        for (let i = 0; i < str.length; i++) {
            num = num * 26 + (str.charCodeAt(i) - 64);
        }
        return num;
    };
    //描边文字的SVG滤镜效果
    let colors = ["#000000"];
    let svgDefs = '<svg width="0" height="0" xmlns="http://www.w3.org/2000/svg"><defs>';
    colors.forEach((color, index) => {
        const radius = 1.2;
        svgDefs += `
                <filter id="jxmx_textStroke_${index}">
                <feMorphology operator="dilate" radius="${radius}" in="SourceAlpha" result="thick" />
                <feFlood flood-color="${color}" result="fill" />
                <feComposite in="fill" in2="thick" operator="in" result="stroke" />
                <feMerge>
                <feMergeNode in="stroke" />
                <feMergeNode in="SourceGraphic" />
                </feMerge>
                </filter>`;
    });
    svgDefs += '</defs></svg>';
    document.body.insertAdjacentHTML('beforeend', svgDefs);
    //【封装函数】依据窗口大小变化动态调整样式
    game.jxmx_testStyleChange = function(div, parentDiv, func, replaceDiv) {
        //记录parentDiv的宽度
        var str = parentDiv.offsetWidth;
        //添加定时器
        var interval = setInterval(() => {
            //若div已不在ui.window页面中，移除定时器
            if (!ui.window.contains(div)) {
                clearInterval(interval);
                return;
            }
            //若没有变化，取消后续流程
            if (str === parentDiv.offsetWidth) return;
            str = parentDiv.offsetWidth;
            //执行函数效果
            if (func && typeof func == "function") func(div, (replaceDiv || parentDiv));
        }, 100);
    };
    //【封装函数】更改背景音乐
    game.jxmx_changeBgm = function(bgm) {
        if (!bgm) return;
        ui.backgroundMusic.src = lib.assetURL + "extension/吉星大冒险/music/" + bgm;
        ui.backgroundMusic.onended = function() {
            game.jxmx_changeBgm(bgm);
        };
    };
    //【封装函数】唤出信息告示框
    game.jxmx_showNotice = function(info, center, reduce, duration, callback) {
        //创建元素
        var notice = ui.create.div(".jxmx_notice", ui.window);
        if (center) notice.classList.add("center");
        //字体倍数
        var fontSizeD = 0.072;
        if (typeof reduce === "number") fontSizeD += reduce;
        //创建文本
        var text = ui.create.div({
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            transition: "font-size 0s",
            color: "#DDD",
            "font-weight": "bold",
            "letter-spacing": "1px",
            "font-size": notice.offsetWidth * fontSizeD + "px",
            "text-shadow": "none",
            "font-family": "jxmx_MainFont",
            "white-space": "nowrap",
        }, notice);
        game.jxmx_testStyleChange(text, notice, function(div1, div2) {
            div1.style["font-size"] = div2.offsetWidth * fontSizeD + "px";
        });
        notice.text = text;
        text.innerHTML = info;
        notice.classList.add("show");
        if (duration !== "forever") {
            setTimeout(() => {
                notice.classList.remove("show");
                setTimeout(() => {
                    notice.remove();
                    if (typeof callback === "function") callback();
                }, 500);
            }, (duration || 0));
        } else {
            if (typeof callback === "function") callback();
        }
        return notice;
    };
    //【封装函数】一次性语音
    game.jxmx_playAudio = function(path, name, callback) {
        return game.playAudio({
            path: `../extension/吉星大冒险/audio/${path}/${name}`,
            onPlay: callback || (() => {}),
        });
    };
}