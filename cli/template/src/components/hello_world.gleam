{{I18N:hello_world_1}}
{{I18N:hello_world_2}}

import redraw.{type Element}
import redraw/dom/attribute
import redraw/dom/html

{{I18N:hello_world_doc}}
pub fn render(sample_text: String) -> Element {
  html.div([attribute.class("widget-hello-world")], [
    html.text("Hello " <> sample_text),
  ])
}
