const Vec3 = require('tera-vec3');
const Baharr = {
		103: {msg: '前砸 (闪避)'},
		111: {msg: '后砸 (慢慢慢慢)'},
		139: {msg: '转圈 (击倒)'},
		125: {msg: '右 前砸(闪) | 后拉'},
		131: {msg: '左 范围(挡) | 后拉'},
		308: {msg: '第1次晕'},
		309: {msg: '第2次晕'},
		310: {msg: '第3次晕'},
// 圆圈类
		114: {msg: '捶地 (秒杀)'},
		116: {msg: '甜甜圈'},
		112: {msg: '完美格挡'},
		135: {msg: '完美格挡'},
// 直线类
		101: {msg: '锤地->270->重击'},
		121: {msg: '左  (4连半月)'},
		122: {msg: '左  第3下加速'},
		123: {msg: '左  第2下加速'},
		140: {msg: '右  (4连半月)'},
		141: {msg: '右  第3下加速'},
		142: {msg: '右  第2下加速'},
		311: {msg: '补师开盾'},
		312: {msg: '补师开盾'},
		119: {msg: '→ BOSS 右侧安全 →'},
		120: {msg: '← BOSS 左侧安全 ←'}
	}
	
module.exports = function BahaarGuide(mod) {
	let Enabled            =  true, // 总开关
		itemID1            =   413, // 采集物: 413调味草
		itemID2            =   553,
	// 定义变量
		hooks              = [],
		boss_HP            = 0,     // BOSS 血量%
		boss_GameID        = null,  // BOSS gameId
		boss_CurLocation   = {},    // BOSS 坐标
		boss_CurAngle      = 0,     // BOSS 角度
		skillid            = 0,
		uid1      = 999999999n,     // 告示牌UID
		uid3      = 799999999n,     // 花朵UID
		curLocation        = {},    // 地面提示 坐标 x y z
		curAngle           = 0,     // 地面提示 角度
		shining            = false;
	// 控制命令
	mod.command.add(["巴哈", "Bahaar"], (arg) => {
		Enabled = !Enabled;
		mod.command.message("Bahaar-Guide " + (Enabled ? "启用(ON)" : "禁用(OFF)"));
	});
	// 切换场景
	mod.game.me.on('change_zone', (zone, quick) => {
		if (zone == 9044) {
			load();
			mod.command.message("进入副本 巴哈勒神殿");
		} else {
			unload();
			reset();
		}
	})
	
	function load() {
		if (!hooks.length) {
			hook('S_BOSS_GAGE_INFO',    3, sBossGageInfo);
			hook('S_ABNORMALITY_BEGIN', 3, sAbnormalityBegin);
			hook('S_ACTION_STAGE',      9, sActionStage);
		}
	}
	
	function hook() {
		hooks.push(mod.hook(...arguments));
	}
	
	function unload() {
		if (hooks.length) {
			for (let h of hooks)
				mod.unhook(h);
			hooks = [];
		}
	}
	
	function reset() {
		// 清除所有定时器
		mod.clearAllTimeouts();
		boss_GameID = null;
		shining = false;
	}
	
	function sBossGageInfo(event) {
		boss_HP = (Number(event.curHp) / Number(event.maxHp));
		if (!boss_GameID) boss_GameID = event.id;
		if (boss_HP <= 0 || boss_HP == 1) reset();
	}
	
	function sAbnormalityBegin(event) {
		if (event.target != boss_GameID) return;
		
		if (event.id == 90442304) sendMessage("以 [暈眩技能] 阻止 震怒的暴風 施展", 25);
		if (event.id == 90442000) shining = true;
		if (event.id == 90442001) shining = false;
		/* 发光后砸 技能判定机制 不稳定(不准确) */
		if (event.id == 90444001 && skillid == 104) {
			mod.setTimeout(() => {
				if (shining) sendMessage("发光后砸", 25);
			}, 500);
		}
		if (event.id == 90442000 && skillid == 134) {
			mod.setTimeout(() => {
				if (shining) sendMessage("发光后砸", 25);
			}, 300);
		}
		if (event.id == 90444001 && skillid == 118) {
			mod.setTimeout(() => {
				if (shining) sendMessage("发光后砸", 25);
			}, 300);
		}
	}
	
	function sActionStage(event) {
		if (!Enabled || event.stage!==0) return;
		// 巴哈勒 - 红眼射线
		if (event.templateId == 2500 && event.skill.id == 1305) {
			curLocation = event.loc;
			curAngle = event.w;
			SpawnString(itemID2, 180, 3000, 4000);
			sendMessage(`<font color="#FF0000"> --- 红眼射线 (秒杀) --- </font>`, 25);
			return;
		}
		
		if (event.gameId != boss_GameID) return;
		
		skillid = event.skill.id % 1000; // 攻击技能编号简化 取1000余数运算
		boss_CurLocation = event.loc;    // BOSS的 x y z 坐标
		boss_CurAngle    = event.w;      // BOSS的角度
		curLocation  = boss_CurLocation; // 传递BOSS坐标参数
		curAngle     = boss_CurAngle;    // 传递BOSS角度参数
		
		if (!Baharr[skillid]) return;
		sendMessage(Baharr[skillid].msg);
		
		switch (skillid) {
			case 114: // 点名后捶地
				SpawnThing(   false,  100, 184, 260);
				SpawnCircle(itemID1, 4000,  10, 320);
				break;
			case 116: // 点名后甜甜圈
				SpawnCircle(itemID1, 6000, 8, 290);
				break;
			case 112: // 完美格挡
			case 135:
				SpawnThing(   false,  100, 184, 220);
				SpawnCircle(itemID1, 4000,  20, 210);
				break;
			case 101: // 锤地(三连击)
				SpawnString(itemID1, 4000, 345, 500); // 对称轴 尾部
				SpawnString(itemID1, 3000, 270, 500); // 对称轴 左侧
				break;
			case 121: // 四连半月
			case 122:
			case 123:
			case 140:
			case 141:
			case 142:
				SpawnThing(   false,  100,  90,  50);
				SpawnString(itemID1, 6000,   0, 400);
				SpawnString(itemID1, 6000, 180, 400);
				
				SpawnThing(   false,  100, 270,  50);
				SpawnString(itemID1, 6000,   0, 400);
				SpawnString(itemID1, 6000, 180, 400);
				
				mod.setTimeout(() => {
					sendMessage("四连半月(就绪)", 25);
				}, 60000);
				break;
			case 311: // 右手放锤
			case 312: // 左手放锤
				SpawnString(itemID1, 6000, 180, 500); // 对称轴 头部
				SpawnString(itemID1, 6000,   0, 500); // 对称轴 尾部
				break;
			case 119: // 二阶 左/右手放锤 左/右半屏击飞
				SpawnThing(true, 5000, 270, 250);
				break;
			case 120:
				SpawnThing(true, 5000,  90, 250);
				break;
			default:
				break;
		}
	}
	// 发送提示文字
	function sendMessage(msg, chl) {
		mod.send('S_CHAT', 3 , {
			channel: chl ? chl : 21, // 21 = 队长通知, 1 = 组队, 2 = 公会, 25 = 团长通知
			name: 'DG-Guide',
			message: msg,
		})
	}
	// 地面提示(光柱+告示牌)
	function SpawnThing(show, times, degrees, radius) {          // 是否显示 持续时间 偏移角度 半径距离
		var r = null, rads = null, finalrad = null, spawnx = null, spawny = null;
		
		r = boss_CurAngle - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		spawnx = boss_CurLocation.x + radius * Math.cos(finalrad);
		spawny = boss_CurLocation.y + radius * Math.sin(finalrad);
		
		curLocation = new Vec3(spawnx, spawny, curLocation.z);
		curAngle = boss_CurAngle;
		
		if (!show) return;
		// 告示牌
		mod.send('S_SPAWN_BUILD_OBJECT', 2, {
			gameId : uid1,
			itemId : 1,
			loc : curLocation,
			w : boss_CurAngle,
			ownerName : "TIP",
			message : "TIP"
		});
		// 延迟消除
		setTimeout(DespawnThing, times, uid1);
		uid1--;
	}
	// 消除 光柱+告示牌
	function DespawnThing(uid_arg1) {
		mod.send('S_DESPAWN_BUILD_OBJECT', 2, {
			gameId : uid_arg1
		});
	}
	// 地面提示(花朵)
	function SpawnItem(item, times, degrees, radius) {           // 显示物品 持续时间 偏移角度 半径距离
		var r = null, rads = null, finalrad = null, spawnx = null, spawny = null;
		
		r = curAngle - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		spawnx = curLocation.x + radius *Math.cos(finalrad);
		spawny = curLocation.y + radius *Math.sin(finalrad);
		// 花朵
		mod.send('S_SPAWN_COLLECTION', 4, {
			gameId : uid3,
			id : item,
			amount : 1,
			loc : new Vec3(spawnx, spawny, curLocation.z),
			w : r
		});
		// 延时消除
		setTimeout(Despawn, times, uid3);
		uid3--;
	}
	// 消除 花朵
	function Despawn(uid_arg3) {
		mod.send('S_DESPAWN_COLLECTION', 2, {
			gameId : uid_arg3
		});
	}
	// 构造 直线花朵
	function SpawnString(item, times, degrees, maxRadius) {      // 显示物品 持续时间 偏移角度 最远距离
		for (var radius=50; radius<=maxRadius; radius+=50) {     // 默认间隔 50
			SpawnItem(item, times, degrees, radius);
		}
	}
	// 构造 圆形花圈
	function SpawnCircle(item, times, intervalDegrees, radius) { // 显示物品 持续时间 偏移间隔 半径距离
		for (var degrees=0; degrees<360; degrees+=intervalDegrees) {
			SpawnItem(item, times, degrees, radius);
		}
	}
}
