/**
 * i18n — CLI UI strings + template comment translations
 */

export const LANG_CHOICES = ["en", "ko", "ja"];

const LANG_LABELS = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
};

export function getLangLabel(lang) {
  return LANG_LABELS[lang] ?? LANG_LABELS["en"];
}

// ---------------------------------------------------------------------------
// CLI UI messages
// ---------------------------------------------------------------------------

const messages = {
  en: {
    // index.mjs
    "error.invalidName": "Error: Invalid project name.",
    "summary.title": "Project configuration:",
    "summary.directory": "Directory:",
    "summary.widgetName": "Widget name:",
    "summary.gleamModule": "Gleam module:",
    "summary.packageManager": "Package manager:",
    "summary.language": "Language:",
    "progress.generatingFiles": "Generating files...",
    "progress.filesCreated": "{count} files created",
    "progress.claudeMdCreated": "CLAUDE.md created",
    "progress.readmeCreated": "README.md created",
    "progress.gitInit": "Git repository initialized",
    "progress.gleamCompiling": "Compiling Gleam...",
    "progress.gleamCompiled": "Gleam compilation complete",
    "error.gleamCompileFail":
      "⚠ Gleam compilation failed. Run manually in the project directory:",
    "progress.depsInstalling": "Installing dependencies... ({pm})",
    "progress.depsInstalled": "Dependencies installed",
    "error.depsInstallFail":
      "⚠ Dependency installation failed. Run manually in the project directory:",
    "progress.playwrightInstalling": "Installing Playwright Chromium...",
    "progress.playwrightInstalled": "Playwright Chromium installed",
    "progress.playwrightExists": "Playwright Chromium already installed",
    "error.playwrightFail":
      "⚠ Playwright browser installation failed. Run manually in the project directory:",
    "progress.buildingWidget": "Building widget...",
    "progress.widgetBuilt": "Widget build complete",
    "error.buildFail":
      "⚠ Build failed. Run manually in the project directory:",
    "done.title": "Project created successfully!",
    "done.nextSteps": "Next steps:",
    "done.devServer": "# Start dev server",
    "done.prodBuild": "# Production build",
    "done.marketplace": "# Download Marketplace widgets",

    // prompts.mjs
    "prompt.projectName": "Project name:",
    "prompt.cancelled": "Cancelled.",
    "validate.nameRequired": "Please enter a project name.",
    "validate.needAlpha": "Must contain valid alphabetic characters.",
    "validate.invalidChars":
      "Must start with a letter and contain only letters, numbers, hyphens, or underscores.",
    "error.dirExists": "Error: Directory '{name}' already exists.",
    "prompt.pmSelect": "Select package manager:",
    "prompt.pmDetected": "detected: {detected}",
    "prompt.pmDetectedMarker": "← detected",
    "prompt.pmChoose": "Choose (1-{count}, default: {default}):",
  },

  ko: {
    // index.mjs
    "error.invalidName": "오류: 유효하지 않은 프로젝트 이름입니다.",
    "summary.title": "프로젝트 설정:",
    "summary.directory": "디렉토리:",
    "summary.widgetName": "위젯 이름:",
    "summary.gleamModule": "Gleam 모듈:",
    "summary.packageManager": "패키지 매니저:",
    "summary.language": "언어:",
    "progress.generatingFiles": "파일 생성 중...",
    "progress.filesCreated": "{count}개 파일 생성 완료",
    "progress.claudeMdCreated": "CLAUDE.md 생성 완료",
    "progress.readmeCreated": "README.md 생성 완료",
    "progress.gitInit": "git 저장소 초기화 완료",
    "progress.gleamCompiling": "Gleam 컴파일 중...",
    "progress.gleamCompiled": "Gleam 컴파일 완료",
    "error.gleamCompileFail":
      "⚠ Gleam 컴파일 실패. 프로젝트 디렉토리에서 직접 실행하세요:",
    "progress.depsInstalling": "의존성 설치 중... ({pm})",
    "progress.depsInstalled": "의존성 설치 완료",
    "error.depsInstallFail":
      "⚠ 의존성 설치 실패. 프로젝트 디렉토리에서 직접 실행하세요:",
    "progress.playwrightInstalling": "Playwright Chromium 설치 중...",
    "progress.playwrightInstalled": "Playwright Chromium 설치 완료",
    "progress.playwrightExists": "Playwright Chromium 이미 설치됨",
    "error.playwrightFail":
      "⚠ Playwright 브라우저 설치 실패. 프로젝트 디렉토리에서 직접 실행하세요:",
    "progress.buildingWidget": "위젯 빌드 중...",
    "progress.widgetBuilt": "위젯 빌드 완료",
    "error.buildFail":
      "⚠ 빌드 실패. 프로젝트 디렉토리에서 직접 실행하세요:",
    "done.title": "프로젝트가 생성되었습니다!",
    "done.nextSteps": "다음 단계:",
    "done.devServer": "# 개발 서버 시작",
    "done.prodBuild": "# 프로덕션 빌드",
    "done.marketplace": "# Marketplace 위젯 다운로드",

    // prompts.mjs
    "prompt.projectName": "프로젝트 이름:",
    "prompt.cancelled": "취소되었습니다.",
    "validate.nameRequired": "프로젝트 이름을 입력해주세요.",
    "validate.needAlpha": "유효한 영문자를 포함해야 합니다.",
    "validate.invalidChars":
      "영문자로 시작해야 하며, 영문자/숫자/-/_ 만 사용 가능합니다.",
    "error.dirExists": "오류: '{name}' 디렉토리가 이미 존재합니다.",
    "prompt.pmSelect": "패키지 매니저 선택:",
    "prompt.pmDetected": "감지: {detected}",
    "prompt.pmDetectedMarker": "← 감지됨",
    "prompt.pmChoose": "선택 (1-{count}, 기본: {default}):",
  },

  ja: {
    // index.mjs
    "error.invalidName": "エラー: 無効なプロジェクト名です。",
    "summary.title": "プロジェクト設定:",
    "summary.directory": "ディレクトリ:",
    "summary.widgetName": "ウィジェット名:",
    "summary.gleamModule": "Gleamモジュール:",
    "summary.packageManager": "パッケージマネージャー:",
    "summary.language": "言語:",
    "progress.generatingFiles": "ファイル生成中...",
    "progress.filesCreated": "{count}個のファイル生成完了",
    "progress.claudeMdCreated": "CLAUDE.md 生成完了",
    "progress.readmeCreated": "README.md 生成完了",
    "progress.gitInit": "gitリポジトリ初期化完了",
    "progress.gleamCompiling": "Gleamコンパイル中...",
    "progress.gleamCompiled": "Gleamコンパイル完了",
    "error.gleamCompileFail":
      "⚠ Gleamコンパイル失敗。プロジェクトディレクトリで直接実行してください:",
    "progress.depsInstalling": "依存関係インストール中... ({pm})",
    "progress.depsInstalled": "依存関係インストール完了",
    "error.depsInstallFail":
      "⚠ 依存関係インストール失敗。プロジェクトディレクトリで直接実行してください:",
    "progress.playwrightInstalling": "Playwright Chromiumインストール中...",
    "progress.playwrightInstalled": "Playwright Chromiumインストール完了",
    "progress.playwrightExists": "Playwright Chromiumインストール済み",
    "error.playwrightFail":
      "⚠ Playwrightブラウザインストール失敗。プロジェクトディレクトリで直接実行してください:",
    "progress.buildingWidget": "ウィジェットビルド中...",
    "progress.widgetBuilt": "ウィジェットビルド完了",
    "error.buildFail":
      "⚠ ビルド失敗。プロジェクトディレクトリで直接実行してください:",
    "done.title": "プロジェクトが作成されました！",
    "done.nextSteps": "次のステップ:",
    "done.devServer": "# 開発サーバー起動",
    "done.prodBuild": "# プロダクションビルド",
    "done.marketplace": "# Marketplaceウィジェットダウンロード",

    // prompts.mjs
    "prompt.projectName": "プロジェクト名:",
    "prompt.cancelled": "キャンセルされました。",
    "validate.nameRequired": "プロジェクト名を入力してください。",
    "validate.needAlpha": "有効なアルファベットを含む必要があります。",
    "validate.invalidChars":
      "英字で始まり、英字/数字/-/_ のみ使用可能です。",
    "error.dirExists": "エラー: '{name}' ディレクトリは既に存在します。",
    "prompt.pmSelect": "パッケージマネージャー選択:",
    "prompt.pmDetected": "検出: {detected}",
    "prompt.pmDetectedMarker": "← 検出済み",
    "prompt.pmChoose": "選択 (1-{count}, デフォルト: {default}):",
  },
};

/**
 * Translate a CLI message key.
 * Supports {param} interpolation: t("en", "progress.filesCreated", { count: 5 })
 */
export function t(lang, key, params = {}) {
  const msg = messages[lang]?.[key] ?? messages["en"][key] ?? key;
  return msg.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
}

// ---------------------------------------------------------------------------
// Template file comments (for {{I18N:*}} placeholders)
// ---------------------------------------------------------------------------

const templateComments = {
  en: {
    // __widget_name__.gleam
    widget_main_1: '// Mendix Pluggable Widget - "Hello World"',
    widget_main_2:
      "// React functional component: fn(JsProps) -> ReactElement",
    widget_main_doc:
      "/// Main widget function - called by Mendix runtime as a React component",

    // editor_config.gleam
    editor_config_1: "// Mendix Studio Pro property panel configuration",
    editor_config_2: "// Defines getProperties, check, getPreview, etc.",
    editor_config_3: "// External types (JS objects passed by Mendix)",
    editor_config_doc:
      "/// Property panel configuration - controls widget property visibility in Studio Pro",

    // editor_preview.gleam
    editor_preview_1: "// Mendix Studio Pro design view preview",
    editor_preview_2:
      "// Renders the widget's visual preview in Studio Pro",
    editor_preview_doc:
      "/// Studio Pro design view preview - renders the widget's visual representation",

    // components/hello_world.gleam
    hello_world_1: "// Hello World component",
    hello_world_2:
      "// Shared between widget runtime and Studio Pro preview",
    hello_world_doc: "/// Render Hello World UI",

    // _gitignore
    gitignore_deps: "# Dependencies",
    gitignore_lockfiles: "# Package manager lock files",
    gitignore_pm_cache: "# Package manager cache/config",
    gitignore_gleam_build: "# Gleam compilation output",
    gitignore_mendix_build: "# Mendix widget build output",
    gitignore_env: "# Environment variables",
    gitignore_logs: "# Logs",
    gitignore_os: "# OS",
    gitignore_ide: "# IDE",
    gitignore_test_project: "# Mendix test project",
    gitignore_test_artifacts: "# Test artifacts",
    gitignore_bridge:
      "# Auto-generated bridge files (created/deleted by glendix at build time)",
    gitignore_ai: "# AI",
    gitignore_marketplace: "# Mendix marketplace cache/config",
  },

  ko: {
    // __widget_name__.gleam
    widget_main_1: '// Mendix Pluggable Widget - "Hello World"',
    widget_main_2:
      "// React 함수형 컴포넌트: fn(JsProps) -> ReactElement",
    widget_main_doc:
      "/// 위젯 메인 함수 - Mendix 런타임이 React 컴포넌트로 호출",

    // editor_config.gleam
    editor_config_1: "// Mendix Studio Pro 속성 패널 설정",
    editor_config_2: "// getProperties, check, getPreview 등을 정의",
    editor_config_3: "// 외부 타입 (Mendix가 전달하는 JS 객체)",
    editor_config_doc:
      "/// 속성 패널 설정 - Studio Pro에서 위젯 속성의 가시성을 제어",

    // editor_preview.gleam
    editor_preview_1: "// Mendix Studio Pro 디자인 뷰 미리보기",
    editor_preview_2:
      "// Studio Pro에서 위젯의 시각적 미리보기를 렌더링",
    editor_preview_doc:
      "/// Studio Pro 디자인 뷰 미리보기 - 위젯의 시각적 표현을 렌더링",

    // components/hello_world.gleam
    hello_world_1: "// Hello World 컴포넌트",
    hello_world_2: "// 위젯 런타임과 Studio Pro 미리보기에서 공유",
    hello_world_doc: "/// Hello World UI 렌더링",

    // _gitignore
    gitignore_deps: "# 의존성",
    gitignore_lockfiles: "# 패키지 매니저 lock 파일",
    gitignore_pm_cache: "# 패키지 매니저 캐시/설정",
    gitignore_gleam_build: "# Gleam 컴파일 출력",
    gitignore_mendix_build: "# Mendix 위젯 빌드 출력",
    gitignore_env: "# 환경 변수",
    gitignore_logs: "# 로그",
    gitignore_os: "# OS",
    gitignore_ide: "# IDE",
    gitignore_test_project: "# Mendix 테스트 프로젝트",
    gitignore_test_artifacts: "# 테스트 산출물",
    gitignore_bridge:
      "# 자동 생성 브릿지 파일 (glendix가 빌드 시 생성/삭제)",
    gitignore_ai: "# AI",
    gitignore_marketplace: "# Mendix marketplace 캐시/설정",
  },

  ja: {
    // __widget_name__.gleam
    widget_main_1: '// Mendix Pluggable Widget - "Hello World"',
    widget_main_2:
      "// React関数コンポーネント: fn(JsProps) -> ReactElement",
    widget_main_doc:
      "/// ウィジェットメイン関数 - MendixランタイムがReactコンポーネントとして呼び出し",

    // editor_config.gleam
    editor_config_1: "// Mendix Studio Proプロパティパネル設定",
    editor_config_2: "// getProperties、check、getPreview等を定義",
    editor_config_3: "// 外部型（Mendixが渡すJSオブジェクト）",
    editor_config_doc:
      "/// プロパティパネル設定 - Studio Proでウィジェットプロパティの表示/非表示を制御",

    // editor_preview.gleam
    editor_preview_1: "// Mendix Studio Proデザインビュープレビュー",
    editor_preview_2:
      "// Studio Proでウィジェットのビジュアルプレビューをレンダリング",
    editor_preview_doc:
      "/// Studio Proデザインビュープレビュー - ウィジェットのビジュアル表現をレンダリング",

    // components/hello_world.gleam
    hello_world_1: "// Hello Worldコンポーネント",
    hello_world_2:
      "// ウィジェットランタイムとStudio Proプレビューで共有",
    hello_world_doc: "/// Hello World UIのレンダリング",

    // _gitignore
    gitignore_deps: "# 依存関係",
    gitignore_lockfiles: "# パッケージマネージャーlockファイル",
    gitignore_pm_cache: "# パッケージマネージャーキャッシュ/設定",
    gitignore_gleam_build: "# Gleamコンパイル出力",
    gitignore_mendix_build: "# Mendixウィジェットビルド出力",
    gitignore_env: "# 環境変数",
    gitignore_logs: "# ログ",
    gitignore_os: "# OS",
    gitignore_ide: "# IDE",
    gitignore_test_project: "# Mendixテストプロジェクト",
    gitignore_test_artifacts: "# テスト成果物",
    gitignore_bridge:
      "# 自動生成ブリッジファイル（glendixがビルド時に生成/削除）",
    gitignore_ai: "# AI",
    gitignore_marketplace: "# Mendix marketplaceキャッシュ/設定",
  },
};

/**
 * Get template comment translations for the given language.
 * Used for {{I18N:*}} placeholder replacement in template files.
 */
export function getTemplateComments(lang) {
  return templateComments[lang] ?? templateComments["en"];
}
