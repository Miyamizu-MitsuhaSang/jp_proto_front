# 录音、回放并提交到 /test/analyze

Base URL: `http://127.0.0.1:8000`

所有接口均返回 JSON。

## POST /test/upload

更新已有记录的读者信息。`record_id` 对应的记录必须存在。

请求体（JSON）：

```json
{
  "record_id": "string",
  "name": "string",
  "gender": "male|female",
  "school_level": "string",
  "grade": "一年生|二年生|三年生|四年生",
  "learning_age": 0
}
```

响应：

- 200: `{"massage":"ok"}`
- 400: `{"detail":"Record session does not exist"}` 或校验错误

示例：

```bash
curl -X POST "http://127.0.0.1:8000/test/upload" \
  -H "Content-Type: application/json" \
  -d '{"record_id":"...","name":"...","gender":"male","school_level":"...","grade":"一年生","learning_age":1}'
```

## POST /test/analyze

上传音频并进行发音评测。

请求（multipart/form-data）：

- `audio`（file，必填）
- `ref_text`（string，必填）
- `core`（string，可选，默认：`word`）

音频规范化规则：

- 若上传音频为 mp3 且采样率为 8kHz/16kHz 且单声道，则直接使用。
- 不满足上述条件时，会使用 ffmpeg 转码为 mp3 16kHz 单声道。

响应：

```json
{
  "ok": true,
  "lang": "jp",
  "core": "word",
  "ref_text": "string",
  "result_score": { "result": "..." },
  "record_id": "string"
}
```

`result_score` 结构说明（来自 `samples/feedback.json` 示例，字段可能随评测版本变化）：

- `overall`：整体评分（0-100）
- `pronunciation`：发音评分（0-100）
- `rhythm`：节奏评分（0-100）
- `tone`：声调评分（0-100）
- `speed`：语速（示例为 237）
- `duration`：时长（字符串，秒）
- `numeric_duration`：时长（数字，秒）
- `rear_tone`：句尾语调类型（示例：`fall`）
- `resource_version`、`kernel_version`：资源/内核版本号
- `words`：按词/字的详细评分数组
  - `word`：词/字文本
  - `scores`：词/字级评分
    - `overall`：总体评分
    - `pronunciation`：发音评分
    - `prominence`：重音/突出度（示例 0/1）
  - `charType`：字符类型（示例为 0）
  - `tone_stats`：声调信息
    - `ref_tone`：参考声调标记（示例：`◎`、`①`）
    - `tone_score`：声调得分
  - `phonemes`：音素级评分数组
    - `phoneme`：音素文本
    - `pronunciation`：音素发音评分
    - `tone`：音素声调标记（示例 0/1）
    - `span.start` / `span.end`：音素在音频中的时间范围（单位见示例，通常为毫秒）
  - `word_parts`：词内部字符切分
    - `part`：字符片段
    - `beginIndex` / `endIndex`：在原文中的索引
    - `charType`：字符类型
  - `span.start` / `span.end`：该词/字在音频中的时间范围

错误：

- 400：`ref_text` 为空、音频为空、音频检测/转换失败、参数校验失败
- 502：讯飞评测失败

示例：

```bash
curl -X POST "http://127.0.0.1:8000/test/analyze" \
  -F "audio=@/path/to/audio.mp3" \
  -F "ref_text=こんにちは" \
  -F "core=word"
```

## POST /test/debug_multipart

用于排查 multipart/form-data 提交问题，返回解析后的表单信息。

请求：任意 multipart/form-data。

响应：

```json
{
  "content_type": "multipart/form-data; boundary=...",
  "form_keys": ["audio", "ref_text"],
  "audio_is_present": true,
  "audio_type": "<class 'starlette.datastructures.UploadFile'>"
}
```

## GET /test/random_sentence

随机返回一条朗读文本。

响应：

```json
{
  "ok": true,
  "id": 1,
  "text": "string"
}
```

错误：

- 404：未找到对应句子

示例：

```bash
curl -X GET "http://127.0.0.1:8000/test/random_sentence"
```

## GET /redis_test/ping-redis

测试 Redis 连接并返回连接参数。

响应：

```json
{
  "pong": true,
  "redis": {
    "host": "127.0.0.1",
    "port": 6379
  }
}
```

## POST /admin/login

管理员登录，成功后在响应中写入 Cookie。

请求体（JSON）：

```json
{
  "password": "string"
}
```

响应：

- 200: `{"ok": true}` 并写入 `admin_session` Cookie
- 403: `{"detail":"Incorrect password"}`
- 500: `{"detail":"Server not configured"}`

注意：

- 需要设置环境变量 `ADMIN_PASSWORD_HASH` 与 `ADMIN_SESSION_SECRET`。
- Cookie 使用 `secure=true`，本地非 https 环境可能无法收到 Cookie。

## POST /admin/ping

校验管理员会话，需携带 `admin_session` Cookie。

响应：

```json
{
  "admin": true
}
```

错误：

- 401：未登录或会话无效

## GET /admin/allRecord（未实现）

当前代码中未实现（`pass`）。
