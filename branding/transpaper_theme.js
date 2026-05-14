(function () {
  const TEXT = {
    title: "\u8bba\u6587\u7ffb\u8bd1\u7cfb\u7edf",
    subtitle: "\u53ea\u7559\u4e0a\u4f20\u548c\u9884\u89c8\uff0c\u5176\u4ed6\u5185\u5bb9\u6536\u8fdb\u8bbe\u7f6e\u91cc\uff0c\u9875\u9762\u4f1a\u7b80\u5355\u5f88\u591a\u3002",
    upload: "\u4e0a\u4f20\u9644\u4ef6",
    preview: "\u7ed3\u679c\u9884\u89c8",
    settings: "\u8bbe\u7f6e",
    closeSettings: "\u6536\u8d77\u8bbe\u7f6e",
    language: "\u754c\u9762\u8bed\u8a00",
    translation: "\u7ffb\u8bd1\u8bbe\u7f6e",
    output: "\u8f93\u51fa\u65b9\u5f0f",
    technical: "Technical details",
    translate: "\u5f00\u59cb\u7ffb\u8bd1",
    cancel: "\u505c\u6b62",
    save: "\u4fdd\u5b58\u8bbe\u7f6e",
    modelEyebrow: "\u7ffb\u8bd1\u6a21\u578b",
    modelTitle: "\u9ed8\u8ba4\u4f7f\u7528\u6700\u5f3a\u7ffb\u8bd1\u6a21\u578b\uff0cQwenMT-Plus\u3002",
    modelDesc: "\u8981\u66f4\u5feb\uff0c\u6216\u8005\u8981\u66f4\u7701\uff0c\u518d\u5728\u8fd9\u91cc\u6362\u3002",
    modelCurrent: "\u5f53\u524d\uff1a",
    modelPlaceholder: "\u624b\u52a8\u8f93\u5165\u5176\u4ed6\u6a21\u578b\u540d",
    modelApply: "\u4f7f\u7528\u8fd9\u4e2a\u6a21\u578b",
    statusTitle: "\u5f53\u524d\u72b6\u6001",
    statusIdleTitle: "\u8fd8\u6ca1\u5f00\u59cb",
    statusIdleDesc: "\u5148\u4e0a\u4f20 PDF\uff0c\u518d\u70b9\u201c\u5f00\u59cb\u7ffb\u8bd1\u201d\u3002",
    statusReadyTitle: "\u53ef\u4ee5\u5f00\u59cb\u4e86",
    statusReadyDesc: "\u6587\u4ef6\u5df2\u7ecf\u4e0a\u6765\u4e86\uff0c\u73b0\u5728\u53ef\u4ee5\u70b9\u201c\u5f00\u59cb\u7ffb\u8bd1\u201d\u3002",
    statusStartingTitle: "\u6b63\u5728\u5f00\u59cb\u7ffb\u8bd1",
    statusStartingDesc: "\u6211\u5df2\u7ecf\u6536\u5230\u4f60\u7684\u547d\u4ee4\u4e86\uff0c\u6b63\u5728\u8ba9\u7cfb\u7edf\u5f00\u5de5\u3002\u5148\u7b49\u51e0\u79d2\uff0c\u4e0d\u7528\u91cd\u590d\u70b9\u3002",
    statusWorkingTitle: "\u6b63\u5728\u7ffb\u8bd1",
    statusDoneTitle: "\u7ffb\u8bd1\u5b8c\u6210",
    statusDoneDesc: "\u7ed3\u679c\u5df2\u7ecf\u51fa\u6765\u4e86\uff0c\u73b0\u5728\u53ef\u4ee5\u9884\u89c8\u6216\u4e0b\u8f7d\u3002",
    statusStoppedTitle: "\u5df2\u7ecf\u505c\u4e0b",
    statusStoppedDesc: "\u8fd9\u6b21\u4efb\u52a1\u5df2\u7ecf\u505c\u4e0b\u4e86\u3002",
  };

  const MODEL_PRESETS = [
    ["qwen-mt-plus", "QwenMT-Plus", "\u8d28\u91cf\u6700\u597d\uff0c\u9002\u5408\u6b63\u5f0f\u4ea4\u4ed8\u3002"],
    ["qwen-mt-turbo", "QwenMT-Turbo", "\u901f\u5ea6\u66f4\u5feb\uff0c\u9002\u5408\u5927\u6279\u91cf\u5904\u7406\u3002"],
    ["qwen-mt-mini", "QwenMT-Mini", "\u66f4\u7701\u6210\u672c\uff0c\u9002\u5408\u8f7b\u91cf\u4efb\u52a1\u3002"],
  ];

  let scheduled = false;
  let selectedModel = "qwen-mt-plus";
  let serviceSyncTried = false;
  let translateIntentAt = 0;
  let stopIntentAt = 0;
  let statusWatcherStarted = false;
  let actionWatcherStarted = false;

  function normalizeText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function closestPanel(node) {
    return node ? node.closest(".wrap, .block, .panel") || node.parentElement : null;
  }

  function climbPanel(node, matcher) {
    let current = closestPanel(node);
    while (current) {
      if (matcher(current)) {
        return current;
      }
      current = current.parentElement ? closestPanel(current.parentElement) : null;
    }
    return null;
  }

  function findHeading(root, names) {
    return (
      Array.from(root.querySelectorAll("h1, h2, h3")).find((node) => {
        const text = normalizeText(node.textContent);
        return names.some((name) => text === name || text.indexOf(name) !== -1);
      }) || null
    );
  }

  function findButton(root, names) {
    return (
      Array.from(root.querySelectorAll("button")).find((node) => {
        const text = normalizeText(node.textContent);
        return names.some((name) => text === name);
      }) || null
    );
  }

  function moveNodes(target, nodes) {
    nodes.forEach((node) => {
      if (node && node.parentElement) {
        target.appendChild(node);
      }
    });
  }

  function unhideTree(root) {
    if (!root) {
      return;
    }

    if (root.classList) {
      root.classList.remove("tp-hidden-node");
    }

    root.querySelectorAll(".tp-hidden-node").forEach((node) => {
      node.classList.remove("tp-hidden-node");
    });
  }

  function createShell(root) {
    let shell = root.querySelector(".tp-shell");
    if (shell) {
      return shell;
    }

    shell = document.createElement("section");
    shell.className = "tp-shell";
    shell.innerHTML =
      '<div class="tp-shell__eyebrow">TransPaper</div>' +
      '<h1 class="tp-shell__title">' +
      TEXT.title +
      "</h1>" +
      '<p class="tp-shell__desc">' +
      TEXT.subtitle +
      "</p>";

    root.insertBefore(shell, root.firstChild);
    return shell;
  }

  function translateHeadings(root) {
    const mapping = new Map([
      ["File(s)", TEXT.upload],
      ["Preview", TEXT.preview],
      ["Translation Options", TEXT.translation],
      ["PDF Output Options", TEXT.output],
      ["Translate", TEXT.translate],
      ["Cancel", TEXT.cancel],
      ["Save Settings", TEXT.save],
    ]);

    Array.from(root.querySelectorAll("h1, h2, h3, button")).forEach((node) => {
      const text = normalizeText(node.textContent);
      if (!mapping.has(text) || node.dataset.tpTextPatched === "1") {
        return;
      }
      node.textContent = mapping.get(text);
      node.dataset.tpTextPatched = "1";
    });

    const heroTitle = root.querySelector("h1 a");
    if (heroTitle && heroTitle.dataset.tpTitlePatched !== "1") {
      heroTitle.textContent = TEXT.title;
      heroTitle.dataset.tpTitlePatched = "1";
    }
  }

  function findLeftPanel(root) {
    const uploadHeading = findHeading(root, ["File(s)", TEXT.upload]);
    if (!uploadHeading) {
      return null;
    }

    return climbPanel(uploadHeading, (panel) => {
      const text = normalizeText(panel.textContent);
      return (
        (text.indexOf("Translation Options") !== -1 || text.indexOf(TEXT.translation) !== -1) &&
        (text.indexOf("Technical details") !== -1 || text.indexOf("Save Settings") !== -1 || text.indexOf(TEXT.save) !== -1)
      );
    });
  }

  function findSourceContainer(panel) {
    const candidates = Array.from(panel.querySelectorAll("div, section")).filter((node) => {
      const text = normalizeText(node.textContent);
      return (
        node.children.length >= 4 &&
        (text.indexOf("File(s)") !== -1 || text.indexOf(TEXT.upload) !== -1) &&
        (text.indexOf("Translation Options") !== -1 || text.indexOf(TEXT.translation) !== -1) &&
        text.indexOf("Select File to Preview/Download") === -1 &&
        text.indexOf("Document Preview") === -1 &&
        text.indexOf("\u6587\u6863\u9884\u89c8") === -1 &&
        text.indexOf(TEXT.preview) === -1
      );
    });

    candidates.sort((a, b) => {
      const aScore = a.classList.contains("column") ? 0 : 1;
      const bScore = b.classList.contains("column") ? 0 : 1;
      if (aScore !== bScore) {
        return aScore - bScore;
      }
      return a.children.length - b.children.length;
    });
    return candidates[0] || panel;
  }

  function uniqueNodes(nodes) {
    return Array.from(new Set(nodes.filter(Boolean))).filter((node) => {
      return !nodes.some((other) => other && other !== node && other.contains(node));
    });
  }

  function findBlockWithTexts(root, texts) {
    const candidates = Array.from(root.querySelectorAll(".wrap, .block, .panel, section, div")).filter((node) => {
      const text = normalizeText(node.textContent);
      return texts.every((part) => text.indexOf(part) !== -1);
    });

    candidates.sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
    return candidates[0] || null;
  }

  function findPreviewPanel(root) {
    const previewHeading = findHeading(root, ["Preview", TEXT.preview]);
    if (!previewHeading) {
      return null;
    }

    return climbPanel(previewHeading, (panel) => {
      const text = normalizeText(panel.textContent);
      return text.indexOf("Select File to Preview/Download") !== -1 || text.indexOf("Document Preview") !== -1;
    });
  }

  function findServiceField(root) {
    const listbox = Array.from(root.querySelectorAll('[role="listbox"]')).find((node) => {
      const block = node.closest(".wrap, .block, .panel, div");
      return block && normalizeText(block.textContent).indexOf("Service") !== -1;
    });
    if (!listbox) {
      return null;
    }
    return {
      listbox,
      container: listbox.closest(".wrap, .block, .panel, div"),
    };
  }

  function trySelectQwenService(root) {
    if (serviceSyncTried) {
      return;
    }

    const field = findServiceField(root);
    if (!field) {
      return;
    }

    if (/QwenMt/i.test(normalizeText(field.listbox.textContent))) {
      serviceSyncTried = true;
      return;
    }

    serviceSyncTried = true;
    field.listbox.click();
    window.setTimeout(() => {
      const option = Array.from(document.querySelectorAll('[role="option"], li, button, div')).find((node) => {
        return /^QwenMt$/i.test(normalizeText(node.textContent));
      });
      if (option) {
        option.click();
      }
    }, 120);
  }

  function findModelField(root) {
    const input = Array.from(root.querySelectorAll("input, textarea")).find((node) => {
      const block = node.closest(".wrap, .block, .panel, div");
      return block && /QwenMt model to use/i.test(normalizeText(block.textContent));
    });
    if (!input) {
      return null;
    }
    return {
      input,
      container: input.closest(".wrap, .block, .panel, div"),
    };
  }

  function setNativeModelValue(root, value) {
    const field = findModelField(root);
    selectedModel = value || selectedModel;
    if (!field) {
      return false;
    }

    if (field.input.value !== value) {
      field.input.focus();
      field.input.value = value;
      field.input.dispatchEvent(new Event("input", { bubbles: true }));
      field.input.dispatchEvent(new Event("change", { bubbles: true }));
      field.input.blur();
    }

    return true;
  }

  function refreshModelCard() {
    const card = document.getElementById("tp-model-card");
    if (!card) {
      return;
    }

    const current = card.querySelector(".tp-model-card__current");
    if (current) {
      const preset = MODEL_PRESETS.find((item) => item[0] === selectedModel);
      current.textContent = TEXT.modelCurrent + (preset ? preset[1] : selectedModel);
    }

    card.querySelectorAll(".tp-model-option").forEach((node) => {
      node.classList.toggle("is-active", node.dataset.value === selectedModel);
    });

    const customInput = card.querySelector("input");
    if (customInput && !customInput.matches(":focus")) {
      customInput.value = selectedModel;
    }
  }

  function createModelCard(root) {
    const card = document.createElement("div");
    const eyebrow = document.createElement("div");
    const title = document.createElement("div");
    const desc = document.createElement("p");
    const current = document.createElement("div");
    const options = document.createElement("div");
    const custom = document.createElement("div");
    const customInput = document.createElement("input");
    const customButton = document.createElement("button");

    card.id = "tp-model-card";
    card.className = "tp-model-card";
    eyebrow.className = "tp-model-card__eyebrow";
    title.className = "tp-model-card__title";
    desc.className = "tp-model-card__desc";
    current.className = "tp-model-card__current";
    options.className = "tp-model-options";
    custom.className = "tp-model-custom";

    eyebrow.textContent = TEXT.modelEyebrow;
    title.textContent = TEXT.modelTitle;
    desc.textContent = TEXT.modelDesc;

    MODEL_PRESETS.forEach((item) => {
      const button = document.createElement("button");
      const name = document.createElement("div");
      const copy = document.createElement("div");

      button.type = "button";
      button.className = "tp-model-option";
      button.dataset.value = item[0];
      name.className = "tp-model-option__name";
      copy.className = "tp-model-option__desc";
      name.textContent = item[1];
      copy.textContent = item[2];
      button.appendChild(name);
      button.appendChild(copy);

      button.addEventListener("click", () => {
        selectedModel = item[0];
        setNativeModelValue(root, item[0]);
        refreshModelCard();
      });

      options.appendChild(button);
    });

    customInput.type = "text";
    customInput.placeholder = TEXT.modelPlaceholder;
    customButton.type = "button";
    customButton.textContent = TEXT.modelApply;
    customButton.addEventListener("click", () => {
      const value = normalizeText(customInput.value);
      if (!value) {
        return;
      }
      selectedModel = value;
      setNativeModelValue(root, value);
      refreshModelCard();
    });

    custom.appendChild(customInput);
    custom.appendChild(customButton);
    card.appendChild(eyebrow);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(current);
    card.appendChild(options);
    card.appendChild(custom);
    return card;
  }

  function collectSectionNodes(children, startIndex, endIndex) {
    if (startIndex < 0) {
      return [];
    }
    return children.slice(startIndex, endIndex >= 0 ? endIndex : children.length);
  }

  function createDetails(title, nodes, openByDefault) {
    if (!nodes.length) {
      return null;
    }

    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const body = document.createElement("div");

    details.className = "tp-settings-section";
    if (openByDefault) {
      details.open = true;
    }
    summary.className = "tp-settings-section__summary";
    summary.textContent = title;
    body.className = "tp-settings-section__body";

    moveNodes(body, nodes);
    details.appendChild(summary);
    details.appendChild(body);
    return details;
  }

  function createResultSection(nodes) {
    if (!nodes.length) {
      return null;
    }

    const section = document.createElement("section");
    const title = document.createElement("h2");

    section.className = "tp-result-section";
    title.textContent = TEXT.preview;

    section.appendChild(title);
    moveNodes(section, nodes);
    return section;
  }

  function createStatusCard() {
    const section = document.createElement("section");
    section.className = "tp-status-card";
    section.innerHTML =
      '<div class="tp-status-card__eyebrow">' + TEXT.statusTitle + "</div>" +
      '<div class="tp-status-card__title"></div>' +
      '<p class="tp-status-card__desc"></p>';
    return section;
  }

  function getStatusCard(root) {
    return root.querySelector(".tp-status-card");
  }

  function hasUploadedFile(root) {
    const text = normalizeText(root.innerText);
    return /\.pdf\b/i.test(text) && /\d+(?:\.\d+)?\s*(KB|MB|GB)\b/i.test(text);
  }

  function hasTranslationResult(root) {
    const text = normalizeText(root.innerText);
    return (
      text.indexOf("Download All (ZIP)") !== -1 ||
      text.indexOf("Download All Mono (ZIP)") !== -1 ||
      text.indexOf("Download All Dual (ZIP)") !== -1 ||
      text.indexOf("\u4e0b\u8f7d\u7ffb\u8bd1") !== -1 ||
      /\.mono\.pdf\b/i.test(text) ||
      /\.dual\.pdf\b/i.test(text)
    );
  }

  function getProgressText(root) {
    const previewPanel = findPreviewPanel(root);
    const text = normalizeText((previewPanel && previewPanel.innerText) || "");
    if (!text) {
      return "";
    }

    const longMatch = text.match(/(\d+(?:\.\d+)?s\s+\[[^\]]+\][^%]*\d+(?:\.\d+)?%)/i);
    if (longMatch) {
      return longMatch[1];
    }

    const shortMatch = text.match(/(\[[^\]]+\][^%]*\d+(?:\.\d+)?%)/i);
    if (shortMatch) {
      return shortMatch[1];
    }

    const percentMatch = text.match(/(\d+(?:\.\d+)?%)/);
    if (percentMatch && text.indexOf("Document Preview") === -1) {
      return percentMatch[1];
    }

    return "";
  }

  function getStatusState(root) {
    const now = Date.now();
    const progressText = getProgressText(root);

    if (hasTranslationResult(root)) {
      return {
        tone: "success",
        title: TEXT.statusDoneTitle,
        detail: TEXT.statusDoneDesc,
      };
    }

    if (progressText) {
      return {
        tone: "working",
        title: TEXT.statusWorkingTitle,
        detail: progressText,
      };
    }

    if (stopIntentAt && now - stopIntentAt < 12000) {
      return {
        tone: "muted",
        title: TEXT.statusStoppedTitle,
        detail: TEXT.statusStoppedDesc,
      };
    }

    if (translateIntentAt && now - translateIntentAt < 15000) {
      return {
        tone: "working",
        title: TEXT.statusStartingTitle,
        detail: TEXT.statusStartingDesc,
      };
    }

    if (hasUploadedFile(root)) {
      return {
        tone: "ready",
        title: TEXT.statusReadyTitle,
        detail: TEXT.statusReadyDesc,
      };
    }

    return {
      tone: "muted",
      title: TEXT.statusIdleTitle,
      detail: TEXT.statusIdleDesc,
    };
  }

  function updateStatusCard(root) {
    const card = getStatusCard(root);
    if (!card) {
      return;
    }

    const state = getStatusState(root);
    card.dataset.tone = state.tone;

    const title = card.querySelector(".tp-status-card__title");
    const desc = card.querySelector(".tp-status-card__desc");
    if (title) {
      title.textContent = state.title;
    }
    if (desc) {
      desc.textContent = state.detail;
    }
  }

  function ensureStatusWatcher() {
    if (statusWatcherStarted) {
      return;
    }

    statusWatcherStarted = true;
    window.setInterval(() => {
      const root = document.querySelector(".gradio-container");
      if (root) {
        updateStatusCard(root);
      }
    }, 1000);
  }

  function ensureActionWatcher() {
    if (actionWatcherStarted) {
      return;
    }

    actionWatcherStarted = true;
    document.addEventListener("click", (event) => {
      const button = event.target && event.target.closest ? event.target.closest("button") : null;
      if (!button) {
        return;
      }

      const root = document.querySelector(".gradio-container");
      const text = normalizeText(button.textContent);
      const looksLikeTranslate =
        text.indexOf(TEXT.translate) !== -1 ||
        text.indexOf("Translate") !== -1 ||
        (
          root &&
          hasUploadedFile(root) &&
          !hasTranslationResult(root) &&
          text.indexOf(TEXT.cancel) === -1 &&
          text.indexOf("Cancel") === -1 &&
          text.indexOf(TEXT.settings) === -1 &&
          text.indexOf("Settings") === -1 &&
          text.indexOf("upload") === -1
        );

      if (looksLikeTranslate) {
        translateIntentAt = Date.now();
        stopIntentAt = 0;
        window.setTimeout(() => {
          if (root) {
            updateStatusCard(root);
          }
        }, 0);
      } else if (text.indexOf(TEXT.cancel) !== -1 || text.indexOf("Cancel") !== -1) {
        stopIntentAt = Date.now();
        translateIntentAt = 0;
        window.setTimeout(() => {
          if (root) {
            updateStatusCard(root);
          }
        }, 0);
      }
    }, true);
  }

  function compactLeftPanel(root, panel) {
    if (!panel) {
      return;
    }

    const source = findSourceContainer(panel);
    if (!source || source.dataset.tpCompactReady === "1") {
      return;
    }

    const compactRoot = source;
    const translateButton = findButton(source, ["Translate", TEXT.translate]);
    const cancelButton = findButton(source, ["Cancel", TEXT.cancel]);
    const saveButton = findButton(source, ["Save Settings", TEXT.save]);

    const uiNodes = uniqueNodes([findBlockWithTexts(source, ["UI Language"])]);
    const uploadNodes = uniqueNodes([
      findBlockWithTexts(source, ["Type", "File(s)", "Link"]),
      findBlockWithTexts(source, ["Click to upload"]),
      findBlockWithTexts(source, ["drop files"]),
      findBlockWithTexts(source, ["File(s)", "\u70b9\u51fb\u4e0a\u4f20"]),
      findBlockWithTexts(source, ["File(s)", "\u62d6\u653e"]),
    ]);
    const translationNodes = uniqueNodes([
      findBlockWithTexts(source, ["Translate from", "Translate to"]),
      findBlockWithTexts(source, ["Service"]),
      findBlockWithTexts(source, ["Rate Limit Mode", "QPS"]),
      findBlockWithTexts(source, ["Auto Term Extraction"]),
      findBlockWithTexts(source, ["Pages", "Only include translated pages"]),
    ]);
    const outputNodes = uniqueNodes([
      findBlockWithTexts(source, ["Disable monolingual output", "Disable bilingual output"]),
      findBlockWithTexts(source, ["Put translated pages first", "Use alternating pages"]),
      findBlockWithTexts(source, ["Watermark mode"]),
      findButton(source, ["Advanced Options"]),
    ]);
    const technicalNodes = uniqueNodes([
      findBlockWithTexts(source, ["Technical details", "Star at GitHub"]),
    ]);
    const resultNodes = uniqueNodes([
      findBlockWithTexts(source, ["已翻译", "Total Token Usage"]),
      findBlockWithTexts(source, ["下载翻译（单语版）"]),
      findBlockWithTexts(source, ["下载翻译（双语）"]),
      findBlockWithTexts(source, ["Download All (ZIP)"]),
      findBlockWithTexts(source, ["Download All Mono (ZIP)"]),
      findBlockWithTexts(source, ["Download All Dual (ZIP)"]),
      findBlockWithTexts(source, ["Download All Glossaries (ZIP)"]),
    ]);

    if (!uploadNodes.length) {
      return;
    }

    const uploadSection = document.createElement("section");
    const uploadTitle = document.createElement("h2");
    const actionBar = document.createElement("div");
    const statusCard = createStatusCard();
    const settingsButton = document.createElement("button");
    const settingsDrawer = document.createElement("section");
    const settingsStack = document.createElement("div");
    const settingsFooter = document.createElement("div");
    const resultSection = createResultSection(resultNodes);

    uploadSection.className = "tp-upload-section";
    uploadTitle.textContent = TEXT.upload;
    actionBar.className = "tp-action-bar";
    settingsButton.className = "tp-settings-button";
    settingsButton.type = "button";
    settingsButton.textContent = TEXT.settings;
    settingsDrawer.className = "tp-settings-drawer";
    settingsDrawer.hidden = true;
    settingsStack.className = "tp-settings-stack";
    settingsFooter.className = "tp-settings-footer";

    uploadSection.appendChild(uploadTitle);
    moveNodes(uploadSection, uploadNodes);

    if (translateButton) {
      translateButton.classList.add("tp-primary-action");
      actionBar.appendChild(translateButton);
    }
    if (cancelButton) {
      cancelButton.classList.add("tp-secondary-action");
      actionBar.appendChild(cancelButton);
    }
    actionBar.appendChild(settingsButton);

    const languageDetails = createDetails(TEXT.language, uiNodes, false);
    const translationDetails = createDetails(TEXT.translation, translationNodes, true);
    const outputDetails = createDetails(TEXT.output, outputNodes, false);
    const technicalDetails = createDetails(TEXT.technical, technicalNodes, false);

    [languageDetails, translationDetails, outputDetails, technicalDetails].forEach((details) => {
      if (details) {
        settingsStack.appendChild(details);
      }
    });

    const modelField = findModelField(source);
    if (modelField && modelField.container) {
      modelField.container.classList.add("tp-native-model-control");
      selectedModel = normalizeText(modelField.input.value) || selectedModel;
    }

    const translationBody = settingsStack.querySelector(".tp-settings-section[open] .tp-settings-section__body");
    if (translationBody) {
      translationBody.insertBefore(createModelCard(root), translationBody.firstChild);
      refreshModelCard();
    }

    if (saveButton) {
      saveButton.classList.add("tp-save-button");
      settingsFooter.appendChild(saveButton);
    }

    settingsDrawer.appendChild(settingsStack);
    if (settingsFooter.children.length) {
      settingsDrawer.appendChild(settingsFooter);
    }

    Array.from(compactRoot.children).forEach((node) => {
      node.classList && node.classList.add("tp-hidden-node");
    });

    compactRoot.appendChild(uploadSection);
    compactRoot.appendChild(actionBar);
    compactRoot.appendChild(statusCard);
    if (resultSection) {
      compactRoot.appendChild(resultSection);
    }
    compactRoot.appendChild(settingsDrawer);
    unhideTree(uploadSection);
    unhideTree(settingsDrawer);
    updateStatusCard(root);

    settingsButton.addEventListener("click", () => {
      const next = settingsDrawer.hidden;
      settingsDrawer.hidden = !next;
      settingsButton.textContent = next ? TEXT.closeSettings : TEXT.settings;
    });

    if (translateButton) {
      translateButton.addEventListener("click", () => {
        translateIntentAt = Date.now();
        stopIntentAt = 0;
        window.setTimeout(() => updateStatusCard(root), 0);
      });
    }

    if (cancelButton) {
      cancelButton.addEventListener("click", () => {
        stopIntentAt = Date.now();
        translateIntentAt = 0;
        window.setTimeout(() => updateStatusCard(root), 0);
      });
    }

    compactRoot.classList.add("tp-left-panel");
    compactRoot.dataset.tpCompactReady = "1";
  }

  function beautifyPreviewPanel(panel) {
    if (!panel || panel.classList.contains("tp-left-panel")) {
      return;
    }
    panel.classList.add("tp-preview-panel");
  }

  function applyBranding() {
    const root = document.querySelector(".gradio-container");
    if (!root) {
      return;
    }

    document.title = "TransPaper " + TEXT.title;
    createShell(root);
    ensureStatusWatcher();
    ensureActionWatcher();
    translateHeadings(root);
    trySelectQwenService(root);
    compactLeftPanel(root, findLeftPanel(root));
    beautifyPreviewPanel(findPreviewPanel(root));
    updateStatusCard(root);
  }

  function scheduleApply() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyBranding();
    });
  }

  const observer = new MutationObserver(() => scheduleApply());
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyBranding, { once: true });
  } else {
    applyBranding();
  }

  window.addEventListener("load", applyBranding, { once: true });
})();
