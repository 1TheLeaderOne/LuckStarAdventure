import {
    lib,
    game,
    ui,
    get,
    ai,
    _status
} from "../../../noname.js";
var main = {
    name: "StarAdventure",
    init: function() {
        //这里先默认选第一个关卡，后面考虑搞选关ui
        game.jxmx_stageData = game.jxmx_stageDataList[0];
    },
    start: function() {
        "step 0"
        //更换背景音乐
        game.jxmx_changeBgm("initial.mp3");
        //调整牌堆结构
        game.jxmx_changeCardList();
        //调整卡牌效果
        game.jxmx_changeCardEffect();
        //适配全局特效
        for (var i of Object.keys(lib.skill).filter(i => i.indexOf("diankuangtulu") != -1)) {
            lib.skill[i].filter = function(event, player) {
                return event.num >= 6 && event.num < 10;
            };
        }
        for (var i of Object.keys(lib.skill).filter(i => i.indexOf("wanjunqushou") != -1)) {
            lib.skill[i].filter = function(event, player) {
                return event.num >= 10;
            };
        }
        //创建我方角色
        game.prepareArena(game.jxmx_stageData.player);
        "step 1"
        //初始化全场角色
        for (var i = 0; i < game.players.length; i++) {
            game.players[i].getId();
        }
        game.chooseCharacter();
        //全场角色显示手牌上限
        if (lib.config.jxmx_showMaxHandCard) game.jxmx_showMaxHandCard();
        "step 2"
        //关卡弹窗
        var dialog = ui.create.dialog("任务目标");
        dialog.noforcebutton = true;
        dialog.forcebutton = true;
        //获取数组
        var stageInfo = game.jxmx_stageData.stageInfo || [];
        for (var i of stageInfo) {
            if (Array.isArray(i)) {
                dialog.addAuto([i, lib.character[i[0]] != undefined ? "character" : "card"]);
            } else dialog.add('<div class="text center">' + '<li>' + i + '</div>');
        }
        game.pause();
        var control = ui.create.control("开始游戏", () => {
            dialog.close();
            control.close();
            game.resume();
            //切换背景音乐
            game.jxmx_changeBgm(game.jxmx_stageData.music);
            //添加顶部按钮
            ui.jxmx_stageInfo = ui.create.system("任务", null, true);
            lib.setPopped(ui.jxmx_stageInfo, function() {
                let info = game.jxmx_stageData;
                var uiintro = ui.create.dialog('hidden');
                uiintro.add("<b>「" + info.title + "」</b>");
                var str = game.jxmx_stageData.stageInfo || [];
                var intro;
                if (Array.isArray(str)) {
                    intro = '<ul style="text-align:left;margin-top:0;width:450px">';
                    for (var i = 0; i < str.length; i++) {
                        if (Array.isArray(str[i])) continue;
                        intro += '<li>' + str[i];
                    }
                    intro += '</ul>'
                } else {
                    intro = str;
                }
                uiintro.add('<div class="text center">' + intro + '</div>');
                var ul = uiintro.querySelector('ul');
                if (ul) {
                    ul.style.width = '180px';
                }
                uiintro.add(ui.create.div('.placeholder'));
                return uiintro;
            }, 250);
        });
        "step 3"
        //游戏结算时处理
        lib.onover.push(function(bool) {
            //修改按钮
            if (ui.restart) ui.restart.close();
            ui.jxmx_back = ui.create.control("返回", function() {
                game.reload();
            });
            ui.jxmx_restart = ui.create.control("重新开始", function() {
                game.reload();
            });
            //游戏胜利的处理
            if (bool === true) {
                game.jxmx_changeBgm("win.mp3");
            }
        });
        //覆盖本体的checkResult函数
        game.checkResult = function() {
            //若我方角色已全部阵亡，游戏失败
            if (!game.players.some(i => i.side == true)) {
                game.over(false);
            }
        };
        //覆盖本体的dieAfter函数
        lib.element.player.dieAfter = function(source) {
            game.checkResult();
        };
        "step 4"
        _status.event.trigger("gameStart");
        "step 5"
        var firstChoose = _status.firstAct;
        game.gameDraw(firstChoose);
        "step 6"
        game.delay(window.decadeUI ? 2 : 1);
        "step 7"
        //创建页面
        const page = function() {
            //关卡数据
            var stageData = game.jxmx_stageData;
            //创建全屏容器
            var container = ui.create.div(".jxmx_container", ui.window);
            container.changeOpacity = function(num) {
                this.opacityUI.updateUI(num);
                this.style["pointer-events"] = num === 100 ? "" : "none";
            };
            ui.jxmx_container = container;
            //透明度调整ui
            var createOpacityUI = function() {
                var opacityUI = ui.create.div(".jxmx_opacityUI", ui.window);
                opacityUI.classList.add("opacity");
                container.opacityUI = opacityUI;
                //监听DOM变化，opacityUI随container删除而删除
                const observer = new MutationObserver(() => {
                    if (!ui.window.contains(ui.jxmx_container)) {
                        ui.jxmx_container.opacityUI.remove();
                        delete ui.jxmx_container;
                        delete ui.jxmx_background;
                        observer.disconnect();
                    }
                });
                observer.observe(ui.window, {
                    childList: true,
                    subtree: true
                });
                var value = ui.create.div({
                    position: "absolute",
                    left: "50%",
                    top: "3%",
                    transform: "translate(-50%, 0)",
                    transition: "font-size 0s",
                    color: "#333",
                    "font-weight": "bold",
                    "font-size": opacityUI.offsetWidth * 0.225 + "px",
                    "text-shadow": "none",
                    "font-family": "jxmx_MainFont",
                    "white-space": "nowrap",
                }, opacityUI);
                game.jxmx_testStyleChange(value, opacityUI, function(div1, div2) {
                    div1.style["font-size"] = div2.offsetWidth * 0.225 + "px";
                });
                value.onclick = function(event) {
                    if (event.isTrusted) game.jxmx_playAudio("ui", "click");
                    opacityUI.classList.add("bright");
                    if (!get.config("OpacityUI-Always", "StarAdventure")) {
                        setTimeout(() => {
                            opacityUI.classList.remove("bright");
                        }, 500);
                    }
                    var num = opacityUI.value !== 0 ? 0 : 100;
                    if (event.isTrusted) num = opacityUI.value !== 100 ? 100 : 0;
                    container.changeOpacity(num);
                    if (num === 100) background.classList.remove("prohibit");
                    else background.classList.add("prohibit");
                };
                var container2 = ui.create.div(".jxmx_opacityUI_container", opacityUI);
                var fill = ui.create.div(".jxmx_opacityUI_fill", container2);
                var thumb = ui.create.div(".jxmx_opacityUI_thumb", container2);
                var label = ui.create.div({
                    position: "absolute",
                    left: "50%",
                    bottom: "2%",
                    transform: "translate(-50%, 0)",
                    transition: "font-size 0s",
                    color: "#666",
                    "font-weight": "bold",
                    "font-size": opacityUI.offsetWidth * 0.225 + "px",
                    "text-shadow": "none",
                    "font-family": "jxmx_MainFont",
                    "white-space": "nowrap",
                }, opacityUI);
                game.jxmx_testStyleChange(label, opacityUI, function(div1, div2) {
                    div1.style["font-size"] = div2.offsetWidth * 0.225 + "px";
                });
                label.onclick = function() {
                    game.jxmx_playAudio("ui", "click");
                    value.click();
                };
                label.innerHTML = "透明度";
                var isDragging = false;
                var current = 100;

                function updateSlider(y) {
                    const rect = container2.getBoundingClientRect();
                    const percent = Math.min(100, Math.max(0, 100 - ((y - rect.top) / rect.height) * 100));
                    current = percent;
                    fill.style.height = percent + "%";
                    thumb.style.bottom = percent + "%";
                    value.innerHTML = Math.round(percent) + "%";
                    opacityUI.value = Math.round(percent);
                    container.style.opacity = Math.round(percent) / 100;
                }
                opacityUI.updateUI = function(percent) {
                    fill.style.height = percent + "%";
                    thumb.style.bottom = percent + "%";
                    value.innerHTML = Math.round(percent) + "%";
                    opacityUI.value = Math.round(percent);
                    if (container) container.style.opacity = Math.round(percent) / 100;
                };

                function start(e) {
                    isDragging = true;
                    opacityUI.classList.add("bright");
                    thumb.classList.add("active");
                    if (opacityUI.value === 100) container.style["pointer-events"] = "none";
                    updateSlider(e.clientY || (e.touches ? e.touches[0].clientY : 0));
                }

                function move(e) {
                    if (!isDragging) return;
                    updateSlider(e.clientY || (e.touches ? e.touches[0].clientY : 0));
                }

                function end() {
                    isDragging = false;
                    thumb.classList.remove("active");
                    const num = opacityUI.value;
                    container.style["pointer-events"] = num === 100 ? "" : "none";
                    if (num === 100) background.classList.remove("prohibit");
                    else background.classList.add("prohibit");
                    if (!get.config("OpacityUI-Always", "StarAdventure")) {
                        setTimeout(() => {
                            opacityUI.classList.remove("bright");
                        }, 500);
                    }
                }
                container2.addEventListener("mousedown", start);
                container2.addEventListener("mousemove", move);
                container2.addEventListener("mouseup", end);
                container2.addEventListener("touchstart", start);
                container2.addEventListener("touchmove", move);
                container2.addEventListener("touchend", end);
                //初始化
                updateSlider(container2.getBoundingClientRect().top + (100 - current) / 100 * container2.offsetHeight);
            };
            createOpacityUI();
            //创建背景容器
            var background = ui.create.div(".jxmx_background", container);
            ui.jxmx_background = background;
            background.classList.add("prohibit");
            background.style.opacity = 0;
            background.smoothScroll = function(targetTop, duration, callback) {
                const bg = this;
                const startTop = bg.scrollTop;
                const distance = targetTop - startTop;
                const native = duration === "native";
                if (native) {
                    const absDistance = Math.abs(distance);
                    duration = 300 + 600 * (absDistance / 1000);
                }
                let startTime = null;

                function scrollAnimation(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const progress = timestamp - startTime;
                    const percent = Math.min(progress / duration, 1);
                    var ease = 1 - Math.pow(1 - percent, 1.5);
                    //if (native) ease = percent === 1 ? 1 : 1 - Math.pow(2, -10 * percent);
                    bg.scrollTop = startTop + distance * ease;
                    if (progress < duration) {
                        if (bg.pauseSmoothScroll) delete bg.pauseSmoothScroll;
                        else requestAnimationFrame(scrollAnimation);
                    } else {
                        if (native) bg.scrollTop = targetTop;
                        if (typeof callback === "function") {
                            if (native) callback();
                            else setTimeout(callback, 500);
                        }
                    }
                }
                requestAnimationFrame(scrollAnimation);
            }
            background.scrollFunc = function(div, callback) {
                const num = div.offsetHeight * (div["data-y"] - 1);
                this.smoothScroll(num, "native", callback);
            };
            //创建dialog框架
            var dialog = ui.create.div(".jxmx_dialog", background);
            dialog.setBackgroundImage("extension/吉星大冒险/image/ui/dialog.png");
            background.dialog = dialog;
            //实际区域
            var actual = ui.create.div(".jxmx_actual", dialog);
            background.actual = actual;
            //格子序列
            background.squares = [];
            var lie = stageData.lie,
                hang = stageData.hang;
            for (var i = 0; i < lie * hang; i++) {
                var x = (i % lie) + 1;
                var y = Math.floor(i / lie) + 1;
                var id = game.jxmx_numToLetters(x) + y;
                //创建格子
                var square = ui.create.div(".jxmx_square", actual);
                square.style.width = "calc(" + (100 / lie) + "% - " + (16 * (lie - 1) / lie) + "px)";
                square["data-x"] = x;
                square["data-y"] = y;
                if (x > 1) square.style.marginLeft = "16px";
                if (y > 1) square.style.marginTop = "13px";
                square.id = id;
                background.squares.push(square);
                square.addPlayer = function(player, isMove) {
                    const func = () => {
                        this.player = player;
                        player.square = this;
                        if (!player.direction) {
                            //默认朝下
                            var direction = "bottom";
                            //若在最左侧，改为朝右
                            if (this["data-x"] == 1) direction = "right";
                            //若在最右侧，改为朝左
                            else if (this["data-x"] == lie) direction = "left";
                            //若在最下侧，改为朝上
                            if (this["data-y"] == hang) direction = "top";
                            //赋值朝向
                            player.direction = direction;
                        }
                        this.style["border-" + player.direction] = "4px solid #FFD700";
                        const avatar = this.avatar;
                        avatar.setBackgroundImage("extension/吉星大冒险/image/avatar/" + player.name + ".png");
                        avatar.text.innerHTML = player.node.name.innerHTML.slice(0, 5);
                        avatar.classList.add(player.identity);
                        avatar.classList.add("show");
                        const gameSpeed = Number(get.config("jxmx_gameSpeed", "StarAdventure")) / 2;
                        avatar.style.transition = `transform ${gameSpeed / 1000}s ease-out`;
                        avatar.style.transform = "translate(-50%, -50%)";
                        setTimeout(() => {
                            avatar.style.transition = "";
                        }, gameSpeed);
                    };
                    game.jxmx_playAudio("ui", "player-" + (isMove ? "move" : "in"), func);
                };
                square.removePlayer = function(player) {
                    const avatar = this.avatar;
                    avatar.classList.remove("show");
                    const gameSpeed = Number(get.config("jxmx_gameSpeed", "StarAdventure")) / 2;
                    avatar.style.transition = `transform ${gameSpeed / 1000}s ease-out`;
                    avatar.style.transform = "translate(-50%, -50%) scale(1.5)";
                    setTimeout(() => {
                        avatar.style.transition = "";
                    }, gameSpeed);
                    this.style.border = "";
                    delete this.player;
                    delete player.square;
                    delete player.direction;
                    avatar.style.backgroundImage = "";
                    avatar.text.innerHTML = "";
                    avatar.classList.remove(player.identity);
                };
                square.movePlayer = function(player) {
                    const fromSquare = player.square;
                    fromSquare.removePlayer(player);
                    this.addPlayer(player, true);
                };
                square.getLook = function(callback) {
                    //尝试居中，定位到其正上一个
                    var div = background.squares.filter(i => i["data-x"] == this["data-x"] && this["data-y"] - i["data-y"] == 1);
                    //若没有就只能是自己了
                    if (!div.length) div = this;
                    else div = div[0];
                    background.scrollFunc(div, callback);
                };
                //创建文本
                var text = ui.create.div({
                    //opacity: 0,
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
                //创建人物头像
                var avatar = ui.create.div(".jxmx_square_avatar", square);
                square.avatar = avatar;
                //创建头像文本
                var text = ui.create.div({
                    position: "absolute",
                    left: "50%",
                    bottom: "0%",
                    transform: "translate(-50%, 0)",
                    transition: "font-size 0s",
                    color: "white",
                    filter: "url(#jxmx_textStroke_0)",
                    "font-weight": "bold",
                    "font-size": avatar.offsetWidth * 0.225 + "px",
                    "text-shadow": "none",
                    "font-family": "jxmx_MainFont",
                    "white-space": "nowrap",
                }, avatar);
                game.jxmx_testStyleChange(text, avatar, function(div1, div2) {
                    div1.style["font-size"] = div2.offsetWidth * 0.225 + "px";
                });
                avatar.text = text;
                //若对应关卡数据，赋值
                const data = stageData.square[game.jxmx_numToLetters(x)];
                if (data) {
                    //若有该格子数据
                    if (data[y]) {
                        //禁止出现的模块列表
                        const prohibit = ["enemy", "attack"];
                        square.effect = !prohibit.includes(data[y]) ? data[y] : "none";
                        if (!prohibit.includes(data[y])) icon.setBackgroundImage("extension/吉星大冒险/image/ui/" + data[y] + ".png");
                    }
                    //反之，隐藏该格子
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
            //一个开场小动画
            background.style.transition = "opacity 1s ease-out";
            background.style.opacity = 1;
            background.dialog.style.transform = "scale(0.425)";
            background.scrollTop = 0;
            const duration = Number(get.config("jxmx_gameSpeed", "StarAdventure")) + 500;
            background.smoothScroll(background.scrollHeight / 2, duration);
            setTimeout(() => {
                background.pauseSmoothScroll = true;
                background.dialog.style.transition = "transform 0.5s ease-out";
                background.dialog.style.transform = "scale(1)";
                background.scrollTop = background.dialog.offsetHeight;
                setTimeout(() => {
                    var divList = background.squares;
                    setTimeout(() => {
                        //所有起始点列表
                        var divs = divList.filter(i => i.effect === "start");
                        //依次将我方角色随机安置在一个起始点
                        var players = game.friends.slice();
                        var func = function() {
                            var current = players.shift();
                            var div = divs.filter(i => !i.player).randomGet();
                            div.getLook(function() {
                                div.addPlayer(current);
                                div.classList.add("canMove-" + current.identity);
                                setTimeout(() => {
                                    div.classList.remove("canMove-friend");
                                    div.classList.remove("canMove-enemy");
                                    if (players.length) func();
                                    else {
                                        game.phaseLoop(_status.firstAct);
                                        game.resume();
                                    }
                                }, (250 * (Number(get.config("jxmx_gameSpeed", "StarAdventure")) / 500 + 1)));
                            });
                        };
                        func();
                    }, 250);
                }, 500);
            }, duration / 2);
        };
        page();
        game.pause();
    },
    game: {
        chooseCharacter: function() {
            var next = game.createEvent("chooseCharacter");
            next.showConfig = true;
            next.setContent(function() {
                "step 0";
                ui.arena.classList.add("choose-character");
                event.players = game.filterPlayer();
                game.friends = [];
                event.characterList = Object.keys(lib.characterPack.jxmx).filter(i => lib.character[i][1] == "jxmxgroup_xing");
                //更换背景音乐
                game.jxmx_changeBgm("chooseCharacter.mp3");
                "step 1"
                event.current = event.players.shift();
                if (!game.zhu) {
                    game.zhu = event.current;
                    _status.firstAct = event.current;
                }
                event.current.classList.add("selectedx");
                var dialog = ui.create.dialog("选择你的角色", "hidden");
                dialog.add([event.characterList.randomGets(5), "character"]);
                event.dialog = dialog;
                var next = game.me.chooseButton(true);
                next.set("dialog", event.dialog);
                next.set("filterButton", button => !game.findPlayer(i => i.name == button.link));
                next.set("ai", () => Math.random());
                //定义【更换】按钮
                ui.create.cheat = function() {
                    _status.createControl = ui.cheat2;
                    ui.cheat = ui.create.control("更换", function() {
                        if (ui.cheat2 && ui.cheat2.dialog == _status.event.dialog) {
                            return;
                        }
                        if (game.changeCoin) {
                            game.changeCoin(-3);
                        }
                        var buttons = ui.create.div(".buttons");
                        var node = _status.event.dialog.buttons[0].parentNode;
                        _status.event.dialog.buttons = ui.create.buttons(event.characterList.randomGets(5), "character", buttons);
                        _status.event.dialog.content.insertBefore(buttons, node);
                        buttons.addTempClass("start");
                        node.remove();
                        game.uncheck();
                        game.check();
                    });
                    delete _status.createControl;
                };
                var createCharacterDialog = function() {
                    event.dialogxx = ui.create.characterDialog("heightset", function(name) {
                        if (lib.character[name][1] == "jxmxgroup_xing") return false;
                        return true;
                    });
                    if (ui.cheat2) {
                        ui.cheat2.addTempClass("controlpressdownx", 500);
                        ui.cheat2.classList.remove("disabled");
                    }
                };
                if (lib.onfree) {
                    lib.onfree.push(createCharacterDialog);
                } else {
                    createCharacterDialog();
                }
                ui.create.cheat2 = function() {
                    ui.cheat2 = ui.create.control("自由选将", function() {
                        if (this.dialog == _status.event.dialog) {
                            if (game.changeCoin) {
                                game.changeCoin(10);
                            }
                            this.dialog.close();
                            _status.event.dialog = this.backup;
                            this.backup.open();
                            delete this.backup;
                            game.uncheck();
                            game.check();
                            if (ui.cheat) {
                                ui.cheat.addTempClass("controlpressdownx", 500);
                                ui.cheat.classList.remove("disabled");
                            }
                        } else {
                            if (game.changeCoin) {
                                game.changeCoin(-10);
                            }
                            this.backup = _status.event.dialog;
                            _status.event.dialog.close();
                            _status.event.dialog = _status.event.parent.dialogxx;
                            this.dialog = _status.event.dialog;
                            this.dialog.open();
                            game.uncheck();
                            game.check();
                            if (ui.cheat) {
                                ui.cheat.classList.add("disabled");
                            }
                        }
                    });
                    if (lib.onfree) {
                        ui.cheat2.classList.add("disabled");
                    }
                };
                //创建【更换】按钮
                ui.create.cheat();
                //创建【自由选将】按钮
                ui.create.cheat2();
                "step 2"
                if (ui.cheat) {
                    ui.cheat.remove();
                    delete ui.cheat;
                }
                if (ui.cheat2) {
                    ui.cheat2.remove();
                    delete ui.cheat2;
                }
                event.dialog.close();
                var link = result.links[0];
                event.characterList.remove(link);
                event.current.init(link);
                event.current.jxmx_initFightData();
                event.current.side = true;
                event.current.identity = "friend";
                event.current.node.identity.firstChild.innerHTML = "友";
                event.current.node.identity.dataset.color = event.current.side + "zhu";
                event.current.classList.remove("selectedx");
                game.friends.add(event.current);
                "step 3"
                if (event.players.length) event.goto(1);
                "step 4"
                setTimeout(function() {
                    ui.arena.classList.remove("choose-character");
                }, 500);
            });
        },
        //【封装函数】添加一名敌方角色
        jxmx_addEnemy: async function(position, name, num, callback) {
            var fellow = game.addPlayer(position || game.players.concat(game.dead).length);
            fellow.getId();
            if (name) {
                fellow.init(name);
                fellow.jxmx_initFightData();
                fellow.node.name.innerHTML += game.players.concat(game.dead).filter(i => i.name == name).length;
            }
            fellow.side = false;
            fellow.node.identity.firstChild.innerHTML = "敌";
            fellow.identity = "enemy";
            fellow.node.identity.dataset.color = fellow.side + "zhu";
            fellow.seatNum = Number(fellow.dataset.position) + 1;
            //调整十周年UI里角色的可视化座位的汉写数字
            if (lib.config.extension_十周年UI_enable) {
                if (!fellow.node.seat) fellow.node.seat = decadeUI.element.create("seat", fellow);
                fellow.node.seat.innerHTML = get.cnNumber(fellow.seatNum, true);
            }
            if (!game.enemys) game.enemys = [];
            game.enemys.add(fellow);
            if (num && num > 0) fellow.directgain(get.cards(num));
            if (callback && typeof callback === "function") callback(fellow);
            fellow.update();
            var squares = ui.jxmx_background.squares;
            squares = squares.filter(i => !i.player && !i.disabled);
            var square = squares.randomGet();
            await new Promise(resolve => {
                square.getLook(function() {
                    square.addPlayer(fellow);
                    square.classList.add("canMove-" + fellow.identity);
                    setTimeout(() => {
                        square.classList.remove("canMove-friend");
                        square.classList.remove("canMove-enemy");
                        resolve();
                    }, (250 * (Number(get.config("jxmx_gameSpeed", "StarAdventure")) / 500 + 1)));
                });
            });
            return fellow;
        },
        //【封装函数】星趴卡牌动画
        jxmx_starCardAnimation: function(Name, Title, Intro) {
            return new Promise(resolve => {
                //播放入场音效
                game.jxmx_playAudio("ui", "starCard-in", () => {
                    //创建框架
                    var frame = ui.create.div(".jxmx_starCard", ui.window);
                    //创建图像
                    var image = ui.create.div(".jxmx_starCard_image", frame);
                    image.setBackgroundImage("extension/吉星大冒险/image/ui/" + Name + ".png");
                    //创建点缀
                    var decorate = ui.create.div(".jxmx_starCard_decorate", frame);
                    //创建标题
                    var title = ui.create.div(".jxmx_starCard_title", frame);
                    //标题文本
                    var text = ui.create.div({
                        display: "flex",
                        "align-items": "center",
                        "justify-content": "center",
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        transition: "font-size 0s",
                        color: "white",
                        filter: "url(#jxmx_textStroke_0)",
                        "font-weight": "bold",
                        "letter-spacing": "1px",
                        "font-size": title.offsetWidth * 0.11 + "px",
                        "text-shadow": "none",
                        "font-family": "jxmx_MainFont",
                        "white-space": "nowrap",
                    }, title);
                    game.jxmx_testStyleChange(text, title, function(div1, div2) {
                        div1.style["font-size"] = div2.offsetWidth * 0.11 + "px";
                    });
                    text.innerHTML = Title;
                    //创建描述
                    var intro = ui.create.div(".jxmx_starCard_intro", frame);
                    //标题文本
                    var text = ui.create.div({
                        display: "flex",
                        "justify-content": "center",
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        left: "0",
                        top: "0",
                        transition: "font-size 0s",
                        color: "white",
                        "font-weight": "bold",
                        "letter-spacing": "2px",
                        "font-size": intro.offsetWidth * 0.075 + "px",
                        "text-shadow": "none",
                        "font-family": "jxmx_MainFont",
                    }, intro);
                    game.jxmx_testStyleChange(text, intro, function(div1, div2) {
                        div1.style["font-size"] = div2.offsetWidth * 0.075 + "px";
                    });
                    text.innerHTML = Intro;
                    //自动移除
                    setTimeout(() => {
                        //播放退场音效
                        game.jxmx_playAudio("ui", "starCard-out");
                        frame.classList.add("opacity");
                        setTimeout(() => {
                            frame.remove();
                            resolve();
                        }, 500);
                    }, Number(get.config("jxmx_gameSpeed", "StarAdventure")));
                });
            });
        },
        //【封装函数】全场角色实时显示手牌上限
        jxmx_showMaxHandCard: function() {
            game.jxmx_showMaxHandCard_interval = setInterval(() => {
                for (var current of game.players.concat(game.dead)) {
                    var num1 = current.countCards("h");
                    var num2 = current.getHandcardLimit();
                    if (num2 == Infinity) num2 = "∞";
                    current.node.count.innerHTML = num1 + "/" + num2;
                }
            }, 100);
        },
        //【封装函数】调整牌堆结构
        jxmx_changeCardList: function() {
            var cardList = lib.cardPile.standard.concat(lib.cardPile.extra).filter(i => !["muniu", "wuxie", "wugu", "baiyin", "jueying"].includes(i[2]));
            const remove = {
                shan: 10,
                tao: 4,
                lebu: 1,
            };
            for (var i in remove) {
                let str = cardList.filter(j => j[2] == i);
                if (str.length) {
                    cardList.removeArray(str.randomGets(remove[i]));
                }
            }
            const add = {
                huogong: {
                    heart: 2,
                    diamond: 2,
                },
            };
            for (var i in add) {
                let str = cardList.filter(j => j[2] == i);
                if (str.length) {
                    for (var j in add[i]) {
                        for (var z = 0; z < add[i][j]; z++) {
                            cardList.push([j, get.rand(1, 13), i]);
                        }
                    }
                }
            }
            lib.ceshi = cardList.slice();
            lib.card.list = cardList;
            return lib.card.list;
        },
        //【封装函数】调整卡牌效果
        jxmx_changeCardEffect: function() {
            const map = {
                card: {
                    nanman: {
                        range: {
                            global: 6,
                        },
                        filterTarget: function(card, player, target) {
                            return target.side !== player.side;
                        },
                    },
                    wanjian: {
                        damageadd: 2,
                        range: {
                            global: 6,
                        },
                        filterTarget: function(card, player, target) {
                            return target.side !== player.side;
                        },
                    },
                    taoyuan: {
                        range: {
                            global: 6,
                        },
                        filterTarget: function(card, player, target) {
                            return target.side === player.side;
                        },
                    },
                    lebu: {
                        range: {
                            global: 3,
                        },
                    },
                    guohe: {
                        range: {
                            global: 5,
                        },
                    },
                    juedou: {
                        damageadd: 1,
                        range: {
                            global: 5,
                        },
                    },
                    huogong: {
                        damageadd: 2,
                        range: {
                            global: 6,
                        },
                    },
                    jiedao: {
                        range: {
                            global: 8,
                        },
                    },
                },
                skill: {
                    jiu: {
                        trigger: {
                            player: ["useCardEnd", "recoverBegin"],
                        },
                        filter(event, player) {
                            if (event.name == "useCard") return event.card.name == "jiu" && player.storage.jiu && typeof player.storage.jiu == "number" && !event.all_excluded;
                            return event.parent.name == "jiu" && (player.isDying() || event.getParent(2).type == "dying");
                        },
                        direct: true,
                        priority: 100,
                        firstDo: true,
                        async content(event, trigger, player) {
                            if (trigger.name == "useCard") player.storage.jiu++;
                            else trigger.num++;
                        },
                    },
                    tengjia: {
                        trigger: {
                            player: "damageBegin2",
                        },
                        filter(event, player) {
                            if (!event.hasNature("fire")) return false;
                            if (player.hasSkillTag("unequip2")) return false;
                            if (event.source && event.source.hasSkillTag("unequip", false, {
                                    name: event.card ? event.card.name : null,
                                    target: player,
                                    card: event.card,
                                })) return false;
                            return player.countCards("e", "tengjia");
                        },
                        direct: true,
                        priority: 100,
                        firstDo: true,
                        async content(event, trigger, player) {
                            trigger.num += 2;
                        },
                    },
                    cardDamage: {
                        trigger: {
                            player: "useCard2",
                        },
                        filter(event, player) {
                            return typeof lib.card[event.card.name].damageadd === "number";
                        },
                        direct: true,
                        priority: 100,
                        firstDo: true,
                        async content(event, trigger, player) {
                            trigger.baseDamage += lib.card[trigger.card.name].damageadd;
                        },
                    },
                },
                translate: {
                    jiu_info: "①每回合限一次。出牌阶段，对你自己使用。本回合目标角色使用的下一张【杀】的伤害值基数+2；②当你处于濒死状态时，对你自己使用。目标角色回复2点体力。",
                    nanman_info: "出牌阶段，对距离6以内的所有敌方角色使用。每名目标角色需打出一张【杀】，否则受到1点伤害。",
                    wanjian_info: "出牌阶段，对距离6以内的所有敌方角色使用。每名目标角色需打出一张【闪】，否则受到3点伤害。",
                    taoyuan_info: "出牌阶段，对距离6以内的所有我方角色使用。每名目标角色回复1点体力。",
                    lebu_info: "出牌阶段，对距离3以内的一名其他角色使用。若判定结果不为红桃，跳过其出牌阶段。",
                    guohe_info: "出牌阶段，对距离5以内且区域里有牌的一名其他角色使用。你弃置其区域里的一张牌。",
                    juedou_info: "出牌阶段，对距离5以内的一名其他角色使用。由其开始，其与你轮流打出一张【杀】，直到其中一方未打出【杀】为止。未打出【杀】的一方受到另一方对其造成的2点伤害。",
                    huogong_info: "出牌阶段，对距离6以内且有手牌的一名角色使用。目标角色展示一张手牌A，然后你可以弃置一张与A花色相同的手牌，对目标造成3点火属性伤害。",
                    jiedao_info: "出牌阶段，对距离8以内的装备区里有武器牌且有使用【杀】的目标的一名其他角色使用。令其对你指定的一名角色使用一张【杀】，否则将其装备区里的武器牌交给你。",
                    tengjia_info: "锁定技。①【南蛮入侵】、【万箭齐发】和普【杀】对你无效。②当你受到火属性伤害时，此伤害+2。",
                },
            };
            for (var i in map.card) {
                for (var j in map.card[i]) {
                    lib.card[i][j] = map.card[i][j];
                }
            }
            for (var i in map.skill) {
                let name = "jxmxskill_" + i;
                lib.skill[name] = map.skill[i];
                game.addGlobalSkill(name);
                game.finishSkill(name);
            }
            Object.assign(lib.translate, map.translate);
        },
    },
    translate: {

    },
    skill: {
        //修改手牌上限基值的规则
        _jxmxskill_changeMaxHandcard: {
            mod: {
                maxHandcardBase: function(player) {
                    var num = 0;
                    const title = lib.characterTitle[player.name];
                    if (title) {
                        if (title.startsWith("精英")) num = 3;
                        else if (title.startsWith("普通")) num = 2;
                        else num = 4;
                    }
                    return num;
                },
            },
        },
        //修改距离系统的规则
        _jxmxskill_changeDistance: {
            mod: {
                globalTo(from, to, distance) {
                    if (to.square && from.square) {
                        //当前位置
                        var x = to.square["data-x"],
                            y = to.square["data-y"];
                        //设一个范围值
                        var speed = 1;
                        while (from) {
                            //正方形范围内的格子列表
                            var list = [];
                            //依次判断
                            for (var i of ui.jxmx_background.squares) {
                                if (Math.abs(i["data-x"] - x) <= speed && Math.abs(i["data-y"] - y) <= speed) list.push(i);
                            }
                            //若范围内存在目标，输出范围值
                            if (list.includes(from.square)) return speed;
                            //否则，扩大范围
                            else speed++;
                        };
                    }
                },
            },
        },
        //角色回合结束后移动
        _jxmxskill_chooseToMove: {
            trigger: {
                player: "phaseAfter",
            },
            filter(event, player) {
                return player.square;
            },
            direct: true,
            firstDo: true,
            priority: 100,
            async content(event, trigger, player) {
                player.square.classList.remove("canMove-friend");
                player.square.classList.remove("canMove-enemy");
                game.jxmx_playAudio("ui", "phaseEnd");
                player.jxmx_move(player.storage.jxmx_initFightData.speed);
                ui.jxmx_background.classList.add("prohibit");
            },
        },
        //每轮游戏开始时信息告示
        _jxmxskill_roundNotice: {
            trigger: {
                player: "roundStart",
            },
            filter(event, player) {
                return player == _status.firstAct;
            },
            direct: true,
            firstDo: true,
            priority: 100,
            async content(event, trigger, player) {
                game.pause();
                const data = game.jxmx_stageData.roundEvent;
                const str = data[game.roundNumber];
                if (str) {
                    await game.jxmx_starCardAnimation(str.name, str.title, str.intro);
                    await str.effect();
                }
                game.jxmx_showNotice("第" + get.cnNumber(game.roundNumber, true) + "轮开始！", true, null, Number(get.config("jxmx_gameSpeed", "StarAdventure")), function() {
                    game.resume();
                });
            },
        },
        //角色回合开始时信息告示
        _jxmxskill_playerPhaseNotice: {
            trigger: {
                player: "phaseBegin",
            },
            filter(event, player) {
                return player.square;
            },
            direct: true,
            firstDo: true,
            priority: 100,
            async content(event, trigger, player) {
                game.pause();
                var square = player.square,
                    direction = player.direction;
                square.classList.add("canMove-" + player.identity);
                square.getLook();
                game.jxmx_playAudio("ui", "phaseBegin");
                game.jxmx_showNotice("<span style=color:" + get.noticeColor(player) + ">" + get.translation(player) + "</span>的回合开始！", true, null, Number(get.config("jxmx_gameSpeed", "StarAdventure")), function() {
                    const container = ui.jxmx_container;
                    container.changeOpacity(0);
                    if (get.config("OpacityUI-Always", "StarAdventure")) container.opacityUI.classList.add("bright");
                    container.opacityUI.classList.remove("opacity");
                    setTimeout(() => {
                        game.resume();
                    }, 500);
                });
            },
        },
        //主视角操控队友&主视角显示与其他角色距离
        _jxmxskill_replaceFriendAction: {
            trigger: {
                global: ["phaseBeginStart", "playercontrol", "chooseToUseBegin", "chooseToRespondBegin", "chooseToDiscardBegin", "chooseToCompareBegin", "chooseButtonBegin", "chooseCardBegin", "chooseTargetBegin", "chooseCardTargetBegin", "chooseControlBegin", "chooseBoolBegin", "choosePlayerCardBegin", "discardPlayerCardBegin", "gainPlayerCardBegin"],
            },
            direct: true,
            priority: 100,
            firstDo: true,
            async content(event, trigger, player) {
                //主视角显示与其他角色距离
                game.me.jxmx_showDistance();
                if (player != trigger.player) return;
                if (_status.auto || player.isUnderControl(true)) return;
                if (player != game.me && player.side == game.me.side) {
                    game.swapPlayerAuto(player);
                }
            },
        },
        //敌人被击败后移除游戏
        _jxmxskill_dieRemove: {
            trigger: {
                global: ["damageAfter", "dieAfter"],
            },
            filter(event, player) {
                if (!game.players.concat(game.dead).includes(event.player)) return false;
                if (event.name == "damage" && game.players.includes(event.player)) return false;
                if (event.name == "die" && event.getParent(2).name == "damage") return false;
                return player == game.filterPlayer()[0] && event.player.identity == "enemy";
            },
            forceDie: true,
            direct: true,
            priority: -Infinity,
            lastDo: true,
            async content(event, trigger, player) {
                const square = trigger.player.square;
                square.removePlayer(trigger.player);
                game.removePlayer(trigger.player);
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
            direct: true,
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
            direct: true,
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
        //攻击力设定
        _jxmxskill_attack: {
            trigger: {
                source: "damageBegin1",
            },
            filter(event, player) {
                return event.card && event.card.name == "sha" && player.storage.jxmx_initFightData && player.storage.jxmx_initFightData.attack;
            },
            direct: true,
            async content(event, trigger, player) {
                const num = player.storage.jxmx_initFightData.attack;
                trigger.num += Math.max(num, 0);
            },
        },
        //防御力设定
        _jxmxskill_defense: {
            trigger: {
                player: "damageBegin2",
            },
            filter(event, player) {
                return event.card && event.card.name == "sha" && player.storage.jxmx_initFightData && player.storage.jxmx_initFightData.defense;
            },
            direct: true,
            async content(event, trigger, player) {
                const num = player.storage.jxmx_initFightData.defense;
                trigger.num -= Math.max(num, 0);
            },
        },
    },
    card: {

    },
    element: {
        content: {
            //触发格子效果
            jxmx_squareEffect: async function(event) {
                const {
                    player,
                    effectName
                } = event;
                game.pause2();
                var text = "<img style=width:29% src=" + "extension/吉星大冒险/image/ui/" + effectName + ".png>&nbsp;" + get.jxmx_translation(effectName)[0];
                game.jxmx_playAudio("ui", "squareEffect");
                game.jxmx_showNotice(text, true, null, Number(get.config("jxmx_gameSpeed", "StarAdventure")));
                game.jxmx_showNotice("※" + get.jxmx_translation(effectName)[1], false, -0.012, Number(get.config("jxmx_gameSpeed", "StarAdventure")), function() {
                    game.resume2();
                    switch (effectName) {
                        case "start":
                            player.gainMaxHp();
                            break;
                        case "event":
                            player.jxmx_triggerEvent();
                            break;
                        case "upgrade":
                            player.jxmx_bugChip();
                            break;
                        case "shop":
                            player.jxmx_bugCard();
                            break;
                        case "speed":
                            player.jxmx_move(3);
                            break;
                        case "recover":
                            player.recover();
                            break;
                        case "damage":
                            player.damage("thunder", "nosource", "nocard");
                            break;
                        case "card":
                            player.draw();
                            break;
                        case "transport":
                            return ["传送门", "随机传送到其他传送门"];
                        case "attack":
                            return ["敌役突击门", "随机传送到敌役所在格"];
                        case "enemy":
                            return ["敌役", "随机格子刷新一个普通敌役"];
                        case "gold":
                            return ["天降横财", "获得5枚星币"];
                    }
                });
            },
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
            //移动格子
            jxmx_move: function(speed, numList, callback) {
                //特殊情况下
                var special = this.identity == "enemy";
                //检测情况
                if (typeof speed !== "number") return;
                //暂停游戏
                game.pause();
                //定位容器
                var container = ui.jxmx_container;
                //定位背景
                var background = ui.jxmx_background;
                //添加背景限制
                background.classList.add("prohibit");
                //隐藏透明度ui
                //container.opacityUI.classList.add("opacity");
                //解除容器隐藏
                container.changeOpacity(100);
                //信息告示
                let str = "<span style=color:" + get.noticeColor(this) + ">" + get.translation(this) + "</span>的移动开始";
                if (Array.isArray(numList)) str += "(" + numList[0] + "/" + numList[1] + ")";
                str += "！";
                var notice = game.jxmx_showNotice(str, this.side == game.me.side, null, "forever", function() {
                    setTimeout(() => {
                        notice.classList.remove("center");
                        background.classList.remove("prohibit");
                    }, Number(get.config("jxmx_gameSpeed", "StarAdventure")));
                });
                //原地踏步的结算
                if (speed <= 0) {
                    setTimeout(() => {
                        //触发格子效果，仅我方角色
                        if (this.square.effect && this.side == true) this.jxmx_squareEffect(this.square.effect);
                        //移除顶部的信息告示
                        notice.classList.remove("show");
                        setTimeout(() => {
                            notice.remove();
                        }, 500);
                        setTimeout(() => {
                            if (typeof callback === "function") callback();
                            else game.resume();
                        }, (250 * (Number(get.config("jxmx_gameSpeed", "StarAdventure")) / 500 + 1)));
                    }, Number(get.config("jxmx_gameSpeed", "StarAdventure")));
                    return;
                }
                //所有格子列表
                var squares = background.squares;
                //当前格子
                var square = this.square;
                //当前朝向
                var direction = this.direction;
                //镜头定位
                square.getLook();
                //当前位置
                var x = square["data-x"],
                    y = square["data-y"];
                //【方向筛选函数】
                var getMovableGridList = function(config) {
                    const list = [];
                    //先圈正方形范围
                    for (const i of squares) {
                        //不能移动到已经有角色的格子上
                        if (i.player) {
                            if (i !== square) {
                                if (!special) i.classList.add("cannotMove");
                                else i.classList.add("opacity");
                            }
                            continue;
                        }
                        const ix = i["data-x"];
                        const iy = i["data-y"];
                        const inSquare = (Math.abs(ix - x) <= speed && Math.abs(iy - y) <= speed);
                        if (inSquare) {
                            list.push(i);
                        } else if (!i.disabled) {
                            if (!special) i.classList.add("cannotMove");
                            else i.classList.add("opacity");
                        }
                    }
                    //根据方向开关筛选
                    const list2 = list.filter(i => {
                        if (i.disabled) return false;
                        const ix = i["data-x"];
                        const iy = i["data-y"];
                        const dx = ix - x;
                        const dy = iy - y;
                        const absDx = Math.abs(dx);
                        const absDy = Math.abs(dy);
                        //十字方向
                        const isUp = config.up && dx === 0 && dy < 0 && absDy <= speed;
                        if (isUp) i.atZhuSquare = "top";
                        const isDown = config.down && dx === 0 && dy > 0 && absDy <= speed;
                        if (isDown) i.atZhuSquare = "bottom";
                        const isLeft = config.left && dy === 0 && dx < 0 && absDx <= speed;
                        if (isLeft) i.atZhuSquare = "left";
                        const isRight = config.right && dy === 0 && dx > 0 && absDx <= speed;
                        if (isRight) i.atZhuSquare = "right";
                        //斜方向
                        const isLeftUp = config.leftUp && dx < 0 && dy < 0 && absDx === absDy && absDx <= config.slantMaxStep;
                        if (isLeftUp) i.atZhuSquare = "top";
                        const isRightUp = config.rightUp && dx > 0 && dy < 0 && absDx === absDy && absDx <= config.slantMaxStep;
                        if (isRightUp) i.atZhuSquare = "top";
                        const isLeftDown = config.leftDown && dx < 0 && dy > 0 && absDx === absDy && absDx <= config.slantMaxStep;
                        if (isLeftDown) i.atZhuSquare = "bottom";
                        const isRightDown = config.rightDown && dx > 0 && dy > 0 && absDx === absDy && absDx <= config.slantMaxStep;
                        if (isRightDown) i.atZhuSquare = "bottom";
                        return isUp || isDown || isLeft || isRight || isLeftUp || isRightUp || isLeftDown || isRightDown;
                    });
                    return {
                        list,
                        list2
                    };
                };
                //【方向开关配置】
                var config = {
                    up: false, //上
                    down: false, //下
                    left: false, //左
                    right: false, //右
                    leftUp: false, //左上
                    rightUp: false, //右上
                    leftDown: false, //左下
                    rightDown: false, //右下
                    slantMaxStep: speed //斜向最大可移动格数
                };
                //根据角色的direction来调整配置
                var changeList = [];
                switch (direction) {
                    case "top":
                        changeList.addArray(["up", "leftUp", "rightUp"]);
                        break;
                    case "bottom":
                        changeList.addArray(["down", "leftDown", "rightDown"]);
                        break;
                    case "left":
                        changeList.addArray(["left", "leftUp", "leftDown"]);
                        break;
                    case "right":
                        changeList.addArray(["right", "rightUp", "rightDown"]);
                        break;
                };
                for (var i of changeList) {
                    if (config[i] === false) config[i] = true;
                }
                //封装函数，先进行实验
                var experiment = function() {
                    //获取一次实验结果
                    var {
                        list,
                        list2
                    } = getMovableGridList(config);
                    //若没有结果
                    if (!list2.length) {
                        //上下方向的先尝试向左右拓展
                        if (config.up || config.down) {
                            config.left = true;
                            config.right = true;
                        }
                        //左右方向的先尝试向上下拓展
                        else if (config.left || config.right) {
                            config.up = true;
                            config.down = true;
                        }
                    }
                };
                experiment();
                //获得正方形范围内和多方向筛选后的两个列表
                const {
                    list,
                    list2
                } = getMovableGridList(config);
                //若没有合法格子可移动
                if (!list2.length) {
                    setTimeout(() => {
                        game.jxmx_playAudio("ui", "starCard-out");
                        game.jxmx_showNotice("没有合法格子可供移动！", true, null, Number(get.config("jxmx_gameSpeed", "StarAdventure")), function() {
                            notice.classList.remove("show");
                            setTimeout(() => {
                                notice.remove();
                            }, 500);
                            if (typeof callback === "function") callback();
                            else game.resume();
                        });
                    }, (Number(get.config("jxmx_gameSpeed", "StarAdventure")) + 500));
                    return;
                }
                //定义特殊情况，用于一格内自动移动
                //if (list2.length == 1 && !list2[0].player) special = true;
                //依次处理
                for (var i of list) {
                    if (i.disabled) continue;
                    if (!list2.includes(i)) {
                        if (!special) i.classList.add("cannotMove");
                        else i.classList.add("opacity");
                    } else {
                        i.classList.add("canMove-" + this.identity);
                        var player = this;
                        i.onclick = function(event) {
                            if (special && event.isTrusted) return;
                            var target = this.player;
                            //移动逻辑
                            this.movePlayer(player);
                            player.direction = this.atZhuSquare;
                            this.style.border = "";
                            this.style["border-" + player.direction] = "4px solid #FFD700";
                            this.getLook();
                            //触发格子效果，仅我方角色
                            if (this.effect && player.side == true) player.jxmx_squareEffect(this.effect);
                            game.me.jxmx_showDistance();
                            notice.classList.remove("show");
                            setTimeout(() => {
                                notice.remove();
                            }, 500);
                            for (var square of ui.jxmx_background.squares) {
                                square.onclick = null;
                                delete square.atZhuSquare;
                                square.classList.remove("canMove-friend");
                                square.classList.remove("canMove-enemy");
                                square.classList.remove("cannotMove");
                                square.classList.remove("opacity");
                            }
                            setTimeout(() => {
                                if (typeof callback === "function") callback();
                                else game.resume();
                            }, (250 * (Number(get.config("jxmx_gameSpeed", "StarAdventure")) / 500 + 1)));
                        };
                    }
                }
                //ai随机移动到一个格子
                if (special) {
                    var square = list2.randomGet();
                    setTimeout(() => {
                        square.click();
                    }, (this.identity != "enemy" ? Number(get.config("jxmx_gameSpeed", "StarAdventure")) : (Number(get.config("jxmx_gameSpeed", "StarAdventure")) + 1000)));
                }
            },
            //显示与其他角色的距离
            jxmx_showDistance: function() {
                for (var current of game.players) {
                    current.setNickname("");
                }
                var players = game.players.filter(i => i != this);
                for (var current of players) {
                    current.setNickname("距离：" + get.distance(this, current));
                }
            },
            //触发格子效果
            jxmx_squareEffect: function(name) {
                if (name && name === "none") return;
                var next = game.createEvent("jxmx_squareEffect", false);
                next.player = this;
                next.effectName = name;
                next.setContent("jxmx_squareEffect");
                return next;
            },
            //随机触发事件
            jxmx_triggerEvent: async function() {

            },
            //购买战斗筹码
            jxmx_bugChip: async function() {

            },
            //购买卡牌
            jxmx_bugCard: async function() {

            },
            //初始化战斗属性
            jxmx_initFightData: function() {
                const data = this.storage.jxmx_initFightData || lib.jxmx_CharFightData[this.name];
                if (!data) return;
                this.storage.jxmx_initFightData = {};
                for (var i in data) {
                    this.storage.jxmx_initFightData[i] = data[i];
                }
                if (!data.gold) data.gold = 0;
                this.addTip("jxmx_initFightData", `🗡️${data.attack} 🛡️${data.defense}<br>🛼${data.speed} 🪙${data.gold}`);
            },
            //移除战斗属性
            jxmx_clearFightData: function() {
                this.removeTip("jxmx_initFightData");
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
        noticeColor: function(player) {
            switch (player.identity) {
                case "friend":
                    return "#4385f4";
                case "enemy":
                    return "#f44343";
            }
        },
        jxmx_translation: function(name) {
            switch (name) {
                case "start":
                    return ["起始点", "加1点体力上限"];
                case "event":
                    return ["事件", "随机触发1个事件"];
                case "upgrade":
                    return ["筹码商店", "可购买1枚战斗筹码"];
                case "shop":
                    return ["商店", "可购买任意张卡牌"];
                case "speed":
                    return ["疾行", "额外可移动3格"];
                case "recover":
                    return ["恢复", "回复1点体力"];
                case "damage":
                    return ["天降横祸", "受到1点雷电伤害"];
                case "card":
                    return ["卡牌", "摸1张牌"];
                case "transport":
                    return ["传送门", "随机传送到其他传送门"];
                case "attack":
                    return ["敌役突击门", "随机传送到敌役所在格"];
                case "enemy":
                    return ["敌役", "随机格子刷新一个普通敌役"];
                case "gold":
                    return ["天降横财", "获得5枚星币"];
            }
            return false;
        },
    },
    help: {

    }
};
var config = {
    "OpacityUI-Always": {
        name: "透明度ui常亮",
        init: lib.config["OpacityUI-Always"] !== undefined ? lib.config["OpacityUI-Always"] : false,
        onclick(bool) {
            game.saveConfig("OpacityUI-Always", bool);
            game.saveConfig("OpacityUI-Always", bool, "StarAdventure");
            var opacityUI = ui.jxmx_container && ui.jxmx_container.opacityUI;
            if (opacityUI) {
                if (bool) opacityUI.classList.add("bright");
                else opacityUI.classList.remove("bright");
            }
        },
    },
    "jxmx_gameSpeed": {
        name: "游戏速度",
        item: {
            500: "极快",
            1000: "快",
            1500: "中",
            2000: "慢",
        },
        init: lib.config.jxmx_gameSpeed !== undefined ? lib.config.jxmx_gameSpeed : 1500,
        onclick(item) {
            game.saveConfig("jxmx_gameSpeed", item);
            game.saveConfig("jxmx_gameSpeed", item, "StarAdventure");

        },
    },
    "jxmx_noTip": {
        name: "角色牌上不显示属性",
        init: lib.config.jxmx_noTip !== undefined ? lib.config.jxmx_noTip : false,
        onclick(bool) {
            game.saveConfig("jxmx_noTip", bool);
            game.saveConfig("jxmx_noTip", bool, "StarAdventure");
            for (var current of game.players) {
                if (!bool) current.jxmx_initFightData();
                else current.jxmx_clearFightData();
            }
        },
    },
    "jxmx_showMaxHandCard": {
        name: "实时显示手牌上限",
        init: lib.config.jxmx_showMaxHandCard !== undefined ? lib.config.jxmx_showMaxHandCard : true,
        onclick(bool) {
            game.saveConfig("jxmx_showMaxHandCard", bool);
            game.saveConfig("jxmx_showMaxHandCard", bool, "StarAdventure");
            const interval = game.jxmx_showMaxHandCard_interval;
            if (!bool) {
                if (interval) {
                    clearInterval(interval);
                    delete game.jxmx_showMaxHandCard_interval;
                    for (var current of game.players.concat(game.dead)) {
                        let num = current.countCards("h");
                        current.node.count.innerHTML = num;
                    }
                }
            } else {
                if (!interval) game.jxmx_showMaxHandCard();
            }
        },
    },
}
game.addMode("StarAdventure", main, {
    extension: "吉星大冒险",
    translate: "吉星大冒险",
    config: config,
});