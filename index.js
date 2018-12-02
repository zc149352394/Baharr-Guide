String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` };
const Vec3 = require('tera-vec3');
const config = require('./config.json');
const {BossActionsTips} = require('./skills');
const TemplateID = [1000, 2000];
const MapID = 9044;
const ZoneID = 444;
const BossName = ['封印之门', '一阶', '二阶'];

module.exports = function Baharr(mod) {
	var	enabled = config.enabled,
		sendToAlert = config.sendToAlert,
		sendToNotice = config.sendToNotice,
		
		isTank = false,
		insidemap = false,
		whichboss = 0,
		
		skillid = null,
		
		bossIdLow = null,
		bossEnraged = false,
		alertMsg = null;
		
	mod.command.add('baha', (arg) => {
		if (!arg) {
			enabled = !enabled;
			sendMessage('辅助提示 ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
		} else {
			switch (arg) {
				case "a":
				case "alert":
					sendToAlert = !sendToAlert;
					sendMessage('警告通知 ' + (sendToAlert ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "n":
				case "notice":
					sendToNotice = !sendToNotice;
					sendMessage('队长通知 ' + (sendToNotice ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "debug":
					sendMessage('模块开关: ' + `${enabled}`.clr('00FFFF'));
					sendMessage('副本地图: ' + insidemap);
					sendMessage('副本首领: ' + whichboss);
					sendMessage('警告通知 ' + (sendToAlert ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					sendMessage('队长通知 ' + (sendToNotice ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					sendMessage('职业分类 ' + (isTank ? '坦克'.clr('00FFFF') : '打手'.clr('FF0000')));
					alertMessage('alertMessageTEST');
					noticeMessage('noticeMessageTEST');
					break;
				default :
					sendMessage('无效的参数!'.clr('FF0000'));
					break;
			}
		}
	});
	
	mod.hook('S_LOGIN', 10, sLogin)
	mod.hook('S_LOAD_TOPO', 3, sLoadTopo);
	mod.hook('S_ACTION_STAGE', 8, sActionStage);
	mod.hook('S_BOSS_GAGE_INFO', 3, sBossGageInfo);
	mod.hook('S_NPC_STATUS', 1, sNpcStatus);
	
	function sLogin(event) {
		let job = (event.templateId - 10101) % 100;
		if (job === 1 || job === 10) {					// 0-双刀, 1-枪骑, 2-大剑, 3-斧头, 4-魔道
			isTank = true;								// 5-弓箭, 6-祭司, 7-元素, 8-飞镰, 9-魔工
		} else {										// 10-拳师, 11-忍者 12 月光
			isTank = false;
		}
	}
	
	function sLoadTopo(event) {
		if (event.zone === MapID) {
			insidemap = true;
			sendMessage('进入副本: ' + '火神殿 '.clr('56B4E9') + `${BossName[whichboss]}`.clr('FF0000'));
		} else {
			insidemap = false;
			resetDungeon();
		}
    }
	
	function sActionStage(event) {
		if (!enabled || !insidemap || !(TemplateID.includes(event.templateId)) || event.stage>0) return;
		
		skillid = event.skill.id % 1000;
		
		if (BossActionsTips[skillid]) { noticeMessage(BossActionsTips[skillid].msg) }
		
		switch (skillid) {
			case 121:	// 左脚→(4连火焰)
			case 122:
			case 123:
			case 140:	// 右脚←(4连火焰)
			case 141:
			case 142:
				alertMsg = setTimeout(() => { alertMessage('||| 四连半月 已就绪 |||') }, 60000);
				break;
				
			default :
				break;
		}
	}
	
	function sBossGageInfo(event) {
		if (!enabled || !insidemap) return;
		
		bossIdLow = event.id.low;
		
		let bosshp = (event.curHp / event.maxHp);
		
		if (bosshp <= 0) {
			whichboss = 0;
		}
		
		if (bosshp === 1) {
			resetDungeon();
		}
		
		if (event.templateId === TemplateID[0])
			whichboss = 1;
		else if (event.templateId === TemplateID[1])
			whichboss = 2;
		else
			whichboss = 0;
	}
	
	function sNpcStatus(event) {
		if (event.creature.low !== bossIdLow) return;
		if (event.enraged === 1) bossEnraged = true;
		if (event.enraged === 0) bossEnraged = false;
	}
	
	function resetDungeon() {
		whichboss = 0;
		bossEnraged = false,
		clearTimeout(alertMsg);
	}
	
	function alertMessage(msg) {
		if (sendToAlert) {
			mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
				type: (bossEnraged ? 44 : 43),
				chat: 0,
				channel: 0,
				message: msg
			});
		}
	}
	
	function noticeMessage(msg) {
		if (sendToNotice) {
			msg = (bossEnraged ? '愤怒 | '.clr('FF0000') : '正常 | '.clr('E69F00')) + msg
			mod.send('S_CHAT', 2, {
				channel: 21,
				authorName: '提示',
				message: msg
			});
		}
	}
	
	function sendMessage(msg) {
		mod.command.message(msg);
	}

}
