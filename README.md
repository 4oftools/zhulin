# Zhulin (竹林) Project

## 简介 (Overview)
Zhulin 是一个基于 "竹林工作法" 的全栈应用，旨在通过结构化的目标管理和执行追踪来提升工作效率。项目包含 Spring Boot 后端和 Angular 前端。

## 项目结构 (Project Structure)
- `backend/`: 后端服务，基于 Spring Boot 3.2 + Java 21。
- `frontend/`: 前端应用，基于 Angular 19 + Node.js 20。
- `docker-deploy/`: Docker 部署配置，包含 `docker-compose.yml`。

## 快速开始 (Quick Start) - Docker 部署

使用 Docker Compose 可以快速启动整个应用栈（前端、后端、数据库）。

### 前置要求
- Docker Desktop 或 Docker Engine
- Docker Compose

### 启动步骤
1. 进入部署目录：
   ```bash
   cd docker-deploy
   ```

2. 构建并启动服务：
   ```bash
   docker-compose up -d --build
   ```

3. 访问应用：
   - **前端页面**: http://localhost
   - **后端 API**: http://localhost:8080
   - **数据库**: localhost:3306 (用户: `root`, 密码: `root`, 数据库: `zhulin`)

## 本地开发 (Local Development)

### 后端 (Backend)
1. 确保安装 JDK 21。
2. 进入 `backend` 目录。
3. 启动应用：
   ```bash
   # Windows
   mvnw spring-boot:run
   
   # Linux/Mac
   ./mvnw spring-boot:run
   ```
   后端服务默认运行在端口 `8080`。

### 前端 (Frontend)
1. 确保安装 Node.js 20+ 和 npm。
2. 进入 `frontend` 目录。
3. 安装依赖：
   ```bash
   npm install
   ```
4. 启动开发服务器：
   ```bash
   npm start
   # 或者
   ng serve
   ```
   前端开发服务默认运行在 `http://localhost:4200`。

## 注意事项
- 默认数据库配置为 MySQL。
- 首次启动时，后端会自动更新数据库 Schema (`ddl-auto: update`)。
