// Mendix Studio Pro 디자인 뷰 미리보기
// Studio Pro에서 위젯의 시각적 미리보기를 렌더링

import components/hello_world
import glendix/mendix.{type JsProps}
import redraw.{type Element}

/// Studio Pro 디자인 뷰 미리보기 - 위젯의 시각적 표현을 렌더링
pub fn preview(props: JsProps) -> Element {
  let sample_text = mendix.get_string_prop(props, "sampleText")
  hello_world.render(sample_text)
}
