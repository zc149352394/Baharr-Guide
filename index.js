String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` };
const Vec3 = require('tera-vec3');
const config = require('./config.json');

const mapID = 9044;
const BossID = 1000;
const BossActions = {
//第一阶段//////////////////////////////////////////
	103: {msg: '前砸(闪避)'},

	117: {msg: '跳劈(击倒)117'},
	118: {msg: '跳劈(击倒)118'},

	108: {msg: '丢锤(晕眩)'},

	111: {msg0: '后砸(慢)'},
//	137: {msg: '后砸'},

	131: {msg: '前砸 -> 后推'},
	139: {msg: '转圈(全屏击倒)'},

	121: {msg: '左脚(4连火焰)'},
	140: {msg: '右脚(4连火焰)'},

//	113: {msg: '点名小心'},
	114: {msg: '捶地'},
	115: {msg: '蓄力一击(击倒)115'},
	138: {msg: '蓄力一击(击倒)138'},

	116: {msg: '甜甜圈'}
};

module.exports = function BaharrGuide(d) {
	let	enabled = config.enabled,
		sendToParty = config.sendToParty,
		streamenabled = config.streamenabled,

		isTank = false,
		insidemap = false,
		whichboss = 0,

		hooks = [],

		curLocation = null,
		curAngle = null,

		boss_CurLocation,
		boss_CurAngle,

		uid0 = 999999999,
		uid1 = 899999999,
		uid2 = 799999999,

		skillid = null,
		shining = false;

	d.command.add('baha', (arg) => {
		if (!arg) {
			enabled = !enabled;
			d.command.message('辅助提示 ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
		} else {
			switch (arg) {
				case "p":
				case "party":
					sendToParty = !sendToParty;
					d.command.message('发送通知 ' + (sendToParty ? '组队'.clr('56B4E9') : '自己'.clr('E69F00')));
					break;
				case "proxy":
					streamenabled = !streamenabled;
					d.command.message('代理频道 ' + (streamenabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "debug":
					d.command.message('模块开关: ' + `${enabled}`.clr('00FFFF'));
					d.command.message('副本地图: ' + insidemap);
					d.command.message('副本首领: ' + whichboss);
					d.command.message('发送通知 ' + (sendToParty ? '真实组队'.clr('56B4E9') : '仅自己见'.clr('E69F00')));
					d.command.message('职业分类 ' + (isTank ? '坦克'.clr('00FFFF') : '打手'.clr('FF0000')));
					sendMessage('test');
					break;
				default :
					d.command.message('无效的参数!'.clr('FF0000'));
					break;
			}
		}
	});

	d.hook('S_LOGIN', 10, sLogin)
	d.hook('S_LOAD_TOPO', 3, sLoadTopo);

	function sLogin(event) {
		let job = (event.templateId - 10101) % 100;
		if (job === 1 || job === 10) {
			isTank = true;
		} else {
			isTank = false;
		}
	}

	function sLoadTopo(event) {
		if (event.zone === mapID) {
			insidemap = true;
			d.command.message('进入副本: ' + '火神殿 '.clr('56B4E9'));
			load();
		} else {
			unload();
		}
    }

	function load() {
		if (!hooks.length) {
			hook('S_BOSS_GAGE_INFO', 3, sBossGageInfo);
			hook('S_ACTION_STAGE', 8, sActionStage);
			hook('S_ABNORMALITY_BEGIN', 3, sAbnormalityBegin);

			function sBossGageInfo(event) {
				if (!enabled) return;
				if (!insidemap) return;

				if (event.templateId === BossID)
					whichboss = 1;
				else
					whichboss = 0;
			}

			function sActionStage(event) {
				if (!enabled) return;
				if (!insidemap || whichboss===0) return;
				if (event.templateId!==BossID) return;

				skillid = event.skill.id % 1000;
				
				boss_CurLocation = event.loc;
				boss_CurAngle = event.w;
				
				curLocation = boss_CurLocation;
				curAngle = boss_CurAngle;

				if (event.stage==1 && skillid==104) {
					setTimeout(function() { 
						if (shining) sendMessage('发光后砸104');
					}, 1000)
				}
				if (event.stage==1 && skillid==118) {
					setTimeout(function() { 
						if (shining) sendMessage('发光后砸118');
					}, 2000)
				}
				if (event.stage==0 && skillid==134) {
					setTimeout(function() { 
						if (shining) sendMessage('发光后砸134');
					}, 1000)
				}

				if (event.stage==0 && BossActions[skillid]) {
					switch (skillid) {
						case 103:	// 前砸
							SpawnThing(184, 400, 100);
							Spawnitem2(581, 6, 350, 3000);
							break;
						case 131:	// 左前砸+后拉
							SpawnThing(182, 340, 100);
							Spawnitem2(581, 4, 660, 4000);
							break;
						case 114:	// 捶地
							SpawnThing(184, 260, 100);
							Spawnitem2(581, 10, 320, 4000);
							break;
						case 116:	// 点名后甜甜圈
							Spawnitem2(581, 8, 290, 6000);
							break;

						case 121:	// 左脚→(4连火焰)
						case 140:	// 右脚←(4连火焰)
							SpawnThing(90, 50, 100);
							Spawnitem1(581, 180, 500, 6000);
							Spawnitem1(581, 0, 500, 6000);

							SpawnThing(270, 100, 100);
							Spawnitem1(581, 180, 500, 6000);
							Spawnitem1(581, 0, 500, 6000);
							break;

						default :

							break;
					}
					sendMessage(BossActions[skillid].msg);
				}
			}

			function sAbnormalityBegin(event) {
				if (!enabled) return;
				if (event.id==90442000) shining = true;
				if (event.id==90442001) shining = false;
			}
		}
	}

	function hook() {
		hooks.push(d.hook(...arguments));
	}

	function unload() {
		if (hooks.length) {
			for (let h of hooks)
				d.unhook(h);
			hooks = [];
		}
		reset();
	}

	function reset() {
		insidemap = false,
		whichboss = 0;
	}

	function sendMessage(msg) {
		if (sendToParty) {
			d.toServer('C_CHAT', 1, {
				channel: 21,
				message: msg
			});
		} else if (streamenabled) {
			d.command.message(msg);
		} else {
			d.toClient('S_CHAT', 2, {
				channel: 21,
				authorName: '提示',
				message: msg
			});
		}
	}

	function SpawnThing(degrees, radius, times) {
		let r = null, rads = null, finalrad = null;

		r = curAngle - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		curLocation.x = boss_CurLocation.x + radius * Math.cos(finalrad);
		curLocation.y = boss_CurLocation.y + radius * Math.sin(finalrad);

		d.toClient('S_SPAWN_BUILD_OBJECT', 2, {
			gameId : uid1,
			itemId : 1,
			loc : curLocation,
			w : r,
			unk : 0,
			ownerName : '提示',
			message : '安全线'
		});

		curLocation.z = curLocation.z - 1000;
		d.toClient('S_SPAWN_DROPITEM', 6, {
			gameId: uid2,
			item: 98260,
			loc: curLocation,
			amount: 1,
			expiry: 600000,
			owners: [{
				id: 0
			}]
		});
		curLocation.z = curLocation.z + 1000;

		setTimeout(DespawnThing, times, uid1, uid2);
		uid1--;
		uid2--;
	}

	function DespawnThing(uid_arg1, uid_arg2) {
		d.toClient('S_DESPAWN_BUILD_OBJECT', 2, {
			gameId : uid_arg1,
			unk : 0
		});
		d.toClient('S_DESPAWN_DROPITEM', 4, {
			gameId: uid_arg2
		});
	}

	function Spawnitem(item, degrees, radius, times) {
		let r = null, rads = null, finalrad = null, spawnx = null, spawny = null, pos = null;

		r = curAngle - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		spawnx = curLocation.x + radius * Math.cos(finalrad);
		spawny = curLocation.y + radius * Math.sin(finalrad);
		pos = {x:spawnx, y:spawny};

		d.toClient('S_SPAWN_COLLECTION', 4, {
			gameId : uid0,
			id : item,
			amount : 1,
			loc : new Vec3(pos.x, pos.y, curLocation.z),
			w : r,
			unk1 : 0,
			unk2 : 0
		});

		setTimeout(Despawn, times, uid0);
		uid0--;
	}

	function Despawn(uid_arg0) {
		d.toClient('S_DESPAWN_COLLECTION', 2, {
			gameId : uid_arg0
		});
	}

	function Spawnitem1(item, degrees, maxRadius, times) {
		for (var radius=25; radius<=maxRadius; radius+=25) {
			Spawnitem(item, degrees, radius, times);
		}
	}

	function Spawnitem2(item, intervalDegrees, radius, times) {
		for (var degrees=0; degrees<360; degrees+=intervalDegrees) {
			Spawnitem(item, degrees, radius, times);
		}
	}

}
