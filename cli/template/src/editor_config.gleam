{{I18N:editor_config_1}}
{{I18N:editor_config_2}}

import glendix/editor_config.{type Properties}
import mendraw/mendix.{type JsProps}

{{I18N:editor_config_doc}}
pub fn get_properties(
  _values: JsProps,
  default_properties: Properties,
  _platform: String,
) -> Properties {
  default_properties
}
