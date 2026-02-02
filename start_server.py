#!/usr/bin/env python3
import os
import sys
import subprocess
import json
from pathlib import Path

def load_config():
    config_file = Path(__file__).parent / "config" / "config.json"
    
    if not config_file.exists():
        print("错误：找不到配置文件 config/config.json")
        print("请先运行 setup.bat 进行配置")
        sys.exit(1)
    
    with open(config_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def check_python_version():
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"错误：需要 Python 3.8 或更高版本，当前版本是 {version.major}.{version.minor}")
        sys.exit(1)
    print(f"Python 版本检查通过: {version.major}.{version.minor}.{version.micro}")

def install_dependencies():
    print("正在检查并安装依赖...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-U", "pip"], check=True)
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-U", "uv"], check=True)
        subprocess.run([sys.executable, "-m", "uv", "pip", "install", "-q", "pdf2zh-next"], check=True)
        print("依赖安装完成")
    except subprocess.CalledProcessError as e:
        print(f"安装依赖时出错: {e}")
        sys.exit(1)

def start_server(config):
    api_key = config.get("api_key", "")
    base_url = config.get("base_url", "https://dashscope.aliyuncs.com/compatible-mode/v1")
    model = config.get("model", "qwen-mt-turbo")
    port = config.get("port", 7862)
    
    if not api_key:
        print("错误：API Key 未配置")
        print("请编辑 config/config.json 文件，填入你的 API Key")
        sys.exit(1)
    
    os.environ["QWENMT_API_KEY"] = api_key
    os.environ["QWENMT_BASE_URL"] = base_url
    os.environ["QWENMT_MODEL"] = model
    os.environ["GRADIO_SERVER_PORT"] = str(port)
    
    print(f"\n正在启动 PDF 翻译服务...")
    print(f"服务地址: http://localhost:{port}")
    print(f"使用模型: {model}")
    print(f"\n按 Ctrl+C 可以停止服务\n")
    
    cmd = [
        sys.executable, "-m", "pdf2zh_next", "--gui",
        "--server-port", str(port),
        "--qwenmt",
        "--qwenmt-base-url", base_url,
        "--qwenmt-api-key", api_key,
        "--qwenmt-model", model
    ]
    
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n\n服务已停止")
    except Exception as e:
        print(f"\n启动服务时出错: {e}")
        sys.exit(1)

def main():
    print("=" * 50)
    print("PDF 翻译服务启动程序")
    print("=" * 50)
    
    check_python_version()
    config = load_config()
    install_dependencies()
    start_server(config)

if __name__ == "__main__":
    main()
