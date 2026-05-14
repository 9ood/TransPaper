#!/usr/bin/env python3
import json
import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).parent
CONFIG_FILE = ROOT / "config" / "config.json"
DEFAULT_PORT = 7862
DEFAULT_ENGINE = "google"
DEFAULT_HOST = os.getenv("TRANSPAPER_HOST", "0.0.0.0")


def load_config():
    if not CONFIG_FILE.exists():
        print("Config file is missing: config/config.json")
        print("Please run setup.bat first.")
        sys.exit(1)

    with CONFIG_FILE.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def check_python_version():
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"Python 3.8+ is required. Current version: {version.major}.{version.minor}")
        sys.exit(1)
    print(f"Python check passed: {version.major}.{version.minor}.{version.micro}")


def install_dependencies():
    print("Checking dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-U", "pip"], check=True)
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-U", "uv"], check=True)
        subprocess.run([sys.executable, "-m", "uv", "pip", "install", "-q", "pdf2zh-next"], check=True)
        print("Dependencies ready")
    except subprocess.CalledProcessError as error:
        print(f"Dependency install failed: {error}")
        sys.exit(1)


def get_engine(config):
    engine = str(config.get("engine", DEFAULT_ENGINE)).strip().lower()
    if engine not in {"google", "bing", "qwenmt"}:
        print(f"Unsupported engine: {engine}")
        sys.exit(1)
    return engine


def build_command(config):
    engine = get_engine(config)
    port = int(config.get("port", DEFAULT_PORT))
    host = str(config.get("host", DEFAULT_HOST)).strip() or DEFAULT_HOST

    cmd = [
        sys.executable,
        "-m",
        "pdf2zh_next.main",
        "--gui",
        "--server-port",
        str(port),
    ]

    if engine == "google":
        cmd.append("--google")
        return engine, host, cmd

    if engine == "bing":
        cmd.append("--bing")
        return engine, host, cmd

    api_key = str(config.get("api_key", "")).strip()
    base_url = str(
        config.get("base_url", "https://dashscope.aliyuncs.com/compatible-mode/v1")
    ).strip()
    model = str(config.get("model", "qwen-mt-turbo")).strip()

    if not api_key:
        print("QwenMT engine needs api_key in config/config.json")
        sys.exit(1)

    os.environ["QWENMT_API_KEY"] = api_key
    os.environ["QWENMT_BASE_URL"] = base_url
    os.environ["QWENMT_MODEL"] = model
    cmd.extend(
        [
            "--qwenmt",
            "--qwenmt-base-url",
            base_url,
            "--qwenmt-api-key",
            api_key,
            "--qwenmt-model",
            model,
        ]
    )
    return engine, host, cmd


def start_server(config):
    engine, host, cmd = build_command(config)
    port = int(config.get("port", DEFAULT_PORT))
    env = os.environ.copy()
    repo_pythonpath = str(ROOT)
    existing_pythonpath = env.get("PYTHONPATH", "").strip()

    if existing_pythonpath:
        env["PYTHONPATH"] = f"{repo_pythonpath}{os.pathsep}{existing_pythonpath}"
    else:
        env["PYTHONPATH"] = repo_pythonpath

    # Let sitecustomize.py know this is the branded launcher for TransPaper.
    env["TRANSPAPER_BRANDING"] = "1"
    env["GRADIO_SERVER_NAME"] = host

    print("\nStarting PDF translation service...")
    print(f"URL: http://{host}:{port}")
    print(f"Engine: {engine}")
    print("\nPress Ctrl+C to stop.\n")

    try:
        subprocess.run(cmd, check=False, env=env)
    except KeyboardInterrupt:
        print("\nService stopped.")
    except Exception as error:
        print(f"\nFailed to start service: {error}")
        sys.exit(1)


def main():
    print("=" * 50)
    print("TransPaper service launcher")
    print("=" * 50)
    check_python_version()
    config = load_config()
    install_dependencies()
    start_server(config)


if __name__ == "__main__":
    main()
