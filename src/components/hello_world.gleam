// Hello World 컴포넌트
// 위젯 런타임과 Studio Pro 미리보기에서 공유

import redraw.{type Element}
import redraw/dom/attribute
import redraw/dom/html

/// Hello World UI 렌더링
pub fn render(sample_text: String) -> Element {
  html.div([attribute.class("widget-hello-world")], [
    html.text("Hello " <> sample_text),
  ])
}
