// Mendix Studio Pro 속성 패널 설정
// getProperties, check, getPreview 등을 정의

import glendix/editor_config.{type Properties}
import mendraw/mendix.{type JsProps}

/// 속성 패널 설정 - Studio Pro에서 위젯 속성의 가시성을 제어
pub fn get_properties(
  _values: JsProps,
  default_properties: Properties,
  _platform: String,
) -> Properties {
  default_properties
}
