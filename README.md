# 竹林（Zhulin）

**[English](README.en.md)** · 默认语言：中文

## 简介

竹林是基于「竹林工作法」的全栈应用：用竹林、竹田、竹子等层级组织长期目标与短期执行，并配合战术侧的时间块（竹节）、冲刺与回顾。仓库包含 **Spring Boot** 后端与 **Angular** 前端，支持 Docker 一键部署与本地开发。

## 功能概览

- **战略**：竹林 / 竹田 / 竹子、目标、关键产出、学习记录、计划与回顾等。
- **战术**：活动列表、竹内待办、竹节（计划 / 冲刺 / 休息 / 打断 / 每日回顾等）。

更细的产品说明与前端目录结构见 **[frontend/README.md](frontend/README.md)**。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Spring Boot 3.2、Java 21、Spring Data JPA |
| 前端 | Angular 19、TypeScript |
| 数据 | MySQL（默认）或 PostgreSQL，见后端配置说明 |
| 部署 | `docker-deploy` 下 Docker Compose |

## 仓库结构

```
zhulin/
├── backend/        # 后端 API（详见 backend/README.md）
├── frontend/       # 单页应用（详见 frontend/README.md）
├── docker-deploy/  # Compose、.env 示例与 [部署说明](docker-deploy/README.md)
└── README.en.md    # 英文版说明
```

## 快速开始：Docker

1. 安装 **Docker** 与 **Docker Compose**（V2 命令为 `docker compose`）。
2. 进入部署目录并启动：

   ```bash
   cd docker-deploy
   docker compose up -d --build
   ```

3. 访问：
   - 前端（Nginx 反代 `/api`）：`http://localhost`
   - 后端 API（直连）：`http://localhost:8080`
   - MySQL（容器内）：**默认不映射到宿主机**，避免与本机 MySQL 抢端口；后端在 Compose 网络内访问 `db:3306`。详见 **[docker-deploy/README.md](docker-deploy/README.md)**。

可选：将 `docker-deploy/.env.example` 复制为 `.env` 以修改端口、数据库密码、`ZHULIN_DEMO_DATA` 等。更多说明见 **[docker-deploy/README.md](docker-deploy/README.md)**。

## 本地开发

### 后端

1. 安装 **JDK 21**（与 `backend/pom.xml` 中 `java.version` 一致）。
2. 创建数据库 `zhulin`，并按需配置 `application-mysql.yml` / `application-postgresql.yml`。
3. 在 `backend` 目录执行：

   ```bash
   # Windows
   mvnw.cmd spring-boot:run

   # Linux / macOS
   ./mvnw spring-boot:run
   ```

   默认端口 **8080**。数据库切换方式见 **[backend/README.md](backend/README.md)**。

### 前端

1. 安装 **Node.js 20+** 与 npm。
2. 在 `frontend` 目录：

   ```bash
   npm install
   npm start
   ```

   开发服务器默认 **http://localhost:4200**（若代理后端 API，请按项目环境配置）。

## 注意事项

- 默认使用 MySQL；首次启动时 Hibernate 可能根据配置自动更新表结构（如 `ddl-auto: update`），生产环境请改为受控迁移策略。
- 演示数据等行为由后端配置项控制（如 `zhulin.demo-data`），详见 `application.yml`。

## 更多文档

- [backend/README.md](backend/README.md) — 后端环境、数据库切换、部分 REST 说明  
- [frontend/README.md](frontend/README.md) — 前端功能、目录结构、构建与本地存储说明  
