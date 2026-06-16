from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "MiniPM_PRD.pdf"


def font_path(name: str) -> str:
    candidates = [
        Path("C:/Windows/Fonts") / name,
        Path("C:/Windows/Fonts") / name.lower(),
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    raise FileNotFoundError(name)


def register_fonts() -> tuple[str, str]:
    regular = "MiniPMChinese"
    bold = "MiniPMChineseBold"
    pdfmetrics.registerFont(TTFont(regular, font_path("Deng.ttf")))
    pdfmetrics.registerFont(TTFont(bold, font_path("Dengb.ttf")))
    return regular, bold


def make_styles(font: str, bold: str):
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            "PrdTitle",
            parent=styles["Title"],
            fontName=bold,
            fontSize=22,
            leading=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#119D53"),
            spaceAfter=18,
        )
    )
    styles.add(
        ParagraphStyle(
            "PrdSubtitle",
            parent=styles["Normal"],
            fontName=font,
            fontSize=10.5,
            leading=17,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#4B5563"),
            spaceAfter=20,
        )
    )
    styles.add(
        ParagraphStyle(
            "H1",
            parent=styles["Heading1"],
            fontName=bold,
            fontSize=15,
            leading=22,
            textColor=colors.HexColor("#0F7A42"),
            spaceBefore=14,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            "BodyCN",
            parent=styles["BodyText"],
            fontName=font,
            fontSize=9.6,
            leading=16,
            alignment=TA_LEFT,
            textColor=colors.HexColor("#202124"),
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            "BulletCN",
            parent=styles["BodyCN"],
            leftIndent=10,
            firstLineIndent=0,
        )
    )
    styles.add(
        ParagraphStyle(
            "SmallCN",
            parent=styles["BodyCN"],
            fontSize=8.5,
            leading=13,
        )
    )
    styles.add(
        ParagraphStyle(
            "TableHeadCN",
            parent=styles["SmallCN"],
            fontName=bold,
            textColor=colors.white,
            alignment=TA_CENTER,
        )
    )
    return styles


def p(text: str, styles):
    return Paragraph(text, styles["BodyCN"])


def h(text: str, styles):
    return Paragraph(text, styles["H1"])


def bullets(items: list[str], styles):
    return ListFlowable(
        [ListItem(Paragraph(item, styles["BodyCN"]), leftIndent=12) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=14,
        bulletFontName=styles["BodyCN"].fontName,
        bulletFontSize=7,
    )


def table(rows: list[list[str]], widths: list[float], styles):
    data = []
    for i, row in enumerate(rows):
        style = styles["TableHeadCN"] if i == 0 else styles["SmallCN"]
        data.append([Paragraph(cell, style) for cell in row])
    t = Table(data, colWidths=widths, hAlign="LEFT", repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#14A85B")),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D6E8DD")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7FCF9")]),
            ]
        )
    )
    return t


def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont("MiniPMChinese", 8)
    canvas.setFillColor(colors.HexColor("#6B7280"))
    canvas.drawRightString(A4[0] - 1.6 * cm, 1.1 * cm, f"MiniPM PRD · {doc.page}")
    canvas.restoreState()


def build():
    font, bold = register_fonts()
    styles = make_styles(font, bold)
    OUT.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=1.65 * cm,
        rightMargin=1.65 * cm,
        topMargin=1.45 * cm,
        bottomMargin=1.55 * cm,
        title="MiniPM PRD",
        author="MiniPM",
    )

    story = [
        Paragraph("MiniPM PRD：美术 PM 每日学习助手", styles["PrdTitle"]),
        Paragraph("网页后台 + 手机端 PWA · 个人自用 MVP · 自动内容生成 · 轻松学习小岛风格", styles["PrdSubtitle"]),
        h("1. 产品概述", styles),
        p("MiniPM 是一款面向游戏公司美术 PM 的每日学习与职业成长助手。产品通过每天短时学习、AI 总结、PMP 练习、工作场景化理解、收藏与复习，帮助美术 PM 在日常碎片时间里持续提升项目管理、游戏美术管线、AI 前沿和工具应用能力。", styles),
        p("第一版产品形态为“网页后台 + 手机端网页/PWA”，面向个人自用，支持邮箱登录、云端数据存储和手机端安装到桌面。", styles),
        bullets(
            [
                "学习内容 -> AI 总结 -> 工作应用 -> 收藏复盘 -> 职业成长闭环",
                "每天约 10 分钟，降低学习压力",
                "用轻松闯关式体验承载偏专业的学习内容",
            ],
            styles,
        ),
        h("2. MVP 范围", styles),
        p("第一版聚焦每日学习闭环，不做复杂内容运营平台。", styles),
        table(
            [
                ["包含", "不包含"],
                ["手机端 PWA、网页后台、邮箱登录、云端数据、每日自动发布、PMP 5 题、美术知识、AI 前沿、GitHub 项目、AI 工具、打卡统计、错题复习、提醒、后台日志与成本", "行业案例拆解、原生 App、离线阅读、自定义标签、收藏备注、数据源配置后台、人工审核发布、个性化推荐算法"],
            ],
            [8.4 * cm, 8.4 * cm],
            styles,
        ),
        h("3. 每日内容结构", styles),
        table(
            [
                ["类型", "数量", "说明"],
                ["PMP 练习题", "5 道", "单选 + 多选，AI 生成，标注“非官方 PMP 真题，仅作练习”"],
                ["游戏美术知识", "1 条", "公开网页内容 + AI 摘要 + 原文链接"],
                ["AI 前沿", "1 条", "AI 新闻、论文、模型、工作流或工具趋势"],
                ["GitHub 项目", "1 条", "开源项目简介、应用价值、原始链接"],
                ["AI 工具", "1 条", "工具介绍、适用场景、预计上手成本"],
            ],
            [4.0 * cm, 2.0 * cm, 10.8 * cm],
            styles,
        ),
        h("4. 自动内容生成工作流", styles),
        bullets(
            [
                "每天在 09:00 前由定时任务生成今日学习包。",
                "先生成 5 道 PMP 练习题，再抓取公开来源候选内容。",
                "候选内容经过去重、规则过滤、相关性筛选后，再调用低成本 AI 生成摘要、工作应用提示和标签。",
                "写入今日学习包后，09:00 触发第一次提醒；14:00 和 21:00 检查未打卡再提醒。",
                "不抓取公众号、付费内容、登录后内容，也不绕过网站限制。",
            ],
            styles,
        ),
        h("5. 手机端体验设计", styles),
        p("视觉方向为“轻松学习小岛”：高绿色能量感，搭配天空蓝、薄荷绿、柠檬黄、珊瑚粉；不使用大角色形象，主要通过小图标、路径、徽章、彩色卡片和奖励反馈营造趣味，避免工作台和考试压力感。", styles),
        table(
            [
                ["页面", "功能"],
                ["今日小冒险", "今日学习路径、完成进度、连续打卡、继续学习"],
                ["PMP 挑战", "5 道题、单选/多选、即时判题、PM 小贴士"],
                ["阅读详情", "课程封面、Mini 总结、正文、原文链接、滑到底完成"],
                ["今日打卡", "完成反馈、成长能量 +1、连续打卡"],
                ["复习", "到期错题复习"],
                ["统计", "打卡天数、连续打卡"],
            ],
            [5.0 * cm, 11.8 * cm],
            styles,
        ),
        h("6. 后台管理", styles),
        p("后台用于个人运营和质量观察。第一版不提供内容源配置，但需要展示内置来源、抓取结果、失败原因和 AI token 成本。", styles),
        bullets(["后台总览", "今日内容", "自动发布状态", "抓取日志", "AI 成本", "用户学习状态", "错题和复习数据"], styles),
        h("7. 提醒与复习", styles),
        bullets(
            [
                "默认提醒时间：09:00 / 14:00 / 21:00，用户可修改。",
                "如果当天已完成打卡，则停止当天后续提醒。",
                "第一版优先实现站内提醒 + 邮件提醒。",
                "错题复习间隔：第 1 天、第 3 天、第 7 天、第 14 天；答对进入下一阶段，答错重置。",
            ],
            styles,
        ),
        PageBreak(),
        h("8. 技术方案", styles),
        table(
            [
                ["模块", "方案"],
                ["前端与后端", "Next.js + TypeScript"],
                ["样式", "Tailwind CSS"],
                ["PWA", "Web App Manifest + Service Worker"],
                ["登录与数据库", "Supabase Auth + Supabase Postgres"],
                ["部署", "Vercel Free"],
                ["定时任务", "GitHub Actions"],
                ["AI", "低成本模型，候选过滤、短输入、结构化输出、缓存"],
                ["提醒", "站内提醒 + 邮件提醒"],
            ],
            [5.0 * cm, 11.8 * cm],
            styles,
        ),
        p("MVP 预算目标控制在 20 元人民币/月以内。托管平台优先使用免费档，AI 生成采用候选过滤和缓存，避免全文批量送入模型。", styles),
        h("9. 成长路线", styles),
        bullets(
            [
                "PMP 基础线：项目管理判断力、风险识别、沟通与进度控制。",
                "美术管线线：角色、场景、动画、TA、外包、验收、资产规范。",
                "AI 工具线：图像生成、视频生成、参考整理、自动化工作流。",
                "GitHub 工具线：开源工具发现、工作流优化、技术辅助理解。",
            ],
            styles,
        ),
        h("10. 商业化预留", styles),
        p("第一版面向个人自用，但保留未来会员扩展空间，包括多用户账号结构、会员字段、内容生成成本统计、管理后台权限区分和可扩展数据表结构。", styles),
        h("11. 验收标准", styles),
        bullets(
            [
                "用户可以通过邮箱登录。",
                "手机端可以安装为 PWA。",
                "每天可以看到 5 道 PMP 题和 4 条阅读内容。",
                "PMP 题可以判题并进入错题复习。",
                "阅读滑到底可记录完成。",
                "完成所有任务后可以打卡。",
                "统计页显示打卡天数和连续打卡。",
                "后台可以看到今日内容、日志、抓取状态和 AI 成本。",
                "定时任务可以自动生成每日内容。",
                "默认提醒时间为 09:00 / 14:00 / 21:00。",
                "AI 题目明确标注“非官方 PMP 真题，仅作练习”。",
            ],
            styles,
        ),
    ]

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(OUT)


if __name__ == "__main__":
    build()
