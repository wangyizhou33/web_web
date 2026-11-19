# Infiforce Omni Cerebellum

展示 Infiforce 团队的全身控制（whole-body control，WBC）工作。访客通过纵向滚动浏览各章节，顶部导航可以直接跳转并高亮当前章节。正文以中文为主，章节标题和专有名称使用英文。[页面结构参考 SuperMimic](https://supermimic.github.io/)

## 视觉设计

- **配色**。页面背景使用白色（`#fff`）和浅灰（`#fafafa`、`#f5f5f5`），用细灰线区分导航、章节和媒体区域。标题和品牌标识用近黑色（`#191919`），正文和说明用深灰色（`#575757`）。嵌入式 Demo 采用浅灰场景和灰阶控件。
- **字体**。英文标题、导航和数字使用本地托管的 Manrope。中文使用系统中文无衬线字体，正文行距约为字号的 1.8 至 1.9 倍。技术标注和视频时间使用等宽字体。
- **首屏**。标题分两行显示，Cerebellum 使用深灰色。桌面端左侧放标题、摘要和「探索演示」「了解架构」两个入口，右侧放灰阶 H2 模型，配浅灰网格和环线。手机端先显示标题和入口，再显示模型。首屏较初版缩短约三分之一，1440 px 宽时约为 492 px。
- **章节布局**。桌面端将导言正文与架构图并排，并让演示、视频和辨识图占据较宽的展示区域。窄屏下正文与媒体改为纵向排列，视频对照仍保持横向轨道。

## 1 Introduction

人形机器人跳舞、翻跟斗、打拳的视频，这两年已经很常见。看多了，很多人会有一个印象：机器人的“小脑”已经解决了，剩下的只看“大脑”够不够聪明。

这个印象只对了一半。表演用的小脑确实已经很成熟；可是要让机器人去干活，大脑需要的是另一样东西。行业里把它叫作 WBC（whole-body control，全身控制）。

先交代两个词。本文说的大脑，是理解任务、决定做什么，并且每一刻给出动作目标的模型，比如 VLA（视觉-语言-动作模型：看画面、听指令，直接输出动作）。WBC 是机器人干活时，把大脑这一刻给出的动作目标，实时变成全身每个关节怎么动的那一层。

架构图使用 `assets/arch.png`，点击可在新标签页查看原图。

## 2 Demo 1 · Motion Tracking

嵌入 `demo1/index.html`，也提供独立打开的入口。将连续的人体动作映射到机器人本体，展示 WBC 如何跟踪大脑给出的动作目标。Robot 和 SMPL 人体图层默认开启，URR 目标部位图层默认关闭，可以通过按钮开启。用户可拖动场景旋转视角，通过时间轴查看指定帧。

## 3 Demo 2 · Single-Frame Control

嵌入 `demo2/index.html`，也提供独立打开的入口。选择一个 SMPL 人体姿态，观察 H2 从起始姿态过渡到目标姿态并保持。可以分别切换 Robot、Goal 和 SMPL 人体图层。

## 4 Data · Motion Retargeting

源素材为 `assets/retarget66_human_4k.mp4` 和 `assets/retarget66_robot_4k.mp4`，网页播放 `assets/web/human.mp4` 和 `assets/web/robot.mp4`。视频里渲染了 66 个动作，覆盖 18 个类别，人体与机器人的动作顺序一一对应。

两个视频在同一条横向轨道上。下方的 Human 和 Robot 按钮选择播放项，选中的视频滑到中央并显示进度，未选中的视频暂停并在侧边露出一部分。切换时沿用同一个播放时间点，方便对照。控件采用胶囊形选项和独立的播放与暂停按钮。[控件参考图](assets/web_component.png)

## 5 Model Training · Parallel Simulation

源素材为 `assets/train_envs.mp4`，网页播放 `assets/web/training.mp4`。视频进入视口后静音循环播放，以无控件的形式展示并行仿真环境。

训练使用 59,029 个动作片段，平均每段 12.4 s，合计约 203 h 动作。模型在 4 张 H20 卡上，以约 16,000 个并行仿真环境训练约 18 小时。

## Details

### 5.1 AGV Constraints

源素材为 `assets/type1_rleg.mp4` 和 `assets/type2_rleg.mp4`，网页播放 `assets/web/type1.mp4` 和 `assets/web/type2.mp4`。沿用 Data 的横向视频对照，使用 Type 1 和 Type 2 按钮选择居中播放的视频。未选中的视频暂停。

算法可以配置不同的底盘类型。对于欠驱动的轮式本体，WBC policy 会通过强化学习学到如何使用可用的自由度。

### 5.2 System Identification

为了训练闭环稳定的 WBC，对 H2 做了 system identification。使用 `assets/systenid.png` 展示关节阶跃响应在标定前后的对比，点击可查看原图。

## GitHub Pages 部署

- 目标仓库为 `wbc_web`，发布分支为 `main`。在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。[GitHub Pages 设置文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)
- [部署工作流](.github/workflows/deploy-pages.yml)在推送到 `main` 时自动运行，也可在 Actions 中从 `main` 手动运行。工作流打包静态页面、两个 Demo、字体、图表和网页播放版媒体。
- 页面资源使用相对路径，适用于 `/wbc_web/` 路径。使用默认域名时，发布地址为 `https://<owner>.github.io/wbc_web/`。实际地址可在对应的工作流运行记录中查看。
