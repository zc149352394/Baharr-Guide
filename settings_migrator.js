const DefaultSettings = {
    "enabled": true,
    "sendToAlert": true,          // 屏中警告
    "sendToNotice": true,         // 队长通知
    "sendToMessage": true,        // 代理频道
    "itemsHelp": true,            // 地面提示
    "itemID1": ,                  // 告示牌: 1一般布告栏, 2兴高采烈布告栏, 3狂人布告栏
    "itemID2": ,                  // 战利品: 古龍貝勒古斯的頭 (光柱), 369: 鑽石
    "itemID3" ,                   // 采集物: 445艾普罗
    "itemID4": ,                  // 采集物: 912鸵鸟蛋
    "BossName": ["封印之门", "一阶", "二阶"],
    "BossActions": [
        {id: 101, msg: '锤地 270 重击'},
        {id: 103, msg: '前砸 (闪避)'}, //103 104
        // {id: 105, msg: '270扫飞 (格挡)'},
        // {id: 107, msg: '重击 (闪避)'},
        {id: 108, msg: '丢锤 (晕眩)'},
        {id: 111, msg: '后砸 (慢慢慢慢)'},
        {id: 112, msg: '完美格挡'},
        {id: 113, msg: '点名 (闪避)'},
        {id: 114, msg: '捶地 (秒杀)'},
        {id: 115, msg: '右 蓄力(击飞)'}, //114 115
        {id: 116, msg: '甜甜圈'},
        {id: 117, msg: '随仇->跳劈 (击倒)'},
        {id: 118, msg: '主仇->跳劈 (击倒)'},
        {id: 119, msg: '→右 安全→ (坦左移)'},
        {id: 120, msg: '←左 安全← (坦右移)'},
        {id: 121, msg: '左  (4连半月)'},
        {id: 122, msg: '左  第3下加速'},
        {id: 123, msg: '左  第2下加速'},
        {id: 125, msg: '右 前砸(闪) | 后拉'}, //125 126 127
        {id: 131, msg: '左 范围(挡) | 后拉'}, //131 132 134
        {id: 135, msg: '完美格挡'},
        // {id: 137, msg: '后砸 (闪避)'},
        {id: 138, msg: '左 蓄力(击飞)'}, //113 138
        {id: 139, msg: '转圈 (击倒)'}, //108 110 139    118 139    101 105 107 139
        {id: 140, msg: '右  (4连半月)'},
        {id: 141, msg: '右  第3下加速'},
        {id: 142, msg: '右  第2下加速'},
        // {id: 305, msg: '滚石!!'},
        // {id: 306, msg: '滚石!!'},
        // {id: 307, msg: '陨石 (集中)'}, //307 301
        {id: 308, msg: '第1次晕'},
        {id: 309, msg: '第2次晕'},
        {id: 310, msg: '第3次晕'},
        {id: 311, msg: '补师开盾 (右手放锤)'}, //311 120    311 119
        {id: 312, msg: '补师开盾 (左右放锤)'}  //312 119    312 120
    ]
};

module.exports = function MigrateSettings(from_ver, to_ver, settings) {
    if (from_ver === undefined) {
        // Migrate legacy config file
        return Object.assign(Object.assign({}, DefaultSettings), settings);
    } else if (from_ver === null) {
        // No config file exists, use default settings
        return DefaultSettings;
    } else {
        // Migrate from older version (using the new system) to latest one
        if (from_ver + 1 < to_ver) {
            // Recursively upgrade in one-version steps
            settings = MigrateSettings(from_ver, from_ver + 1, settings);
            return MigrateSettings(from_ver + 1, to_ver, settings);
        }
        
        // If we reach this point it's guaranteed that from_ver === to_ver - 1, so we can implement
        // a switch for each version step that upgrades to the next version. This enables us to
        // upgrade from any version to the latest version without additional effort!
        switch(to_ver) {
            default:
                let oldsettings = settings
                
                settings = Object.assign(DefaultSettings, {});
                
                for(let option in oldsettings) {
                    if(settings[option]) {
                        settings[option] = oldsettings[option]
                    }
                }
                
                break;
        }
        
        return settings;
    }
}
