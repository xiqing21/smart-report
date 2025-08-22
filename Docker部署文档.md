# Apache Doris & Hive Docker 部署文档

## 概述
本文档提供Apache Doris单机版和Apache Hive（使用PostgreSQL后端）的Docker部署指南。

## 1. Apache Doris 单机版部署

### 1.1 环境准备
- Docker 20.10+
- 至少4GB可用内存
- 至少20GB可用磁盘空间

### 1.2 获取源码
```bash
# 克隆Doris源码
git clone https://github.com/apache/doris.git
cd doris
git submodule update --init --recursive
```

### 1.3 构建Docker镜像

#### 方法一：使用预构建Dockerfile
```bash
# 构建基础镜像
docker build -f docker/runtime/Dockerfile -t apache-doris:build .

# 构建FE镜像
docker build -f docker/runtime/fe/Dockerfile -t apache-doris:fe-ubuntu .

# 构建BE镜像
docker build -f docker/runtime/be/Dockerfile -t apache-doris:be-ubuntu .
```

#### 方法二：分组件构建
```bash
# 构建FE
docker build -t doris-fe:latest -f fe/Dockerfile .

# 构建BE
docker build -t doris-be:latest -f be/Dockerfile .
```

### 1.4 运行Doris容器

#### 启动FE（Frontend）
```bash
docker run -d \
  --name doris-fe \
  -p 8030:8030 \
  -p 9010:9010 \
  -v /path/to/fe-data:/opt/apache-doris/fe/doris-meta \
  -v /path/to/fe-logs:/opt/apache-doris/fe/log \
  apache-doris:fe-ubuntu
```

#### 启动BE（Backend）
```bash
docker run -d \
  --name doris-be \
  -p 8040:8040 \
  -p 9060:9060 \
  -p 8060:8060 \
  -v /path/to/be-data:/opt/apache-doris/be/storage \
  -v /path/to/be-logs:/opt/apache-doris/be/log \
  --link doris-fe:fe \
  apache-doris:be-ubuntu
```

### 1.5 验证部署
```bash
# 检查FE状态
curl http://localhost:8030/api/show_proc?path=/frontends

# 检查BE状态
curl http://localhost:8030/api/show_proc?path=/backends
```

### 1.6 Doris部署注意事项
- **内存配置**：确保容器有足够内存，建议FE至少2GB，BE至少4GB
- **数据持久化**：务必挂载数据目录到宿主机，避免数据丢失
- **网络配置**：FE和BE需要能够相互通信，使用--link或自定义网络
- **端口映射**：确保端口不冲突，FE默认8030(HTTP)、9010(RPC)，BE默认8040(HTTP)、9060(RPC)、8060(数据传输)
- **时间同步**：容器时间需要与宿主机同步
- **文件描述符**：可能需要调整ulimit设置

## 2. Apache Hive with PostgreSQL 部署

### 2.1 创建Docker Compose文件
创建 `hive-compose.yml`：

```yaml
version: '3.8'

services:
  # PostgreSQL数据库服务
  postgres:
    image: postgres:13
    container_name: hive-postgres
    environment:
      POSTGRES_DB: hive_metastore
      POSTGRES_USER: hive
      POSTGRES_PASSWORD: hive123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - hive-network

  # Hive Metastore服务
  hive-metastore:
    image: apache/hive:3.1.3
    container_name: hive-metastore
    environment:
      SERVICE_NAME: metastore
      DB_DRIVER: postgres
      SERVICE_OPTS: "-Djavax.jdo.option.ConnectionDriverName=org.postgresql.Driver -Djavax.jdo.option.ConnectionURL=jdbc:postgresql://postgres:5432/hive_metastore -Djavax.jdo.option.ConnectionUserName=hive -Djavax.jdo.option.ConnectionPassword=hive123"
    depends_on:
      - postgres
    ports:
      - "9083:9083"
    volumes:
      - hive_warehouse:/opt/hive/data/warehouse
    networks:
      - hive-network
    command: >
      bash -c "sleep 30 && 
               /opt/hive/bin/schematool -dbType postgres -initSchema && 
               /opt/hive/bin/hive --service metastore"

  # HiveServer2服务
  hiveserver2:
    image: apache/hive:3.1.3
    container_name: hiveserver2
    environment:
      SERVICE_NAME: hiveserver2
      SERVICE_OPTS: "-Dhive.metastore.uris=thrift://hive-metastore:9083"
      IS_RESUME: "true"
    depends_on:
      - hive-metastore
    ports:
      - "10000:10000"
      - "10002:10002"
    volumes:
      - hive_warehouse:/opt/hive/data/warehouse
    networks:
      - hive-network
    command: >
      bash -c "sleep 60 && /opt/hive/bin/hive --service hiveserver2"

volumes:
  postgres_data:
  hive_warehouse:

networks:
  hive-network:
    driver: bridge
```

### 2.2 启动服务
```bash
# 启动所有服务
docker-compose -f hive-compose.yml up -d

# 查看服务状态
docker-compose -f hive-compose.yml ps

# 查看日志
docker-compose -f hive-compose.yml logs -f
```

### 2.3 连接测试
```bash
# 使用Beeline连接HiveServer2
docker exec -it hiveserver2 beeline -u jdbc:hive2://localhost:10000

# 或者从宿主机连接
beeline -u jdbc:hive2://localhost:10000
```

### 2.4 基本操作测试
```sql
-- 创建数据库
CREATE DATABASE test_db;

-- 使用数据库
USE test_db;

-- 创建表
CREATE TABLE test_table (
  id INT,
  name STRING,
  age INT
) STORED AS TEXTFILE;

-- 插入数据
INSERT INTO test_table VALUES (1, 'Alice', 25), (2, 'Bob', 30);

-- 查询数据
SELECT * FROM test_table;
```

### 2.5 Hive部署注意事项
- **启动顺序**：必须先启动PostgreSQL，再启动Metastore，最后启动HiveServer2
- **Schema初始化**：首次启动时需要初始化Metastore schema
- **数据持久化**：PostgreSQL数据和Hive warehouse都需要持久化存储
- **网络配置**：所有服务需要在同一网络中，确保服务间可以通信
- **端口配置**：
  - PostgreSQL: 5432
  - Metastore: 9083
  - HiveServer2: 10000 (JDBC), 10002 (Web UI)
- **内存配置**：根据数据量调整JVM堆内存大小
- **连接池**：生产环境建议配置数据库连接池

## 3. 运维管理

### 3.1 停止服务
```bash
# 停止Doris
docker stop doris-fe doris-be

# 停止Hive
docker-compose -f hive-compose.yml down
```

### 3.2 数据备份
```bash
# 备份Doris数据
docker exec doris-fe tar -czf /tmp/fe-backup.tar.gz /opt/apache-doris/fe/doris-meta
docker cp doris-fe:/tmp/fe-backup.tar.gz ./

# 备份PostgreSQL数据
docker exec hive-postgres pg_dump -U hive hive_metastore > hive_metastore_backup.sql
```

### 3.3 监控检查
```bash
# 检查容器状态
docker ps

# 查看资源使用
docker stats

# 查看日志
docker logs doris-fe
docker logs hiveserver2
```

## 4. 故障排除

### 4.1 常见问题
1. **容器启动失败**：检查端口占用、内存不足、权限问题
2. **服务连接失败**：检查网络配置、防火墙设置
3. **数据丢失**：确认数据卷挂载正确
4. **性能问题**：调整JVM参数、增加资源配置

### 4.2 日志位置
- Doris FE: `/opt/apache-doris/fe/log/`
- Doris BE: `/opt/apache-doris/be/log/`
- Hive: `/opt/hive/logs/`
- PostgreSQL: `/var/log/postgresql/`

---

**部署完成后，Doris Web UI访问地址：http://localhost:8030**
**HiveServer2 JDBC连接：jdbc:hive2://localhost:10000**