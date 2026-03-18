{{I18N:widget_main_1}}
{{I18N:widget_main_2}}

import components/hello_world
import glendix/mendix.{type JsProps}
import redraw.{type Element}

{{I18N:widget_main_doc}}
pub fn widget(props: JsProps) -> Element {
  let sample_text = mendix.get_string_prop(props, "sampleText")
  hello_world.render(sample_text)
}
