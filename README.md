# PDF 翻译服务

这是一个基于千问 MT 的 PDF 论文翻译服务，可以保留原文格式进行翻译。

## 功能特点

- 📄 支持 PDF 文档翻译
- 🎨 保留原文格式、公式、图表
- 🌐 基于千问 MT 翻译引擎
- 💻 提供网页界面，使用简单
- 🔧 支持 Windows 系统

## 使用步骤

### 第一次使用（配置）

1. **确保已安装 Python**
   - 需要 Python 3.8 或更高版本
   - 下载地址：https://www.python.org/downloads/

2. **获取千问 API Key**
   - 访问：https://dashscope.aliyun.com/
   - 注册并获取 API Key

3. **运行配置程序**
   - 双击 `setup.bat`
   - 按提示输入 API Key
   - 输入端口号（直接回车使用默认 7862）

### 启动服务

1. **双击 `start.bat`**
   - 程序会自动安装依赖
   - 启动后会显示访问地址

2. **打开浏览器**
   - 访问：http://localhost:7862
   - 上传 PDF 文件进行翻译

### 让别人也能访问

如果你想让同一网络（WiFi）下的其他人也能访问：

1. 查看你的电脑 IP 地址
   - 按 Win+R，输入 `cmd`
   - 输入 `ipconfig`
   - 找到 IPv4 地址（例如：192.168.1.100）

2. 告诉别人访问地址
   - 例如：http://192.168.1.100:7862

## 文件说明

```
TransPaper/
├── start.bat              # Windows 启动文件（双击运行）
├── setup.bat              # 首次配置程序
├── start_server.py        # Python 启动脚本
├── config/
│   ├── config.json        # 配置文件（自动生成）
│   └── config.example.json # 配置示例
├── logs/                  # 日志文件夹
└── README.md              # 说明文档
```

## 常见问题

### 1. 提示找不到 Python
- 请先安装 Python 3.8 或更高版本
- 安装时记得勾选 "Add Python to PATH"

### 2. 启动后无法访问
- 检查防火墙是否阻止了端口
- 确认端口号没有被其他程序占用

### 3. 翻译失败
- 检查 API Key 是否正确
- 确认网络连接正常
- 查看 logs 文件夹中的日志

### 4. 如何修改配置
- 编辑 `config/config.json` 文件
- 或重新运行 `setup.bat`

## 技术支持

基于开源项目：https://github.com/PDFMathTranslate-next/PDFMathTranslate-next

## 许可证

本项目遵循 AGPL v3 许可证
