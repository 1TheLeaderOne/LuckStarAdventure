import { Jxmx } from "../src/jxmx";
import { LuckStarSkin } from "../src/skin";
import { LuckStarUtil } from "../src/util";

declare interface JxmxManager extends Jxmx {
    util:LuckStarUtil;
    skin:LuckStarSkin;
}