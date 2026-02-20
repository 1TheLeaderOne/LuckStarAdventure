import { lib,game } from "noname";

export class LuckStarUtil {
    config(value:string,ext:string | undefined | null = "吉星大冒险"){
        if(ext === null || ext === undefined) return lib.config[value];
        return lib.config[`extension_${ext}_${value}`];
    }
    saveConfig(key:string,value:any,ext:string | undefined | null = "吉星大冒险"){
        let name:string = (ext === null || ext === undefined) ? key : `extension_${ext}_${key}`;
        game.saveConfig(name,value);
    }
}

export const luckStarUtil = new LuckStarUtil();

window.jxmx.register("util", luckStarUtil);