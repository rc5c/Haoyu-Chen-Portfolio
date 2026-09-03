# 前端内容维护

Editor 页面、入口、样式及本地保存 API 已移除。开发版和生产版均没有内容编辑后台；站点不需要数据库或内容服务。

后续修改直接在前端完成：

- `src/content/gallery.json`：5 个图片项目，`images` 保存每个项目的作品列表。
- `src/content/sound.json`：5 个音频项目，`audioUrl` 指向浏览器兼容音频。
- `src/content/video.json`：视频项目和 YouTube 链接。
- `src/content/website.json`：网站项目与完整网站文件夹路径。
- `src/content/communication.json`：介绍与联系方式。
- `src/App.jsx` 与 `src/styles.css`：展示组件与样式。

`status: "published"` 的项目对外显示，`draft` 不显示；`displayOrder` 控制排列顺序。保留空白字段，不虚构缺失信息。开发服务器会重新加载更改的前端内容；线上更改需要重新构建和发布。

素材位于 `public/media/`。Website 项目位于 `public/projects/`，其 HTML、图片、视频和其他依赖必须保持在同一个项目目录中。

站点现在由 GitHub Pages 托管。构建生成 `dist/` 和各个详情页的静态入口，不再使用 `worker/` 或 `.openai/`。本地资源保留根相对源路径，前端统一添加仓库子路径；不要在 JSON 中重复添加 `/Haoyu-Chen-Portfolio/`。

旧 Editor 的源码保留在 Git 历史中，可恢复；现有内容 JSON 和原始素材包未删除。
