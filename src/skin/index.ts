import { lib } from "noname";
import { luckStarUtil } from "../util";

export class LuckStarSkin {
	/**
	 * 皮肤数据,用于同步
	 */
	private storeSkins: Record<string, [string, string | undefined]> = {};

	/**
	 * 是否正在同步皮肤数据
	 */
	private _isSyncing = false;

	syncSkin({ key, value, del }: { key: string; value?: [string, string | undefined]; del?: boolean }) {
		if (del === true) {
			delete this.storeSkins[key];
			delete lib.config.skin[key];
			luckStarUtil.saveConfig("skin", lib.config.skin, undefined);
		} else {
			if (value === void 0) throw new Error("value is undefined");
			this.storeSkins[key] = value;
			lib.config.skin[key] = value;
			luckStarUtil.saveConfig("skin", lib.config.skin, undefined);
		}
	}

	/**
	 * 将本体皮肤数据格式转变为千幻、驶舰之向数据格式
	 * - 若值为 [string, string] 数组，则取第一个元素；
	 * - 否则保留原始值不变。
	 */
	transformSkinData(data: Record<string, unknown>): Record<string, string> {
		return Object.fromEntries(
			Object.entries(data).map(([key, value]) => {
				if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
					return [key, value[0]];
				}
				return [key, String(value)];
			})
		);
	}

	/**
	 * 检查皮肤设置,不全的自动补全,并且判断是否需要同步
	 */
	checkSkinSetting() {
		lib.config.qhly_skinset ??= {
			skin: {
				//key-value方式，存放武将皮肤名
			},
			skinAudioList: {
				//key-value方式，存放武将皮肤配音
			},
			audioReplace: {
				//key-value方式，存放配音映射逻辑。
			},
			djtoggle: {},
		};
		lib.config.qhly_skinset.skin ??= {};
		lib.config.qhly_skinset.skinAudioList ??= {};
		lib.config.qhly_skinset.audioReplace ??= {};
		lib.config.qhly_skinset.djtoggle ??= {};

		lib.config.skin ??= {};
	}

    /**
     * 同步所有皮肤配置
     */
	syncAllSkinConfig() {
		if (this._isSyncing) return;
		this._isSyncing = true;
		this.checkSkinSetting();

		const self = this;

		const loadFrom = (obj: Record<string, any>, isTransformed: boolean) => {
			for (const key in obj) {
				const val = obj[key];
				if (isTransformed) {
					if (typeof val === "string") {
						const existing = self.storeSkins[key];
						//@ts-ignore
						const path = self.getCharacterSkin(key, whichWayFile.removeExt(val))?.path ?? existing?.[1];
						self.storeSkins[key] = [val, path];
					}
				} else {
					if (Array.isArray(val) && val.length >= 1 && typeof val[0] === "string") {
						self.storeSkins[key] = [val[0], val[1]];
					} else if (typeof val === "string") {
						self.storeSkins[key] = [val, undefined];
					}
				}
			}
		};

		loadFrom(lib.config.skin || {}, false);
		loadFrom(lib.config.qhly_skinset?.skin || {}, true);

		try {
			const full = { ...this.storeSkins };
			const simple = this.transformSkinData(full);

			lib.config.skin = full;
			lib.config.qhly_skinset.skin = simple;
			window.whichWaySave.skinConfig = simple;

			luckStarUtil.saveConfig("skin", full, undefined);
			luckStarUtil.saveConfig("qhly_skinset", lib.config.qhly_skinset, undefined);
		} finally {
			this._isSyncing = false;
		}
	}
}

export const luckStarSkin = new LuckStarSkin();

window.jxmx.register("skin", luckStarSkin);
