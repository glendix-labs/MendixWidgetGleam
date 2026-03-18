/**
 * CLAUDE.md template — always generated in English.
 * Only the Code Style comment language instruction varies by lang.
 */

const COMMENT_LANG_INSTRUCTIONS = {
  en: "Use English comments",
  ko: "Use Korean comments",
  ja: "Use Japanese comments",
};

export function generateClaudeMdContent(lang, names, pm, pmConfig, organization) {
  const commentInstruction =
    COMMENT_LANG_INSTRUCTIONS[lang] ?? COMMENT_LANG_INSTRUCTIONS["en"];

  return `# ${names.pascalCase}

A project for developing Mendix Pluggable Widgets with Gleam. Widgets are implemented using only Gleam + [glendix](https://hexdocs.pm/glendix/) bindings, without JSX.

## Commands

\`\`\`bash
gleam run -m glendix/install      # Install dependencies (Gleam deps + npm + bindings.json code generation)
gleam run -m glendix/build        # Production build (.mpk output)
gleam run -m glendix/dev          # Dev server (HMR, port 3000)
gleam run -m glendix/start        # Link with Mendix test project
gleam run -m glendix/release      # Release build
gleam run -m glendix/lint         # Run ESLint
gleam run -m glendix/lint_fix     # ESLint auto-fix
gleam run -m glendix/marketplace  # Search/download Marketplace widgets
gleam test                        # Run tests
gleam format                      # Format code
\`\`\`

If you add external React packages to bindings.json, install the npm package manually before running \`glendix/install\`.

## Hard Rules

IMPORTANT: Breaking these rules will break the build or compromise the architecture.

- **Do not write JSX/JS files directly.** All widget logic and UI must be written in Gleam
- **Do not write FFI files (.mjs) in the widget project.** React/Mendix FFI is provided by the glendix package
- **Do not manually manage bridge JS files (src/*.js).** glendix auto-generates/deletes them at build time
- **React bindings use \`redraw\`/\`redraw_dom\` packages.** glendix v3.0 no longer provides React bindings directly
- The Gleam compilation output path (\`build/dev/javascript/{gleam.toml name}/\`) must match the Rollup input path
- Mendix widget names allow only alphabetic characters (a-zA-Z)

## Code Style

- Format with \`gleam format\`
- ${commentInstruction}
- Do not manually edit compiled JS output (\`build/\`)

## Architecture

Widget entry point signature: \`pub fn widget(props: JsProps) -> Element\` — identical to a React functional component. \`JsProps\` from \`glendix/mendix\`, \`Element\` from \`redraw\`.

- \`src/${names.snakeCase}.gleam\` — Main widget (called by Mendix runtime)
- \`src/editor_config.gleam\` — Studio Pro property panel configuration
- \`src/editor_preview.gleam\` — Studio Pro design view preview
- \`src/components/\` — Shared components
- \`src/${names.pascalCase}.xml\` — Widget property definitions. Adding \`<property>\` triggers automatic type generation by the build tool
- \`src/package.xml\` — Mendix package manifest
- \`bindings.json\` — External React component binding configuration
- \`widgets/\` — .mpk widget file bindings (used via \`glendix/widget\`)

## Build Pipeline

\`\`\`
src/*.gleam → gleam build → build/dev/javascript/**/*.mjs → Bridge JS (auto-generated) → Rollup → dist/**/*.mpk
\`\`\`

## Mendix Widget Conventions

- Widget ID: \`${organization}.${names.lowerCase}.${names.pascalCase}\`
- \`packagePath: "${organization}"\` in \`package.json\` determines the deployment path
- \`needsEntityContext="true"\` → Requires Mendix data context
- \`offlineCapable="true"\` → Offline support
- \`.mpk\` output: \`dist/\` directory
- Test project: \`./tests/testProject\`

## Key Concepts

- Mendix props (\`JsProps\`) are accessed via \`mendix.get_prop\`/\`mendix.get_string_prop\` etc.
- Mendix complex types (\`EditableValue\`, \`ActionValue\`, \`ListValue\`) are opaque types with FFI accessors
- JS \`undefined\` ↔ Gleam \`Option\` conversion is handled automatically at the FFI boundary
- HTML elements use \`redraw/dom/html\`, attributes use \`redraw/dom/attribute\`, events use \`redraw/dom/events\`
- lustre TEA pattern is supported via \`glendix/lustre\` bridge (optional)
- Gleam tuples \`#(a, b)\` = JS \`[a, b]\` — directly compatible with \`useState\` return values

## Reference Docs

For detailed glendix API and Gleam syntax, see:

- docs/glendix_guide.md — Complete React/Mendix bindings guide (elements, Hooks, events, Mendix types, practical patterns, troubleshooting)
- docs/gleam_language_tour.md — Gleam syntax reference (types, pattern matching, FFI, use keyword, etc.)

## Mendix Documentation Sources

docs.mendix.com is not accessible. Use GitHub raw sources:

- Pluggable Widgets API: \`https://github.com/mendix/docs/blob/development/content/en/docs/apidocs-mxsdk/apidocs/pluggable-widgets/\`
- Build tools source: \`https://github.com/mendix/widgets-tools\`
- Official widget examples: \`https://github.com/mendix/web-widgets\`
`;
}
