import {
    lib,
    game,
    ui,
    get,
    ai,
    _status
} from "noname";
export const type = "extension";
import content from './source/content.js'
import precontent from './source/precontent.js'
import config from './source/config.js'
import help from './source/help.js'
import character from './source/packages/main/character.js'
import skill from './source/packages/main/skill.js'
import card from './source/packages/main/card.js'
import basic from './source/basic.js'
import "./mode/index.js";
import "./mode/character.js";

export default async function() {
    const path = basic.extensionDirectoryPath;
    const extensionInfo = await lib.init.promises.json(path + 'info.json');
    const extensionPackage = {
        name: extensionInfo.name,
        editable: false,
        content,
        precontent,
        config,
        help,
        package: {
            character,
            card,
            skill
        },
        files: {
            character: [],
            card: [],
            skill: [],
            audio: []
        }
    };
    //存储此扩展数据
    if (!lib.jxmx_data) lib.jxmx_data = {};
    Object.assign(lib.jxmx_data, {
        extensionInfo,
        path
    });

    Object.keys(extensionInfo).filter(key => key != 'name').forEach(key => extensionPackage.package[key] = extensionInfo[key]);
    return extensionPackage;
};