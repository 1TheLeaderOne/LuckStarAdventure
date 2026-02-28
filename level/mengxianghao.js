export default {
    name: "mengxianghao",
    title: "梦想号",
    lie: 11,
    hang: 13,
    player: 3,
    music: "mengxianghao.mp3",
    stageInfo: [
        "请于<b><font color=fire>20轮</font></b>内取得游戏胜利，否则游戏失败！",
        "第一轮：刷新4个【海盗鲨鱼】<br><b><font color=orange>〖全击败使我方获得筹码〗</font></b>",
        "第三轮：刷新【海盗王嘎呜】<br><b><font color=orange>〖击败取得游戏胜利〗</font></b>",
        "第六轮：刷新2个【海盗精锐】、敌方攻击力与防御力+1<br><b><font color=orange>〖全击败轮次-1、我方获得筹码〗</font></b>",
        "第九轮：【海盗王嘎呜】失去技能【休眠】，开始行动！",
        ["jxmx_shayu", "jxmx_shayupro", "jxmx_haidaowang"],
    ],
    roundEvent: {
        1: {
            name: "dataosha",
            title: "大逃鲨",
            intro: "刷新三个【海盗鲨鱼】",
            effect: async function() {
                for (var i = 0; i < 3; i++) {
                    await game.jxmx_addEnemy(null, "jxmx_shayu", 4);
                }
            },
        },
        3: {
            name: "xiumianzhongzhi",
            title: "休眠终止",
            intro: "【海盗王嘎呜】刷新在场上",
            effect: async function() {
                await game.jxmx_addEnemy(null, "jxmx_haidaowang", 4);
            },
        },
        6: {
            name: "shashoujianglin",
            title: "鲨手降临",
            intro: "刷新两个【海盗精锐】；敌方攻击力+1、防御力+1",
            effect: async function() {
                for (var i = 0; i < 2; i++) {
                    await game.jxmx_addEnemy(null, "jxmx_shayupro", 4);
                }
            },
        },
        9: {
            name: "kongbuzhuiji",
            title: "恐怖追击",
            intro: "【海盗王嘎呜】失去技能【休眠】，开始行动",
            effect: async function() {
                await game.boss.removeSkills([]);
            },
        },
    },
    square: {
        "A": {
            8: "speed",
            9: "card",
            10: "event",
        },
        "B": {
            7: "damage",
            9: "enemy",
            11: "transport",
        },
        "C": {
            3: "recover",
            4: "gold",
            5: "start",
            6: "enemy",
            9: "shop",
            11: "gold",
        },
        "D": {
            2: "transport",
            9: "event",
            12: "recover",
        },
        "E": {
            1: "event",
            2: "damage",
            3: "attack",
            4: "card",
            5: "start",
            6: "speed",
            7: "event",
            8: "enemy",
            9: "attack",
            10: "damage",
            13: "enemy",
        },
        "F": {
            1: "upgrade",
            11: "shop",
            12: "gold",
            13: "start",
        },
        "G": {
            1: "event",
            2: "damage",
            3: "attack",
            4: "card",
            5: "start",
            6: "speed",
            7: "event",
            8: "enemy",
            9: "attack",
            10: "damage",
            13: "enemy",
        },
        "H": {
            2: "transport",
            9: "event",
            12: "recover",
        },
        "I": {
            3: "recover",
            4: "gold",
            5: "start",
            6: "enemy",
            9: "shop",
            11: "gold",
        },
        "J": {
            7: "damage",
            9: "enemy",
            11: "transport",
        },
        "K": {
            8: "speed",
            9: "card",
            10: "event",
        },
    },
}