# TransPaper

`TransPaper` 是一个给 Windows 用的论文翻译小服务。

它的作用很简单：
- 启动一个本地网页服务
- 上传 PDF
- 调用翻译能力
- 在浏览器里完成论文翻译

现在这个仓库还是整个大系统整合中的一部分，所以它已经接入了总台 `dashboard`。

## 项目出处

这个项目不是从零写的，来源关系如下：

1. 当前这个仓库，是为了你的系统整合而做的 Windows 包装版和 dashboard 接入版
2. 功能来源主要参考：
   - [PDFMathTranslate/PDFMathTranslate](https://github.com/PDFMathTranslate/PDFMathTranslate)
3. 更上游的源头项目是：
   - [funstory-ai/BabelDOC](https://github.com/funstory-ai/BabelDOC)

如果以后你再继续改这个项目，建议一直保留这段出处说明。

## 现在这个仓库做了什么

和原始上游相比，这个仓库当前更偏“可落地使用”：

- 补了 Windows 启动方式
- 补了本地配置文件方式
- 接入了 `dashboard`
- 增加了 `测试运行 / 真实运行 / 停止运行`

## 怎么用

### 第一步：先配置

第一次使用，先运行：

```bat
setup.bat
```

它会让你填写：
- API Key
- 端口

配置会保存到：

```text
config/config.json
```

### 第二步：直接启动

你可以直接双击：

```bat
start.bat
```

也可以运行：

```powershell
python start_server.py
```

### 第三步：打开网页

默认地址是：

[http://127.0.0.1:7862/](http://127.0.0.1:7862/)

## 在 dashboard 里怎么用

这个项目已经接入总台。

现在按钮的意思是：

- `测试运行`
  只检查配置有没有准备好
- `真实运行`
  真正启动翻译服务
- `停止当前运行`
  停掉这个服务

如果你还没先跑 `setup.bat`，总台会直接提示你先配置，不会假装成功。

## 目录说明

```text
TransPaper/
├─ config/                配置目录
├─ scripts/               dashboard 控制脚本
├─ start_server.py        Python 启动入口
├─ start.bat              Windows 直接启动
├─ setup.bat              第一次配置
├─ project.config.json    dashboard 项目门牌
└─ README.md              当前说明
```

## 注意

- `config/config.json` 不要上传公开
- API Key 不要写进代码
- 第一次启动可能会慢一点，因为会检查依赖

## 当前状态

这个项目还在整合中，还没算全部完成。

当前已经完成的是：
- 总台识别
- 配置检查
- 启动/停止入口

当前还没完成的是：
- 真实配置后的完整业务验证
- 更统一的界面和日志体验
