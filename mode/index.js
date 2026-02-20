import {
    lib,
    game,
    ui,
    get,
    ai,
    _status
} from "noname";
var main = {
    name: "StarAdventure",
    init: function() {

    },
    start: function() {
        "step 0"
        //创建页面
        const page = function() {
            //关卡数据
            var stageData = game.jxmx_stageData[0];
            //创建全屏容器
            var container = ui.create.div(".jxmx_container", ui.window);
            //创建背景容器
            var background = ui.create.div(".jxmx_background", container);
            background.classList.add("prohibit");
            background.style.opacity = 0;
            background.scrollFunc = function(div) {
                const num = div.offsetHeight * (div["data-y"] - 1);
                background.scrollTo({
                    top: num,
                    behavior: "smooth",
                });
            };
            ui.jxmx_background = background;
            //创建dialog框架
            var dialog = ui.create.div(".jxmx_dialog", background);
            dialog.setBackgroundImage("extension/吉星大冒险/image/ui/dialog.png");
            background.dialog = dialog;
            //实际区域
            var actual = ui.create.div(".jxmx_actual", dialog);
            background.actual = actual;
            //地块序列
            background.squares = [];
            var lie = 11,
                hang = 13;
            for (var i = 0; i < lie * hang; i++) {
                var x = (i % lie) + 1;
                var y = Math.floor(i / lie) + 1;
                var id = game.jxmx_numToLetters(x) + y;
                //创建地块
                var square = ui.create.div(".jxmx_square", actual);
                square.style.width = "calc(" + (100 / lie) + "% - " + (16 * (lie - 1) / lie) + "px)";
                square["data-x"] = x;
                square["data-y"] = y;
                if (x > 1) square.style.marginLeft = "16px";
                if (y > 1) square.style.marginTop = "13px";
                square.id = id;
                background.squares.push(square);
                square.clicked = false;
                square.onclick = function() {
                    if (this.disabled) return;
                    if (!this.clicked) {
                        this.clicked = true;
                        this.classList.add("canMove");
                    } else {
                        this.classList.remove("canMove");
                        this.classList.add("cannotMove");
                    }
                };
                //创建文本
                var text = ui.create.div({
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    left: 0,
                    top: 0,
                    transition: "font-size 0s",
                    color: "#999",
                    "font-weight": "550",
                    "font-size": square.offsetWidth * 0.225 + "px",
                    "text-shadow": "none",
                    "font-family": "jxmx_MainFont",
                    "white-space": "nowrap",
                }, square);
                game.jxmx_testStyleChange(text, square, function(div1, div2) {
                    div1.style["font-size"] = div2.offsetWidth * 0.225 + "px";
                });
                text.innerHTML = id;
                square.text = text;
                //创建图标
                var icon = ui.create.div(".jxmx_square_icon", square);
                square.icon = icon;
                //若对应关卡数据，赋值
                const data = stageData.square[game.jxmx_numToLetters(x)];
                if (data) {
                    //若有该地块数据
                    if (data[y]) {
                        //暂时禁止出现的模块列表
                        const prohibit = ["enemy", "gold", "shop"];
                        square.effect = !prohibit.includes(data[y]) ? data[y] : "none";
                        icon.setBackgroundImage("extension/吉星大冒险/image/ui/" + data[y] + ".png");
                    }
                    //反之，隐藏该地块
                    else {
                        square.disabled = true;
                        square.classList.add("disabled");
                    }
                }
            }
            //实时调整dialog的高度值
            dialog.style.height = "calc(12% + " + actual.offsetHeight + "px)";
            game.jxmx_testStyleChange(dialog, background, function(div1, div2) {
                div1.style.height = "calc(12% + " + div2.offsetHeight + "px)";
            }, actual);
            //封装函数，使background能够缓慢平移
            function smoothScroll(targetTop, duration, callback) {
                const bg = ui.jxmx_background;
                const startTop = bg.scrollTop;
                const distance = targetTop - startTop;
                let startTime = null;

                function scrollAnimation(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const progress = timestamp - startTime;
                    const percent = Math.min(progress / duration, 1);
                    const ease = percent === 1 ? 1 : 1 - Math.pow(2, -10 * percent);
                    bg.scrollTop = startTop + distance * ease;
                    if (progress < duration) {
                        requestAnimationFrame(scrollAnimation);
                    } else {
                        if (typeof callback === 'function') callback();
                    }
                }
                requestAnimationFrame(scrollAnimation);
            }
            //一个开场小动画
            ui.jxmx_background.style.opacity = 1;
            ui.jxmx_background.dialog.style.transform = "scale(0.425)";
            smoothScroll(ui.jxmx_background.dialog.offsetHeight / 3.55, 4000, function() {
                ui.jxmx_background.dialog.style.transition = "transform 0.5s ease-out";
                ui.jxmx_background.dialog.style.transform = "scale(1)";
                ui.jxmx_background.scrollTop = ui.jxmx_background.dialog.offsetHeight;
                setTimeout(() => {
                    //找到起始点位置
                    var div = ui.jxmx_background.squares.filter(i => i.effect === "start")[0];
                    ui.jxmx_background.scrollFunc(div);
                    //ui.jxmx_background.scrollFunc(ui.jxmx_background.squares[0]);
                    ui.jxmx_background.classList.remove("prohibit");
                }, 500);
            });
        };
        page();
        game.pause();
        //重置牌堆结构
        lib.card.list = lib.cardPile.standard.concat(lib.cardPile.extra)["filter"](i => !["muniu"].includes(i[2]));
        "step 1"
        //游戏结算时处理
        lib.onover.push(function(bool) {
            //修改按钮
            if (ui.restart) ui.restart.close();
            ui.jxmx_back = ui.create.control("返回", function() {
                game.reload();
            });
            ui.jxmx_restart = ui.create.control("重新挑战", function() {
                game.reload();
            });
            //游戏失败的处理
            if (bool === false) {
                //赋空背景音乐

            }
        });
        //覆盖本体的checkResult函数
        game.checkResult = function() {

        };
        //覆盖本体的dieAfter函数
        lib.element.player.dieAfter = function(source) {
            game.checkResult();
        };
        "step 2"
        //重置背景音乐
        game.playBackgroundMusic();
        ui.backgroundMusic.onended = game.playBackgroundMusic;
        //初始化全场角色
        for (var i = 0; i < game.players.length; i++) {
            game.players[i].getId();
        }
        game.chooseCharacter();
        "step 3"
        //关卡简介弹窗
        var dialog = ui.create.dialog("关卡简介");
        dialog.noforcebutton = true;
        dialog.forcebutton = true;
        //获取数组
        var stageInfos = [] || game.jxmx_stageData.stageInfo || [];
        for (var i of stageInfos) {
            dialog.add('<div class="text center">' + '<li>' + i + '</div>');
        }
        dialog.add('<div class="text center">' + '<br><b>对以下卡牌的效果进行了修改</b>' + '</div>');
        dialog.addSmall([
            ["baiyin", "jiu", "tengjia"], "vcard"
        ]);
        game.pause();
        var control = ui.create.control("开始游戏", () => {
            dialog.close();
            control.close();
            game.resume();
        });
        "step 4"
        //切换背景音乐

        "step 5"
        _status.event.trigger("gameStart");
        //这里可以修改一些本体函数
        lib.element.content.gameDraw = function() {
            "step 0"
            event.current = player;
            "step 1"
            //默认摸牌量
            var num = event.current.drawNum || 4;
            //若为我方角色的情况
            if (event.current.identity == "friend") {
                //若不为主视角
                if (event.current != game.me) {
                    event.current.setNickname("需分配" + get.cnNumber(num) + "张");
                    return;
                }
                //定义变量
                event.friends = game.players.filter(i => i != event.current && i.identity == event.current.identity);
                //否则，加上队友的摸牌量
                for (var current of event.friends) {
                    //加上默认摸牌量
                    num += current.drawNum || 4;
                }
            }
            if (num > 0) {
                event.current.directgain(get.cards(num));
                event.current._start_cards = event.current.getCards("h");
            }
            "step 2"
            event.current = event.current.next;
            if (event.current != player) event.goto(1);
            else {
                if (get.config("jxmx_changeCard", "StarAdventure") !== true) event.goto(5);
                else event.count = 7;
            }
            "step 3"
            var text = "是否要使用一次手气卡？<br>你还有" + get.cnNumber(event.count) + "次机会";
            var next = game.me.chooseBool(text);
            next.set("ai", (bool) => false);
            "step 4"
            if (result.bool) {
                game.playAudio('..', 'extension', '吉星大冒险/audio', 'shouqika');
                if (event.count) event.count--;
                var cards = game.me.getCards("h");
                game.me.lose(cards, ui.cardPile);
                game.me.directgain(get.cards(cards.length));
                game.me._start_cards = game.me.getCards("h");
                if (event.count > 0) event.goto(3);
            }
            "step 5"
            if (!event.friends || !event.friends.length) {
                event.finish();
                return;
            }
            var friend = event.friends.shift();
            //默认数量
            var num = friend.drawNum || 4;
            game.me.chooseCardTarget({
                position: "h",
                filterCard: true,
                selectCard: num,
                filterTarget: (card, player, target) => target == friend,
                selectTarget: -1,
                prompt: "【初始手牌】",
                prompt2: "你需分配给" + get.translation(friend) + get.cnNumber(num) + "张初始手牌",
                ai1: (card) => 7 - get.value(card),
                ai2: (target) => get.attitude(game.me, target) - 0,
                forced: true,
            });
            "step 6"
            var cards = result.cards,
                target = result.targets[0];
            game.me.line(target);
            target.gain(cards, "gain2");
            target._start_cards = target.getCards("h");
            if (event.friends && event.friends.length) event.goto(5);
            else game.me._start_cards = game.me.getCards("h");
        }
        "step 6"
        var firstChoose = _status.firstAct;
        game.gameDraw(firstChoose);
        game.phaseLoop(firstChoose);
    },
    game: {
        chooseCharacter: function() {
            var next = game.createEvent("chooseCharacter");
            next.showConfig = true;
            next.setContent(function() {
                "step 0";
                ui.arena.classList.add("choose-character");
                var players = game.jxmx_stageData.players;
                game.enemys = [];
                for (var i = 0; i < game.players.length; i++) {
                    let current = game.players[i];
                    current.name = players[i].name;
                    current.side = players[i].side;
                    current.jxmx_addSkill = players[i].addSkill;
                    current.jxmx_audio = players[i].audio;
                    current.jxmx_hujia = players[i].hujia;
                    if (i == 0) {
                        _status.firstAct = current;
                        game.zhu = current;
                    }
                    if (current.side === false) {
                        game.enemys.push(current);
                        if (players[i].boss === true) game.boss = current;
                    }
                    current.node.name.innerHTML = get.verticalStr(get.cnNumber(i + 1, true) + "号位");
                }
                for (var i = 0; i < game.players.length; i++) {
                    if (game.players[i].side == game.me.side) {
                        game.players[i].node.identity.firstChild.innerHTML = "友";
                        game.players[i].identity = "friend";
                    } else {
                        game.players[i].node.identity.firstChild.innerHTML = "敌";
                        game.players[i].identity = "enemy";
                    }
                    game.players[i].node.identity.dataset.color = game.players[i].side + "zhu";
                }
                "step 1"
                //依次对全场角色执行内容
                for (var current of game.players) {
                    //若本关有变身动画，主角先不执行
                    if (game.jxmx_stageData.video && current == game.zhu) continue;
                    //初始化武将
                    current.init(current.name);
                    //护甲数值覆盖
                    if (typeof current.jxmx_hujia === "number") {
                        current.hujia = current.jxmx_hujia;
                        delete current.jxmx_hujia;
                    }
                    //武将自刷新
                    current.update();
                    //关卡内新增技能
                    if (Array.isArray(current.jxmx_addSkill)) {
                        current.addSkills(current.jxmx_addSkill);
                        delete current.jxmx_addSkill;
                    }
                    //播放语音
                    if (current.jxmx_audio) {
                        game.playAudio('..', 'extension', '吉星大冒险/audio', current.jxmx_audio);
                        delete current.jxmx_audio;
                    }
                }
                "step 2"
                setTimeout(function() {
                    ui.arena.classList.remove("choose-character");
                }, 500);
            });
        },
        //【封装函数】在场上新添一名敌方角色
        jxmx_addEnemyPlayer: function(position, name, num, func) {
            var fellow = game.addPlayer(position || game.players.concat(game.dead)["length"]);
            fellow.getId();
            if (name) {
                fellow.init(name);
            }
            fellow.side = false;
            fellow.node.identity.firstChild.innerHTML = "敌";
            fellow.identity = "enemy";
            fellow.node.identity.dataset.color = fellow.side + "zhu";
            if (num && num > 0) fellow.draw(num);
            if (func && typeof func == "function") func(fellow);
            fellow.update();
            return fellow;
        },
    },
    translate: {

    },
    skill: {
        //全员显示座位号
        _jxmxskill_showPlayerSeatNum: {
            trigger: {
                global: ["gameStart", "phaseBefore"],
            },
            filter: (event, player) => !event.jxmxskill_showPlayerSeatNum,
            silent: true,
            priority: 180,
            firstDo: true,
            content: () => {
                trigger.jxmxskill_showPlayerSeatNum = true;
                for (var current of game.players.concat(game.dead)) {
                    current.setNickname(get.cnNumber((current.seatNum || game.players.indexOf(current) + 1), true) + "号位");
                }
            },
        },
        //修改手牌上限的规则
        _jxmxskill_changeMaxHandcard: {
            //手牌上限默认为4，当前体力值每小于等于当前体力上限的4分之3/2/1时，手牌上限-1
            mod: {
                maxHandcardBase: function(player, num) {
                    var max = 4;
                    for (var i = 3; i >= 1; i--) {
                        if (player.hp <= Math.round(player.maxHp * i / 4)) max--;
                    };
                    return max;
                },
            },
        },
        //发动技能触发冷却机制
        _jxmxskill_coolSystem: {
            trigger: {
                player: ["logSkill", "useSkillAfter"],
            },
            filter: (event, player) => {
                if (event.type != "player") return false;
                var info = get.info(event.skill);
                return typeof info.jxmx === "object" && typeof info.jxmx.round === "number" && info.jxmx.round > 0;
            },
            silent: true,
            priority: 100,
            content: () => {
                var skill = trigger.skill;
                player.jxmx_startCoolSkill(skill);
            },
        },
        //每轮次对冷却技能进行处理
        _jxmxskill_changeCool: {
            trigger: {
                global: "roundStart",
            },
            filter: (event, player) => player.storage.jxmx_skillCool && player.storage.jxmx_skillCool.length,
            silent: true,
            priority: 100,
            marktext: "⏰",
            intro: {
                name: "记录·技能冷却",
                mark: function(dialog, storage, player) {
                    if (!player.storage.jxmx_skillCool || !player.storage.jxmx_skillCool.length) {
                        player.unmarkSkill("_jxmxskill_changeCool");
                        return;
                    }
                    for (var i of player.storage.jxmx_skillCool) {
                        dialog.addText("【" + get.translation(i[0]) + "】" + "剩余" + i[1] + "轮冷却完成");
                    }
                },
                markcount: function(storage, player) {
                    var num = 0;
                    for (var i of player.storage.jxmx_skillCool) {
                        if (num == 0 || i[1] < num) num = i[1];
                    }
                    return num;
                },
            },
            content: function() {
                for (var i of player.storage.jxmx_skillCool) {
                    i[1]--;
                    player.markSkill("_jxmxskill_changeCool");
                    if (i[1] < 1) player.jxmx_overCoolSkill(i[0]);
                }
            },
        },
        //游戏开始技能进入冷却
        _jxmxskill_directCool: {
            trigger: {
                global: "gameStart",
                player: "enterGame",
            },
            filter: (event, player) => {
                var skills = player.getSkills(null, false, false);
                skills = skills.filter(skill => {
                    var info = get.info(skill);
                    return typeof info.jxmx === "object" && typeof info.jxmx.round === "number" && info.jxmx.round > 0;
                });
                if (!skills.length) return false;
                event.skills = skills;
                return true;
            },
            silent: true,
            priority: 100,
            content: () => {
                for (var skill of trigger.skills) {
                    player.jxmx_startCoolSkill(skill);
                }
            },
        },
    },
    card: {

    },
    element: {
        content: {

        },
        player: {
            //开始某技能冷却
            jxmx_startCoolSkill: function(skill, round) {
                if (typeof round !== "number") round = get.info(skill).jxmx.round;
                if (!this.storage.jxmx_skillCool) this.storage.jxmx_skillCool = [];
                this.disableSkill(skill + "_skillCool", skill);
                //重复改为刷新冷却轮数
                if (this.storage.jxmx_skillCool.some(i => i[0] == skill)) {
                    for (var i of this.storage.jxmx_skillCool) {
                        if (i[0] == skill) i[1] = round;
                    }
                } else this.storage.jxmx_skillCool.add([skill, round]);
                this.markSkill("_jxmxskill_changeCool");
                game.log(this, "的技能", "#g【" + get.translation(skill) + "】", "开始了冷却！");
            },
            //终止某技能冷却
            jxmx_overCoolSkill: function(skill) {
                if (!this.storage.jxmx_skillCool || !this.storage.jxmx_skillCool.length) return;
                for (var i of this.storage.jxmx_skillCool) {
                    if (i[0] == skill) {
                        this.enableSkill(i[0] + "_skillCool");
                        i[1] = 0;
                    }
                }
                this.storage.jxmx_skillCool = this.storage.jxmx_skillCool.filter(i => i[1] > 0);
                this.markSkill("_jxmxskill_changeCool");
                if (!this.storage.jxmx_skillCool.length) this.unmarkSkill("_jxmxskill_changeCool");
                this.popup(skill);
                game.log(this, "的技能", "#g【" + get.translation(skill) + "】", "结束了冷却！");
            },
        },
        card: {

        },
        event: {

        }
    },
    get: {
        rawAttitude: function(from, to) {
            if (from.side == to.side) return 10;
            return -10;
        },
    },
    help: {

    }
};
var config = {

}
game.addMode("StarAdventure", main, {
    extension: "吉星大冒险",
    translate: "吉星大冒险",
    config: config,
});