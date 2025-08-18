旅行社核心管理系统产品需求文档 (PRD)
1. 引言
本产品需求文档（PRD）旨在详细阐述"旅行社核心管理系统"项目的需求、功能、数据结构和高层架构。该系统旨在为多个旅行社提供一个共享的、独立管理的核心管理平台，覆盖行程规划、旅行团运营、资源（导游、车辆）调度、团员信息管理等核心业务流程，以提升各旅行社的运营效率和数据管理能力。

1.1. 文档结构与存储
所有项目相关文档将存储在项目根目录下的 doc 文件夹中，以 Markdown 格式保存，便于管理和版本控制：

doc/PRD.md: 本产品需求文档。

doc/DataStructure.md: 详细的数据模型定义（与本 PRD 7. 节内容一致，但可进一步细化）。

doc/FileStructure.md: 项目文件和目录结构说明。

2. 项目概述
项目名称： 旅行社核心管理系统（igloos.ch 平台版）

项目目标：

为不同的旅行社提供独立且隔离的管理环境。

集中管理旅行行程模板和具体旅行团信息。

高效调度和管理导游与车辆等核心资源。

全面记录和管理旅行团成员信息。

提供清晰的数据模型和模块化设计，支持未来的功能扩展。

提升旅行社内部运营的自动化和信息化水平。

3. 目标与目的
提高效率： 通过自动化和标准化的流程，减少人工操作，提高行程创建、团组管理和资源调度的效率。

数据隔离与安全： 确保不同旅行社之间的数据完全隔离，保障数据安全性和隐私。

资源优化： 实现导游和车辆等资源的有效分配和利用，避免冲突和浪费。

可扩展性： 构建一个灵活的系统架构，便于未来集成财务管理、客户关系管理（CRM）等更多功能模块。

决策支持： 提供数据基础，支持管理层进行运营分析和决策。

4. 范围
4.1. 本期范围（In Scope）
平台管理： 支持平台方管理入驻旅行社账户。

旅行社独立空间： 确保每个旅行社拥有独立的数据视图和操作权限。

用户与权限管理： 支持平台超级管理员、旅行社管理员、以及旅行社内部的各种角色登录和基本权限控制。

行程管理： 创建、编辑、查询、删除可复用的旅行行程模板（限所属旅行社）。

旅行团管理： 基于行程模板创建、管理具体旅行团实例，包括团期、状态、容量等（限所属旅行社）。

团员管理： 录入、查询、管理旅行团成员的详细信息（限所属旅行社）。

导游资源管理： 导游信息录入、查询、修改，并显示其可用性/占用状态。

车辆资源管理： 车辆信息录入、查询、修改，并显示其可用性/占用状态（限所属旅行社）。

排班/预订记录管理： 为特定旅行团分配导游和车辆，并记录其排班日期（限所属旅行社）。

数据关系维护： 确保行程、团、团员、导游、车辆和排班记录之间的数据关联正确。

违章责任查询： 根据车牌和日期查询当时可能驾驶车辆的导游。

4.2. 暂不考虑（Out of Scope for this iteration）
高级财务管理（收支核算、利润分析）。

详细的客户关系管理（客户历史、偏好分析）。

复杂的报告和数据分析功能（如BI仪表盘）。

通知系统（如排班冲突提醒、维护提醒）。

文档附件管理。

与外部系统（如支付网关、机票系统）的集成。

多语言支持。

跨旅行社的资源共享或协作功能。

保存违章的具体信息（如违章类型、罚款金额、违章照片等）。

5. 用户角色与权限
系统将支持以下主要用户角色，并可根据实际需求进行细化：

平台超级管理员 (Super Admin)
拥有平台最高权限，管理所有入驻旅行社。
旅行社账户管理（增删改查、激活/禁用）；查看平台整体数据概览；处理平台级配置；可管理平台级导游池（增删改查导游基本信息）。

旅行社管理员 (Agency Admin)
负责管理所属旅行社内部的用户和数据。
管理所属旅行社内部的用户账户（增删改查、分配角色）；管理所属旅行社的所有模块数据（行程模板、旅行团、团员、车辆、排班记录的增删改查）；查看所属旅行社的报表；管理所属旅行社可用的导游（将导游池中的导游分配给自己旅行社，并维护旅行社内的导游专属信息）。重要：无法访问其他旅行社的数据。

调度员 (Scheduler)
负责旅行团的资源分配。
行程模板（查）、旅行团（查、改）、导游（查、改占用）、车辆（查、改占用）、排班记录（增删改查）、违章责任查询（查）。

销售经理 (Sales Manager)
负责旅行团的销售和成员管理。
行程模板（查）、旅行团（增删改查）、团员（增删改查）。

导游 (Guide)
仅能查看自己的排班和相关团组信息。
自己的排班记录（查）、自己负责的旅行团（查）、相关团员信息（查）。

财务 (Finance)
（未来扩展）负责财务数据录入和分析。
财务模块（增删改查）、旅行团（查）。

普通用户 (Basic User)
（未来扩展）例如，团员查询自己的行程。

仅能查看与自己相关的信息。

6. 功能需求
6.1. 用户与权限模块
FR-U01: 用户登录和登出功能。

FR-U02 (新增): 平台超级管理员可创建、编辑、禁用和删除旅行社账户。

FR-U03 (修改): 旅行社管理员可创建、编辑、禁用和删除所属旅行社内部的用户账户。

FR-U04 (修改): 旅行社管理员可分配所属旅行社内部用户的角色和权限。

FR-U05: 用户可修改自己的密码。

6.2. 行程管理模块
FR-IT01: 创建新的行程，包括名称、描述、天数、目的地、每日活动、估算成本、包含/不包含项。

FR-IT02: 查询所属旅行社的所有或特定行程。

FR-IT03: 编辑现有行程的详细信息。

FR-IT04: 禁用或激活行程。

FR-IT05: 支持行程按名称、目的地等字段进行搜索和筛选。

FR-IT06: 行程可被复制，复制后可修改并分配给其他旅行团。

6.3. 旅行团管理模块
FR-T01: 创建新的旅行团实例，并为其分配一个行程（每个团仅有一个行程，一个行程也只属于一个团）。

FR-T02: 为旅行团指定团号、团名、起止日期、最大容量、销售经理等。

FR-T03: 查询所属旅行社的所有或特定旅行团，支持按团号、日期范围、销售经理等筛选。

FR-T04: 更新旅行团的状态（如：计划中、进行中、已完成、已取消）。

FR-T05: 查看旅行团的当前成员数量。

FR-T06: 删除旅行团（需确认无关联团员或排班）。

6.4. 团员管理模块
FR-M01: 为特定旅行团添加新团员。

FR-M02: 录入团员的详细个人信息（姓名、性别、出生日期、护照信息、联系方式、紧急联系人、健康备注、饮食限制）。

FR-M03: 查询特定旅行团的所有团员。

FR-M04: 编辑团员的个人信息。

FR-M05: 从旅行团中移除团员。

6.5. 导游资源管理模块
FR-G01 (修改): 平台超级管理员可添加、编辑、禁用和删除平台导游池中的导游基本信息（例如：姓名、性别、联系方式、语言、特长、评级）。

FR-G02 (新增): 旅行社管理员可从平台导游池中选择导游，将其关联到自己的旅行社，并为该导游设置该旅行社内的专属信息（例如：在该旅行社的内部员工ID、合同类型、基础薪酬）。

FR-G03 (修改): 旅行社管理员和调度员可查询所属旅行社内可用的导游（已关联到本旅行社的导游），支持按语言、特长、活跃状态等筛选。

FR-G04 (修改): 旅行社管理员可编辑所属旅行社内导游的专属信息（如员工ID、合同类型、薪酬），或更改其在该旅行社内的激活状态。

FR-G05 (保留): occupiedDates 仍是导游的全局属性，由系统在排班时自动更新，反映导游在所有旅行社下的总占用情况。

6.6. 车辆资源管理模块
FR-V01: 添加新的车辆信息（车牌号、类型、品牌、型号、载客量、年份、司机信息、维护状态）。

FR-V02: 查询所属旅行社的所有或特定车辆，支持按类型、容量、维护状态等筛选。

FR-V03: 编辑车辆的详细信息。

FR-V04: 查看车辆的当前占用日期列表。

FR-V05: 禁用或激活车辆。

6.7. 排班/预订记录管理模块
FR-B01: 为特定旅行团创建排班记录。

FR-B02 (修改): 在排班记录中分配一个或多个导游，并指定各自负责的日期范围。系统应确保所选导游已关联到当前旅行社，并且在该日期可用。

FR-B03: 在排班记录中分配一辆车辆，并指定负责的日期范围。

FR-B04: 自动更新导游和车辆的"占用日期"列表，以反映排班情况。

FR-B05: 查询特定旅行团的排班记录。

FR-B06: 编辑现有排班记录（如更换导游/车辆、调整日期）。

FR-B07: 更改排班记录状态（如：待定、已确认、已取消）。

FR-B08: 当分配资源时，系统应提示资源（导游/车辆）在所选日期是否已被其他排班占用（冲突检测）。

6.8. 违章责任查询模块 (修改)
FR-VCR01: 用户输入车辆的车牌号和违章发生日期。

FR-VCR02: 系统根据输入的车牌号和日期，查询所属旅行社的排班记录（Booking），以识别在该日期驾驶该车辆的导游。

FR-VCR03: 显示查询结果，包括匹配到的旅行团信息（如果存在）和当时驾驶该车辆的导游列表。如果有多位导游在不同时段负责，则列出所有相关导游。

FR-VCR04: 如果在给定日期和车牌号下未找到匹配的排班记录，系统应给出明确提示。

7. 数据模型 (Entities / Models)
以下是每个实体（Entity）的详细数据结构建议，以及它们之间的关系。
约定：

id: 唯一标识符（主键）。

_ids: 关联到其他实体的ID列表。

Date 类型通常存储为 ISO 8601 字符串 (YYYY-MM-DD 或onedDateTime-MM-DDTHH:mm:ssZ)。

agencyId 字段： 对于属于特定旅行社的业务实体（如 Tour, Itinerary, Vehicle, AgencyGuideAssignment 等），将包含 agencyId 字段，用于多租户数据隔离。User 实体中的 agencyId 字段用于区分平台超级管理员和旅行社内部用户。

7.0. 旅行社 (Agency) - 新增
代表平台上的一个独立旅行社客户。

{
  "id": "agency001", // 旅行社唯一标识符
  "name": "环球旅行社",
  "contactEmail": "contact@travelagency.com",
  "contactPhone": "+1234567890",
  "address": "环球大道88号",
  "isActive": true, // 是否活跃
  "platformAdminId": "u_super_admin", // 关联到平台创建者ID
  "createdAt": "2025-01-01T09:00:00Z",
  "updatedAt": "2025-06-25T10:00:00Z"
}

7.1. 用户 (User)
负责系统登录和权限管理，并与所属旅行社关联。

{
  "id": "u001",
  "agencyId": "agency001", // 关联到所属旅行社ID (重要)
  "username": "agency_admin_001",
  "passwordHash": "hashed_password", // 存储加密后的密码
  "email": "agencyadmin@example.com",
  "role": "agency_admin", // "platform_super_admin", "agency_admin", "scheduler", "guide", "sales" 等
  "isActive": true,
  "openid": "wx_openid_xxx", // 新增，微信用户唯一标识，普通用户可为空
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-01T10:00:00Z"
}

7.2. 行程 (Itinerary)
定义具体的旅行行程，与所属旅行社和旅行团一一对应。

{
  "id": "it20250715_001",
  "agencyId": "agency001", // 关联到所属旅行社ID (重要)
  "name": "瑞士深度探索之旅 - 7日",
  "description": "探索瑞士壮丽的山川湖泊和文化名城。",
  "durationDays": 7, // 行程天数
  "destinations": ["苏黎世", "琉森", "因特拉肯", "采尔马特"], // 主要目的地
  "activities": [
    {
      "day": 1,
      "description": "抵达苏黎世，自由活动",
      "hotelInfo": {
        "name": "Hotel XYZ Zurich",
        "checkInTime": "15:00",
        "checkOutTime": "12:00"
      },
      "guides": [
        {
          "guideId": "g001", // 外键，指向 Guide 表
          "vehicleId": "v001", // 外键，指向 Vehicle 表（如有）
          "guideAccommodation": "Big Hotel",
          "notes": "今天去表店购物" 
        },
        {
          "guideId": "g002",
          "vehicleId": null,
          "guideAccommodation": null,
          "notes": "今天去表店购物" 
        }
      ]
    },
    {
      "day": 2,
      "description": "苏黎世市区游览，班霍夫大街购物",
      "hotelInfo": {
        "name": "Hotel XYZ Zurich",
        "checkInTime": "15:00",
        "checkOutTime": "12:00"
      },
      "guides": [
        {
          "guideId": "g001",
          "vehicleId": null,
          "guideAccommodation": null,
          "notes": "待安排"
        }
      ]
    },
    {
      "day": 3,
      "description": "前往琉森，游览卡佩尔廊桥，乘船游览琉森湖",
      "hotelInfo": {
        "name": "Hotel ABC Lucerne",
        "checkInTime": "15:00",
        "checkOutTime": "12:00"
      },
      "guides": [
        {
          "guideId": "g001",
          "vehicleId": "v002",
          "guideAccommodation": "Hotel ABC Lucerne",
          "notes": "已安排"
        }
      ]
    },
    {
      "day": 4,
      "description": "前往因特拉肯，少女峰一日游",
      "hotelInfo": {
        "name": "Hotel DEF Interlaken",
        "checkInTime": "15:00",
        "checkOutTime": "12:00"
      },
      "guides": [
        {
          "guideId": "g002",
          "vehicleId": null,
          "guideAccommodation": "Hotel DEF Interlaken",
          "notes": "已安排"
        }
      ]
    },
    {
      "day": 5,
      "description": "采尔马特，马特宏峰冰川天堂",
      "hotelInfo": {
        "name": "Hotel GHI Zermatt",
        "checkInTime": "15:00",
        "checkOutTime": "12:00"
      },
      "guides": [
        {
          "guideId": "g001",
          "vehicleId": "v001",
          "guideAccommodation": "Hotel GHI Zermatt",
          "notes": "已安排"
        }
      ]
    },
    {
      "day": 6,
      "description": "返回苏黎世，自由活动",
      "hotelInfo": {
        "name": "Hotel XYZ Zurich",
        "checkInTime": "15:00",
        "checkOutTime": "12:00"
      },
      "guides": [
        {
          "guideId": "g002",
          "vehicleId": null,
          "guideAccommodation": "Hotel GHI Zermatt",
          "notes": "已安排"
        }
      ]
    },
    {
      "day": 7,
      "description": "苏黎世机场送机",
      "hotelInfo": null // 最后一晚可能没有酒店入住
    },
    "guides": [
      {
        "guideId": "g002",
        "vehicleId": null,
        "guideAccommodation": null,
        "notes": "待安排"
      }
    ]
  ],
  "costEstimation": 5000.00, // 行程成本估算
  "inclusion": ["交通", "住宿", "部分餐食", "景点门票"],
  "exclusion": ["国际机票", "个人消费", "导游小费"],
  "isActive": true,
  "createdBy": "u001", // 关联到创建用户ID
  "createdAt": "2025-01-10T09:30:00Z",
  "updatedAt": "2025-01-10T09:30:00Z"
}

// 说明：
// activities 每日信息中 guides 字段仅包含 guideId 和 vehicleId 两个外键字段，详细信息（如姓名、车牌号）通过外键在 Guide、Vehicle 主表中维护，避免冗余，保证数据一致性。

7.3. 旅行团 (Tour Group)
具体的旅行团实例，与所属旅行社和行程一一对应。

{
  "id": "t20250715_001", // 团号，例如日期+序号
  "agencyId": "agency001", // 关联到所属旅行社ID (重要)
  "name": "瑞士深度探索之旅 - 2025年7月团",
  "itineraryId": "it20250715_001", // 关联到行程ID（一对一）
  "status": "planned", // "planned", "paid", "completed", "cancelled"
  "maxCapacity": 20,
  "currentMembersCount": 15, // 团员数量
  "salesManagerId": "u002", // 负责此团的销售经理ID
  "actualCost": null, // 实际成本
  "actualRevenue": null, // 实际收入
  "notes": "此团有老年团员，行程安排需平缓。",
  "createdAt": "2025-03-01T11:00:00Z",
  "updatedAt": "2025-06-20T14:00:00Z",
  "overallArrivalTime": "2025-07-15T09:00:00Z", // 整个团的抵达时间
  "overallDepartureTime": "2025-07-21T18:00:00Z", // 整个团的送机时间
  "pickupSignInfo": "张三（旅行社名称）", // 接机举牌信息
  "flightDetails": {
    "outboundFlight": {
      "flightNumber": "LX188",
      "airline": "Swiss Air",
      "departureAirport": "PVG",
      "arrivalAirport": "ZRH",
      "departureTime": "2025-07-14T23:55:00Z",
      "arrivalTime": "2025-07-15T07:30:00Z"
    },
    "returnFlight": {
      "flightNumber": "LX189",
      "airline": "Swiss Air",
      "departureAirport": "ZRH",
      "arrivalAirport": "PVG",
      "departureTime": "2025-07-21T22:00:00Z",
      "arrivalTime": "2025-07-22T15:00:00Z"
    }
  }
}

7.4. 团员 (Tour Member)
参加旅行团的个人信息，隐式通过 tourId 关联到旅行社。

{
  "id": "m001",
  "tourId": "t20250715_001", // 关联到所属旅行团ID
  // "agencyId": "agency001", // 可选，如果为了查询方便可以添加，但通过tourId已可推断
  "firstName": "张",
  "lastName": "三",
  "gender": "male",
  "dateOfBirth": "1980-05-20",
  "passportNumber": "E12345678",
  "contactEmail": "zhangsan@example.com",
  "contactPhone": "+8613800138000",
  "emergencyContactName": "李四",
  "emergencyContactPhone": "+8613900139000",
  "healthNotes": "对海鲜过敏",
  "dietaryRestrictions": "素食",
  "createdAt": "2025-06-01T08:00:00Z",
  "updatedAt": "2025-06-01T08:00:00Z"
}

7.5. 导游 (Tour Guide)
导游的全局基本信息。导游可以在平台注册，并被多个旅行社关联。

{
  "id": "g001", // 导游的全局唯一标识符
  "name": "李明",
  "gender": "male",
  "contactPhone": "+41791234567",
  "email": "liming@example.com",
  "languages": ["中文", "英文", "德语"], // 会说的语言
  "specialties": ["文化游", "徒步", "摄影"], // 特长
  "rating": 4.8, // 评价分数
  "occupiedDates": ["2025-07-01", "2025-07-02", "2025-07-03", "2025-07-05"], // 导游已占用的具体日期列表 (YYYY-MM-DD)，反映在所有旅行社下的总占用情况
  "notes": "擅长欧洲历史，客户反馈极好。",
  "isActive": true, // 导游全局活跃状态
  "createdAt": "2024-01-01T09:00:00Z",
  "updatedAt": "2025-06-20T10:30:00Z"
}

7.5.1. 导游-旅行社关系 (AgencyGuideAssignment) - 新增
记录特定导游与特定旅行社之间的关系，以及在该旅行社下的专属属性。

{
  "id": "aga001", // 关系记录的唯一标识符
  "agencyId": "agency001", // 关联到旅行社ID
  "guideId": "g001",       // 关联到导游ID（外键，详细信息在 Guide 主表）
  "agencySpecificEmployeeId": "EMP001", // 在该旅行社的内部员工ID
  "agencySpecificContractType": "full-time", // 在该旅行社的合同类型："full-time", "part-time", "freelance"
  "agencySpecificBaseSalary": 5000.00, // 在该旅行社的基础薪酬
  "isActiveInAgency": true, // 该导游在该旅行社内的活跃状态
  "joinedAgencyAt": "2024-01-01T09:00:00Z",
  "leftAgencyAt": null, // 如果导游离开该旅行社的日期
  "createdAt": "2024-01-01T09:00:00Z",
  "updatedAt": "2025-06-20T10:30:00Z"
}
// 说明：AgencyGuideAssignment 仅保存 guideId 外键，详细信息在 Guide 主表维护。

7.6. 车辆 (Vehicle)
车辆的基本信息和状态管理，与所属旅行社关联。

{
  "id": "v001",
  "agencyId": "agency001", // 关联到所属旅行社ID (重要)
  "plateNumber": "NE 123 456", // 车牌号
  "type": "大巴", // "轿车", "商务车", "中巴", "大巴"
  "make": "Mercedes-Benz",
  "model": "Tourismo",
  "capacity": 50, // 载客量
  "year": 2022,
  "occupations": [
    {
      "type": "维修", // "使用", "维修", "保养", "事故", "待命", "出租"
      "dates": ["2023-07-20", "2023-07-21", "2023-07-22"] // 日期数组，格式 YYYY-MM-DD
    },
    {
      "type": "租赁",
      "dates": ["2021-07-30", "2021-08-01"]
    },
    {
      "type": "使用", // 使用状态由排班页面写入，这里仅用于展示
      "dates": ["2025-07-15", "2025-07-16"]
      
    },
    {
      "type": "待命",
      "dates": []
    }
  ],
  "notes": "配备车载Wi-Fi和舒适座椅。",
  "isActive": true,
  "createdAt": "2024-02-01T10:00:00Z",
  "updatedAt": "2025-06-20T11:00:00Z"
}

// 车辆状态说明（Calendar）：
// - 使用：车辆在排班中被安排使用的日期（红色标记），不可在车辆编辑页修改。
// - 维修/保养/事故/待命/报废/租赁/检测：通过车辆编辑页日历多选写入 dates 数组。
// - dates：单天日期数组（YYYY-MM-DD），可表示不连续多天。
// - 显示规则：使用=红色，其他状态=蓝色，选中待应用=高亮。

7.7. 排班记录 (Booking/Assignment)
记录每个旅行团具体的资源分配情况。

{
  "id": "b001",
  "tourId": "t20250715_001", // 关联到旅行团ID
  // "agencyId": "agency001", // 可选，如果为了查询方便可以添加，但通过tourId已可推断
  "startDate": "2025-07-15", // 排班的起始日期 (与团期一致)
  "endDate": "2025-07-21",   // 排班的结束日期 (与团期一致)
  "assignedGuides": [
    {
      "guideId": "g001", // 外键，指向 Guide 表
      "assignedDates": ["2025-07-15", "2025-07-16", "2025-07-17"], // 导游负责的日期
      "notes": "主导游，负责初期安排"
    },
    {
      "guideId": "g002", // 外键，指向 Guide 表
      "assignedDates": ["2025-07-18", "2025-07-19", "2025-07-20", "2025-07-21"], // 导游负责的日期
      "notes": "协作导游，负责后期送机"
    }
  ],
  "assignedVehicle": {
    "vehicleId": "v001", // 外键，指向 Vehicle 表
    "assignedDates": ["2025-07-15", "2025-07-16", "2025-07-17", "2025-07-18", "2025-07-19", "2025-07-20", "2025-07-21"], // 车辆负责的日期
    "notes": "全程提供交通服务"
  },
  "assignedAccommodations": [ // 导游每日住宿安排
    {
      "date": "2025-07-15",
      "hotelName": "Hotel XYZ Zurich",
      "checkInTime": "15:00",
      "checkOutTime": "12:00",
      "assignedGuides": ["g001"] // 当日入住此酒店的导游ID列表
    },
    {
      "date": "2025-07-16",
      "hotelName": "Hotel XYZ Zurich",
      "checkInTime": "15:00",
      "checkOutTime": "12:00",
      "assignedGuides": ["g001"]
    },
    {
      "date": "2025-07-17",
      "hotelName": "Hotel ABC Lucerne",
      "checkInTime": "15:00",
      "checkOutTime": "12:00",
      "assignedGuides": ["g001"]
    },
    {
      "date": "2025-07-18",
      "hotelName": "Hotel DEF Interlaken",
      "checkInTime": "15:00",
      "checkOutTime": "12:00",
      "assignedGuides": ["g002"]
    },
    {
      "date": "2025-07-19",
      "hotelName": "Hotel GHI Zermatt",
      "checkInTime": "15:00",
      "checkOutTime": "12:00",
      "assignedGuides": ["g002"]
    },
    {
      "date": "2025-07-20",
      "hotelName": "Hotel XYZ Zurich",
      "checkInTime": "15:00",
      "checkOutTime": "12:00",
      "assignedGuides": ["g002"]
    }
  ],
  "status": "confirmed", // "pending", "confirmed", "cancelled"
  "bookedBy": "u003", // 排班操作员ID
  "createdAt": "2025-06-20T15:00:00Z",
  "updatedAt": "2025-06-20T15:00:00Z"
}
// 说明：Booking 仅保存 guideId、vehicleId 外键，详细信息在 Guide、Vehicle 主表维护。

7.8. 供应商 (Supplier) (可选扩展)
例如酒店、餐厅、机票代理等，与所属旅行社关联。

{
  "id": "s001",
  "agencyId": "agency001", // 关联到所属旅行社ID (重要)
  "name": "Alpine Hotels Group",
  "type": "酒店", // "酒店", "餐厅", "航空公司", "景点"
  "contactPerson": "Anna Müller",
  "contactEmail": "anna@alpinehotels.com",
  "contactPhone": "+41441234567",
  "address": "Main Street 1, Zurich, Switzerland",
  "serviceOfferings": ["住宿", "餐饮"],
  "notes": "长期合作供应商，提供折扣。",
  "isActive": true,
  "createdAt": "2024-03-01T10:00:00Z"
}

7.9. 服务预订 (Service Reservation) (可选扩展)
记录针对某个团向供应商进行的具体预订，隐式通过 tourId 和 supplierId 关联到旅行社。

{
  "id": "sr001",
  "tourId": "t20250715_001",
  "supplierId": "s001",
  // "agencyId": "agency001", // 可选，如果为了查询方便可以添加
  "serviceType": "酒店住宿", // "酒店住宿", "餐厅预订", "门票"
  "description": "Hotel A, 3晚，共15人",
  "startDate": "2025-07-15",
  "endDate": "2025-07-18",
  "quantity": 15, // 人数或数量
  "unitPrice": 100.00, // 单价
  "totalCost": 3000.00, // 总成本
  "status": "confirmed", // "pending", "confirmed", "cancelled"
  "confirmationNumber": "HGH789ABC",
  "bookedBy": "u002",
  "createdAt": "2025-06-10T14:00:00Z",
  "updatedAt": "2025-06-10T14:00:00Z"
}

7.10. 数据关系概述
平台超级管理员: 可以管理 Agency。

Agency (一对多) User: 一个旅行社可以有多个内部用户。

Agency (一对多) Itinerary: 一个旅行社可以创建多个行程模板。

Itinerary (一对一) Tour: 一个行程只属于一个旅行团，一个旅行团只对应一个行程。

行程可被复制，复制后可分配给其他旅行团，复制出的行程与原行程完全独立。

Tour (一对多) Member: 一个旅行团包含多个团员。

Tour (一对一) Booking: 一个旅行团通常对应一个排班记录（尽管可能随时间修改）。

Agency (多对多) Guide (通过 AgencyGuideAssignment): 一个旅行社可以与多个导游关联，一个导游也可以与多个旅行社关联。AgencyGuideAssignment 实体维护此关系，并存储导游在该旅行社下的专属属性。

Agency (一对多) Vehicle: 一个旅行社管理多辆车辆。

Booking (多对多) Guide: 一个排班记录可以分配一个或多个导游，一个导游可以出现在多个排班记录中（不同日期）。Booking 中的 assignedGuides 存储具体关系。在分配时，系统将验证该导游是否通过 AgencyGuideAssignment 关联到当前旅行社。

Booking (多对一) Vehicle: 一个排班记录分配一辆车，一辆车可以出现在多个排班记录中（不同日期）。Booking 中的 assignedVehicle 存储具体关系。

Booking (多对多) Accommodation: 一个排班记录可以分配多个每日住宿，一个酒店可以出现在多个住宿记录中。Booking 中的 assignedAccommodations 存储具体关系。

Guide 和 Vehicle 都通过其 occupiedDates 维护自身的可用性状态。

Agency (一对多) Supplier: 一个旅行社可以管理自己的供应商。

Supplier (一对多) ServiceReservation: 一个供应商可以被多个服务预订引用。

Tour (一对多) ServiceReservation: 一个旅行团可以有多个服务预订（酒店、餐饮、景点等）。

违章责任查询：这是一个查询逻辑，它不涉及新的数据模型，而是通过 Vehicle 的 plateNumber 和 Booking 的 assignedVehicle 以及日期范围来定位 assignedGuides。

所有业务数据（Itinerary, Tour, Member, Vehicle, Booking, Supplier, ServiceReservation, AgencyGuideAssignment）都将通过 agencyId 或间接关联到 agencyId 来实现数据隔离。

8. 高层架构
系统将采用经典的前后端分离架构，通过 RESTful API 进行数据交互。

+----------------+      +----------------+      +----------------+
|    前端应用    |      |    后端服务    |      |      数据库    |
| (Vue.js)       |<---->|      (Python)    |<---->|    (PostgreSQL)|
+----------------+      +----------------+      +----------------+
      |                          |                      |
      |                          |                      |
      | (用户界面/状态管理)         | (API/业务逻辑/ORM)      | (数据存储)
      V                          V                      V
+-------------------------------------------------------------+
|               用户层 / 浏览器                               |
+-------------------------------------------------------------+

8.1. 前端应用 (Frontend)
技术栈： Vue.js (Vue 3)

目录结构：

assets/: 静态资源（图片、字体、全局CSS）。

components/: 可复用UI组件。

views/: 页面级组件（例如：旅行团管理页面、导游管理页面）。

router/: Vue Router 配置，管理页面路由。

stores/: Vuex 或 Pinia 状态管理，维护应用数据状态。

api/: API 请求封装，处理与后端服务的通信。

utils/: 通用工具函数。

职责： 提供直观的用户界面，处理用户交互，通过 API 与后端服务通信，管理前端应用状态。

8.2. 后端服务 (Backend)
技术栈： Python (采用 Django 框架，配合 Django REST Framework)

部署平台： Vercel (作为 Serverless Functions 部署)

目录结构：

models/: 数据库模型定义 (使用 Django ORM)。

controllers/: 处理 HTTP 请求，调用业务逻辑服务。

routes/: 定义 RESTful API 接口路由。

services/: 封装复杂业务逻辑，供 controllers 调用（可选）。

config/: 数据库连接、环境变量等配置。

Vercel Functions 适配层： 额外的文件和配置用于将 Python Django Web 应用适配为 Vercel Serverless Functions。

职责： 暴露 RESTful API 接口，处理业务逻辑，与数据库交互，进行数据校验、权限验证，并严格执行多租户数据隔离逻辑。需特别注意在 Serverless 环境下处理数据库连接池和冷启动优化。

8.3. 数据库 (Database)
技术栈： PostgreSQL

职责： 持久化存储所有业务数据，支持高效的数据查询和管理。

考虑： PostgreSQL作为功能强大的关系型数据库，非常适合管理本系统中的复杂数据关系和事务性操作。其原生的 JSONB 数据类型能够高效存储和查询行程模板和排班记录中的嵌套及数组结构（如 activities, assignedGuides, assignedAccommodations），这在保持关系模型优势的同时，提供了极大的灵活性。为了支持多租户，每个相关表都将包含 agencyId 字段，并在所有数据操作中强制加入 WHERE agencyId = current_agency_id 的条件。

9. 非功能性需求
性能 (Performance):

页面加载时间：主要页面在3秒内加载完成。

API响应时间：核心API（查询、创建）在1秒内响应。

并发用户：系统应能支持至少50个并发用户。

Vercel 冷启动优化： 针对 Python Serverless Functions 的冷启动问题进行优化（例如，保持函数"热"状态或优化依赖）。

安全性 (Security):

用户认证：所有用户操作前需进行身份验证（基于Token）。

数据加密：敏感数据（如密码）需加密存储。

多租户数据隔离： 严格的逻辑隔离，确保不同旅行社的数据无法互相访问。

权限控制：严格遵循定义的角色权限，防止越权操作。

输入验证：所有用户输入均需进行严格的后端验证，防止SQL注入、XSS等攻击。

审计日志：记录关键操作（如数据修改、删除）的日志，以便追踪。

可扩展性 (Scalability):

架构设计应支持未来用户量和数据量的增长。

模块化设计：方便增加新的功能模块而无需重构整个系统。

多租户扩展性： 能够平滑地增加新的旅行社客户。

Serverless 自动扩缩容： 利用 Vercel Serverless Functions 的自动扩缩容能力。

可用性 (Usability):

用户界面直观易用，符合操作习惯。

错误提示清晰友好。

支持响应式设计，适应不同设备（桌面、平板）的浏览。

可维护性 (Maintainability):

代码结构清晰，遵循编码规范。

充足的文档和注释。

易于调试和部署。

可靠性 (Reliability):

系统应具备高稳定性，减少宕机时间。

数据备份和恢复机制。

错误处理和日志记录机制。

10. 未来扩展考虑（Roadmap）
权限管理： 更细粒度的用户权限控制。

财务模块： 跟踪每个团的收支、成本核算、利润分析、发票管理。

客户关系管理 (CRM): 管理客户信息，记录客户历史、偏好、沟通记录。

报告和分析： 生成各种业务报告，如导游工作量、车辆利用率、团利润率、销售业绩等。

通知系统： 排班冲突提醒、车辆维护提醒、团期临近提醒等。

文档管理： 存储合同、签证材料、行程单等相关文件。

供应商管理细化： 管理供应商的合同、价格清单。

多语言支持： 支持多国语言界面。

导游提交报销： 导游可以在系统中提交与旅行团相关的各项费用报销，并附带凭证，管理人员可进行审核。

11. 结论
本PRD详细描述了旅行社核心管理系统的需求和设计，为项目的后续开发提供了明确的指导。通过分层架构和清晰的数据模型，系统将能够有效支持旅行社的日常运营，并为未来的功能扩展奠定坚实的基础。