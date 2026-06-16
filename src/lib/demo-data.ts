import type { AiCostLog, DailyFeed, JobLog } from "./types";

export const todayFeed: DailyFeed = {
  date: "2026-06-06",
  title: "今日小冒险",
  estimateMinutes: 10,
  items: [
    {
      id: "art-pipeline",
      category: "art",
      route: "美术管线",
      title: "角色资产从概念到验收的 5 个检查点",
      nodeLabel: "美术管线知识",
      summary: "用 PM 视角快速看懂角色资产交付链路，重点关注风格确认、模型规范、贴图标准、绑定需求和验收节奏。",
      application: "今天可以把这 5 个检查点变成外包反馈模板，减少返工沟通。",
      body: [
        "角色资产通常会经历概念确认、三视图或设定补齐、建模、贴图材质、绑定适配和引擎验收。PM 不需要替代美术判断，但需要知道每个阶段最容易卡住的风险。",
        "概念阶段要确认风格、体型比例、装备层级和可复用部件。建模阶段要关注面数、命名、拆件规则和 LOD。贴图阶段要关注材质通道、分辨率、风格一致性和引擎表现。",
        "验收时建议把反馈分为阻塞项、质量项和优化项。阻塞项影响进入下一阶段，质量项影响最终表现，优化项可以进入后续版本。"
      ],
      sourceUrl: "https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-your-production-pipeline-in-unreal-engine",
      minutes: 3,
      tags: ["角色资产", "外包", "验收"],
      accent: "mint"
    },
    {
      id: "ai-frontier",
      category: "ai",
      route: "AI工具",
      title: "多模态模型如何帮助美术 PM 做参考整理",
      nodeLabel: "AI前沿知识",
      summary: "多模态模型可以把参考图、文字需求和风格关键词放在同一套语义空间里，适合做前期参考归类和需求澄清。",
      application: "适合在需求会前把参考图自动分组，再生成每组风格说明，帮助主美更快判断方向。",
      body: [
        "对美术 PM 来说，多模态能力最实用的地方不是直接生成最终资产，而是把大量参考资料整理成可讨论的信息结构。",
        "例如把角色参考图按材质、轮廓、色彩情绪、时代感和细节密度分组，再补充每组的适用场景。这样需求会讨论会更集中。",
        "需要注意的是，AI 的归类只能作为辅助。最终风格判断仍应由主美或负责人确认。"
      ],
      sourceUrl: "https://platform.openai.com/docs/guides/images-vision",
      minutes: 2,
      tags: ["多模态", "参考图", "需求澄清"],
      accent: "sky"
    },
    {
      id: "github-tool",
      category: "github",
      route: "GitHub工具",
      title: "一个适合整理 ComfyUI 工作流的开源项目",
      nodeLabel: "GitHub项目",
      summary: "项目提供工作流模板管理、节点说明和版本记录思路，适合 PM 记录团队常用 AI 工作流。",
      application: "可以把常用生图流程变成团队知识卡，标注输入、输出、耗时和风险点。",
      body: [
        "GitHub 项目不一定要直接交给美术使用，PM 更应该关注它能否变成团队可复用流程。",
        "评估一个开源项目时，先看 README 是否清楚、最近是否更新、issue 是否活跃、是否有示例图和使用限制。",
        "如果项目适合团队试用，建议先做一张工具卡：用途、适用场景、上手成本、依赖环境、风险和原始链接。"
      ],
      sourceUrl: "https://github.com/comfyanonymous/ComfyUI",
      minutes: 2,
      tags: ["GitHub", "ComfyUI", "工作流"],
      accent: "lemon"
    },
    {
      id: "ai-tool",
      category: "tool",
      route: "AI工具",
      title: "今日 AI 工具：参考图批量标注助手",
      nodeLabel: "AI工具推荐",
      summary: "用 AI 批量识别参考图主题、风格、材质和风险标签，减少需求整理时间。",
      application: "适合外包需求准备阶段，把 30 张参考图压缩成 5 组清晰风格方向。",
      body: [
        "参考图越多，团队越容易误解重点。AI 标注助手可以先做第一轮粗分类，把图片按色彩、题材、材质、风格强度和可落地性归组。",
        "PM 可以在 AI 输出后补上业务判断：哪些是必须跟随的风格，哪些只是情绪参考，哪些会提高制作成本。",
        "建议不要让 AI 直接替代风格决策，而是把它作为信息整理的前置步骤。"
      ],
      sourceUrl: "https://github.com/invoke-ai/InvokeAI",
      minutes: 2,
      tags: ["AI工具", "参考图", "效率"],
      accent: "coral"
    }
  ],
  questions: [
    {
      id: "pmp-1",
      type: "single",
      stem: "外包角色资产连续两次返修仍未达到风格要求，PM 最应该先做什么？",
      options: [
        { id: "A", text: "直接更换供应商，避免继续浪费时间" },
        { id: "B", text: "组织主美、PM 和供应商对齐风格样板与验收标准" },
        { id: "C", text: "要求供应商加班，在原计划内完成" },
        { id: "D", text: "把问题记录到项目复盘，当前不处理" }
      ],
      answer: ["B"],
      explanation: "先对齐标准能减少后续返工。此场景的核心是沟通与质量标准不一致，而不是立即升级为供应商替换。",
      knowledgeArea: "沟通管理"
    },
    {
      id: "pmp-2",
      type: "multiple",
      stem: "以下哪些做法有助于降低美术资产延期风险？",
      options: [
        { id: "A", text: "在制作前确认验收标准" },
        { id: "B", text: "关键节点只在最终交付时检查" },
        { id: "C", text: "把阻塞反馈和优化反馈分级" },
        { id: "D", text: "记录外包依赖和交付缓冲" }
      ],
      answer: ["A", "C", "D"],
      explanation: "前置验收标准、反馈分级和依赖缓冲都能降低延期风险。只在最终交付检查会放大返工成本。",
      knowledgeArea: "风险管理"
    },
    {
      id: "pmp-3",
      type: "single",
      stem: "主美临时调整角色风格方向，影响已排期的 6 个资产。PM 首先应更新什么？",
      options: [
        { id: "A", text: "风险登记册和影响评估" },
        { id: "B", text: "个人学习计划" },
        { id: "C", text: "供应商付款信息" },
        { id: "D", text: "项目口号" }
      ],
      answer: ["A"],
      explanation: "风格方向变化属于范围和风险变化，应先记录影响、识别受影响资产，再推动决策。",
      knowledgeArea: "范围管理"
    },
    {
      id: "pmp-4",
      type: "single",
      stem: "团队对 AI 工具生成的参考图存在版权担忧，PM 应优先推动哪项动作？",
      options: [
        { id: "A", text: "停止所有 AI 使用" },
        { id: "B", text: "建立来源记录、使用边界和审核流程" },
        { id: "C", text: "只在内部聊天中使用，不做记录" },
        { id: "D", text: "要求美术自行判断即可" }
      ],
      answer: ["B"],
      explanation: "更稳妥的做法是建立可追溯和可审核的使用流程，而不是简单禁用或放任。",
      knowledgeArea: "风险管理"
    },
    {
      id: "pmp-5",
      type: "multiple",
      stem: "一个健康的美术外包验收节点通常应该包含哪些信息？",
      options: [
        { id: "A", text: "交付物清单" },
        { id: "B", text: "明确的质量标准" },
        { id: "C", text: "反馈优先级" },
        { id: "D", text: "只写一句“看起来不错”" }
      ],
      answer: ["A", "B", "C"],
      explanation: "验收节点需要清单、标准和反馈优先级。模糊评价无法支撑后续排期和质量管理。",
      knowledgeArea: "质量管理"
    }
  ]
};

export const jobLogs: JobLog[] = [
  { id: "job-1", status: "success", name: "PMP 题生成", detail: "生成 5 道练习题，包含单选 4 道、多选 1 道", createdAt: "08:18" },
  { id: "job-2", status: "success", name: "GitHub 项目抓取", detail: "候选 12 条，入选 1 条", createdAt: "08:21" },
  { id: "job-3", status: "warning", name: "美术知识抓取", detail: "1 个来源正文不可提取，已降级为摘要 + 链接", createdAt: "08:24" },
  { id: "job-4", status: "success", name: "今日内容发布", detail: "今日学习包已发布，等待 09:00 提醒", createdAt: "08:30" }
];

export const aiCostLogs: AiCostLog[] = [
  { id: "cost-1", task: "PMP 题生成", model: "low-cost", inputTokens: 1800, outputTokens: 1450, estimatedCny: 0.08 },
  { id: "cost-2", task: "内容摘要", model: "low-cost", inputTokens: 6400, outputTokens: 1200, estimatedCny: 0.16 },
  { id: "cost-3", task: "标签与应用场景", model: "low-cost", inputTokens: 2200, outputTokens: 680, estimatedCny: 0.05 }
];
