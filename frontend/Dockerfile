# syntax=docker/dockerfile:1
# 多阶段：Node 构建 Angular → Nginx 托管静态资源并反向代理 /api

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# 与 angular.json 中 outputPath 一致
COPY --from=build /app/dist/zhulin-work-method /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
