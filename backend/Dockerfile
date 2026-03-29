# syntax=docker/dockerfile:1
# 多阶段构建：Maven 打包 → JRE 运行（与 pom.xml 中 Java 21 一致）

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# 依赖层缓存：仅 pom 变更时才重新拉依赖
COPY pom.xml .
RUN mvn -B -e dependency:go-offline -DskipTests

COPY src ./src
# 离线打包：避免第二次解析 central（Docker 内易出现 repo.maven.apache.org DNS 间歇失败）
RUN mvn -B -e clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN groupadd --system zhulin && useradd --system --gid zhulin --no-create-home zhulin

COPY --from=build --chown=zhulin:zhulin /app/target/*.jar app.jar

USER zhulin
EXPOSE 8080

# 容器内合理占用堆内存（可按主机内存调整）
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseContainerSupport"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
