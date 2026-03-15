{{I18N:hello_world_1}}
{{I18N:hello_world_2}}

import glendix/react.{type ReactElement}
import glendix/react/attribute
import glendix/react/html

{{I18N:hello_world_doc}}
pub fn render(sample_text: String) -> ReactElement {
  html.div([attribute.class("widget-hello-world")], [
    react.text("Hello " <> sample_text),
  ])
}
