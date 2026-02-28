import {
    lib,
    game,
    ui,
    get,
    ai,
    _status
} from "../../../noname.js";
game.import("character", function() {
    var jxmx = {
        name: "jxmx",
        //自定义势力
        group: ["jxmxgroup_xing", "jxmxgroup_guai", "jxmxgroup_boss"],
        //势力颜色
        groupnature: {
            "jxmxgroup_xing": "orange",
            "jxmxgroup_guai": "gray",
            "jxmxgroup_boss": "fire",
        },
        //武将分组，更新必要
        characterSort: {
            jxmx: {
                "jxmxsort_friend": ["jxmx_fenni", "jxmx_palunan", "jxmx_alanna", "jxmx_paideman", "jxmx_xiaoding"],
                "jxmxsort_mengxianghao": ["jxmx_haidaowang", "jxmx_shayu", "jxmx_shayupro", "jxmx_haiwangsha"],
                "jxmxsort_enemy": ["jxmx_xiaotou"],
            },
        },
        //武将代码，更新必要
        character: {
            jxmx_haidaowang: ["female", "jxmxgroup_boss", 99, [],
                []
            ],
            jxmx_shayupro: ["male", "jxmxgroup_guai", 30, [],
                []
            ],
            jxmx_shayu: ["male", "jxmxgroup_guai", 10, [],
                []
            ],
            jxmx_xiaotou: ["male", "jxmxgroup_guai", 6, [],
                []
            ],
            jxmx_fenni: ["female", "jxmxgroup_xing", 10, [],
                []
            ],
            jxmx_palunan: ["female", "jxmxgroup_xing", 10, [],
                []
            ],
            jxmx_alanna: ["female", "jxmxgroup_xing", 9, [],
                []
            ],
            jxmx_paideman: ["male", "jxmxgroup_xing", 8, [],
                []
            ],
            jxmx_xiaoding: ["female", "jxmxgroup_xing", 9, [],
                []
            ],
        },
        //武将简介，更新必要
        characterIntro: {
            jxmx_haidaowang: "恋的房东兼游戏搭子，虽然姓天王寺但是恋也并不知晓她的身世。雅央掌管着一栋巨大的公寓和一座浴场。恋和雅央很早之前就认识，两人经常一起玩游戏，所以她们既是对手又是伙伴。<br>雅央不怎么出门，很多人只见过她穿着奇怪睡衣的样子，但听恋说雅央身材非常了得。<br>之所以变成游戏里怪兽的样子，纯粹是因为恋的恶趣味以及打赌输了的结果。",
            jxmx_shayupro: "海盗精锐是力量的化身。但是除了勇猛强悍外好像智商也不是很高的样子，不过最好不要去主动招惹它！",
            jxmx_shayu: "海盗鲨鱼只会傻乎乎的往前攻击，对于别人的反击毫不在意。他们一般听从于他们的老大海盗精锐的命令。",
            jxmx_xiaotou: "对于小浣熊而言，星币并不是什么非常有价值的东西，只是小浣熊对亮晶晶的东西很有占有欲罢了。",
            jxmx_fenni: "格雷森侦探事务所是整个联合城数一数二的私人侦探事务所，芬妮则是事务所的核心。她办理过无数非常级棘手的案件，而这些案件无一例外都得到了完美的解决。<br>不光如此，她还是一位资深的法学博士，拥有联合城颁发的双证。<br>在“天王落”事件后失踪，录入的形象是很久之前的。",
            jxmx_palunan: "联合城的商业传奇，帝国集团的所有者。克里西亚家族是久负盛名的传统家族财团，帕露南让这个帝国更加繁荣，使联合城的各种产业都遍布了克利西亚家族的身影。<br>帕露南很少出现在公共场合，只有很多年前报纸留下的采访照片。",
            jxmx_alanna: "联合城星辉院的修女长。星辉院是联合城政府资助具有孤儿院性质的机构，里面收养了星辉位面各地区的孤儿，阿兰娜也是孤儿的一员。<br>“退魔之夜”事件后加入战斗修女团。她一直帮助维护修道院的日常运营，很少在外露面。",
            jxmx_paideman: "超自然生物，虽然不会对周围的人产生直接的肉体伤害，但是会不断蚕食周围人的精神，使他们陷入神经质，癫狂，自残的精神状态。<br>表达感情和发声都是通过面部的平板电脑，但有传闻说那些声音只是在模仿某人说话。<br>在“天王落”事件后被收容。",
            jxmx_xiaoding: "本苍院的研究员，致力于星辉古文献的研究。她也是密宗的忍者传人，脖子上会说话的围巾是密宗的魔道具“绞毙”。<br>“退魔之夜”事件发生后本苍院被毁，她本人则被政府保护了起来，很少人能见到她。",
        },
        //武将称号，更新必要
        characterTitle: {
            jxmx_haidaowang: "首领敌役",
            jxmx_shayupro: "精英敌役",
            jxmx_shayu: "普通敌役",
            jxmx_xiaotou: "普通敌役",
            jxmx_fenni: "古怪神探",
            jxmx_palunan: "商业之主",
            jxmx_alanna: "社恐修女",
            jxmx_paideman: "社员叔叔",
            jxmx_xiaoding: "暗影忍者",
        },
        //技能代码
        skill: {},
        //翻译
        translate: {
            //角色翻译，更新必要
            jxmx_haidaowang: "海盗王嘎呜",
            jxmx_shayupro: "海盗精锐",
            jxmx_shayu: "海盗鲨鱼",
            jxmx_xiaotou: "小偷",
            jxmx_fenni: "芬妮",
            jxmx_palunan: "帕露南",
            jxmx_alanna: "阿兰娜",
            jxmx_paideman: "派德曼",
            jxmx_xiaoding: "小町",
            //势力翻译
            jxmxgroup_xing: "星",
            jxmxgroup_guai: "怪",
            jxmxgroup_boss: "首",
            //分组翻译
            jxmxsort_friend: "我方角色",
            jxmxsort_mengxianghao: "梦想号敌役",
            jxmxsort_enemy: "其他敌役",
        },
    };
    //自动添加武将图片路径
    if (lib.device || lib.node) {
        for (var i in jxmx.character) {
            jxmx.character[i][4].push("ext:吉星大冒险/image/character/" + i + ".jpg");
        }
    } else {
        for (var i in jxmx.character) {
            jxmx.character[i][4].push("db:extension-吉星大冒险/image/character:" + i + ".jpg");
        }
    }
    return jxmx;
});
lib.config.characters.add("jxmx");
lib.translate["jxmx_character_config"] = "吉星大冒险";
//各角色的战斗属性，更新必要
lib.jxmx_CharFightData = {
    jxmx_haidaowang: {
        attack: 6,
        defense: 6,
        speed: 2,
    },
    jxmx_shayupro: {
        attack: 4,
        defense: 2,
        speed: 2,
    },
    jxmx_shayu: {
        attack: 4,
        defense: 1,
        speed: 3,
    },
    jxmx_xiaotou: {
        attack: 0,
        defense: 0,
        speed: 3,
    },
    jxmx_fenni: {
        attack: 1,
        defense: 2,
        speed: 2,
        gold: 6,
    },
    jxmx_palunan: {
        attack: 1,
        defense: 2,
        speed: 2,
        gold: 6,
    },
    jxmx_alanna: {
        attack: 1,
        defense: 1,
        speed: 3,
        gold: 6,
    },
    jxmx_paideman: {
        attack: 2,
        defense: 2,
        speed: 2,
        gold: 6,
    },
    jxmx_xiaoding: {
        attack: 1,
        defense: 1,
        speed: 3,
        gold: 6,
    },
};