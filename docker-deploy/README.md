# Docker 部署说明

## 前置条件

- [Docker](https://docs.docker.com/get-docker/) 与 [Docker Compose](https://docs.docker.com/compose/)（Docker Desktop 已包含）

## 快速启动

在 **`docker-deploy`** 目录下执行：

```bash
docker compose up -d --build
```

首次构建会下载镜像并编译前后端，可能需要几分钟。

### 可选：环境变量

```bash
cp .env.example .env
# 编辑 .env 修改数据库密码、端口、是否加载演示数据等
docker compose up -d --build
```

未创建 `.env` 时，Compose 使用 `docker-compose.yml` 中的默认值（与示例一致）。

## 访问地址

| 服务 | 地址（默认） |
|------|----------------|
| 前端（经 Nginx，`/api` 反代到后端） | http://localhost |
| 后端 API（直连） | http://localhost:8080 |
| MySQL | **不暴露到宿主机**；仅在 Compose 网络内由 `backend` 通过 `db:3306` 连接。库名见 `MYSQL_DATABASE`。若需从本机连容器库，可临时在 `docker-compose.yml` 的 `db` 下增加 `ports` 或 `docker exec -it zhulin-db mysql -uroot -p` |

生产环境请将 **`ZHULIN_DEMO_DATA`** 设为 `false`，并改用受控的数据库迁移策略（勿长期依赖 `ddl-auto: update`）。

## 常用命令

```bash
# 查看日志
docker compose logs -f

# 停止并删除容器（保留数据卷）
docker compose down

# 停止并删除容器与 MySQL 数据卷
docker compose down -v
```

## 文件说明

| 文件 | 说明 |
|------|------|
| `docker-compose.yml` | 服务编排：MySQL、`backend`（`../backend/Dockerfile`）、`frontend`（`../frontend/Dockerfile`） |
| `.env.example` | 环境变量模板 |
| `../backend/Dockerfile` | Maven 多阶段构建 → JRE 运行 |
| `../frontend/Dockerfile` | Node 构建 → Nginx 静态站点 + `nginx.conf` 反代 `/api` |

## 故障排查

- **后端镜像构建失败：`repo.maven.apache.org: Temporary failure in name resolution`**：多为 Docker 构建环境 DNS 不稳定。`backend/Dockerfile` 在 `dependency:go-offline` 之后使用 **`mvn package -o`（离线）**，避免第二次访问 Maven Central。若仍失败，请检查本机/ Docker Desktop 的 DNS（例如改为 `8.8.8.8`），或暂时关闭 VPN 后重试；若出现离线模式缺依赖报错，再执行一次完整 `docker compose build --no-cache backend`。
- **MySQL 一直 unhealthy**：首次初始化较慢，已设置 `start_period: 40s`；若密码含特殊字符，请检查 `.env` 与 `healthcheck` 中解析是否一致。
- **前端 502 / API 不通**：确认 `frontend` 与 `backend` 在同一 Compose 网络，且后端日志无启动异常；浏览器应访问 **80 端口**（同源 `/api`），勿混用仅指向 8080 的前端构建。
- **演示数据重复**：`ZHULIN_DEMO_DATA=true` 仅在空库等条件下由应用逻辑决定是否写入，详见后端 `DemoDataLoader`。

---

**English:** Same flow — run `docker compose up -d --build` from this folder; copy `.env.example` to `.env` for overrides. See repository root [README.en.md](../README.en.md).
