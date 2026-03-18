{{I18N:editor_preview_1}}
{{I18N:editor_preview_2}}

import components/hello_world
import glendix/mendix.{type JsProps}
import redraw.{type Element}

{{I18N:editor_preview_doc}}
pub fn preview(props: JsProps) -> Element {
  let sample_text = mendix.get_string_prop(props, "sampleText")
  hello_world.render(sample_text)
}
