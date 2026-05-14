import os
from pathlib import Path


def _load_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return ""


def _patch_transpaper_gradio() -> None:
    if os.environ.get("TRANSPAPER_BRANDING") != "1":
        return

    try:
        import gradio as gr
    except Exception:
        return

    if getattr(gr.Blocks, "_transpaper_branding_patched", False):
        return

    root = Path(__file__).resolve().parent
    css_text = _load_text(root / "branding" / "transpaper_theme.css")
    js_text = _load_text(root / "branding" / "transpaper_theme.js")

    original_init = gr.Blocks.__init__

    def patched_init(self, *args, **kwargs):
        title = kwargs.get("title", "")
        title_text = str(title)

        if "PDFMathTranslate" in title_text:
            existing_css = kwargs.get("css") or ""
            kwargs["css"] = f"{existing_css}\n\n{css_text}".strip()

            existing_head = kwargs.get("head") or ""
            head_parts = [existing_head]
            if js_text:
                head_parts.append(f"<script>{js_text}</script>")
            kwargs["head"] = "\n".join(part for part in head_parts if part).strip()

        return original_init(self, *args, **kwargs)

    gr.Blocks.__init__ = patched_init
    gr.Blocks._transpaper_branding_patched = True


_patch_transpaper_gradio()
