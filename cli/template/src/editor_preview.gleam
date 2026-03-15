{{I18N:editor_preview_1}}
{{I18N:editor_preview_2}}

import components/hello_world
import glendix/mendix
import glendix/react.{type JsProps, type ReactElement}

{{I18N:editor_preview_doc}}
pub fn preview(props: JsProps) -> ReactElement {
  let sample_text = mendix.get_string_prop(props, "sampleText")
  hello_world.render(sample_text)
}
