# 数据库迁移脚本

## 车辆Occupations数据结构迁移

### 背景
将车辆的 `occupations` 字段从旧的 `startDate/endDate` 格式迁移到新的 `dates` 数组格式。

### 旧格式
```json
{
  "occupations": [
    {
      "type": "维修",
      "startDate": "2020-07-20",
      "endDate": "2022-07-20"
    }
  ]
}
```

### 新格式
```json
{
  "occupations": [
    {
      "type": "维修",
      "dates": ["2020-07-20", "2020-07-21", "2020-07-22", ...]
    }
  ]
}
```

### 运行迁移
```bash
cd tourmaster.ch
node scripts/migrate-vehicle-occupations.js
```

### 注意事项
- 迁移脚本会自动检测数据格式，跳过已经迁移的数据
- 使用中的车辆状态（type: "使用"）不可在编辑页面修改，只能在排班界面修改
- 迁移完成后，新的车辆编辑页面将支持日历形式的状态管理 