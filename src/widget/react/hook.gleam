// React Hooks - useState, useEffect 등

import widget/react.{type Ref}

// === useState ===

/// 상태 훅. #(현재값, 세터함수) 튜플 반환
@external(javascript, "../react_ffi.mjs", "use_state")
pub fn use_state(initial: a) -> #(a, fn(a) -> Nil)

// === useEffect ===

/// 의존성 배열과 함께 실행
@external(javascript, "../react_ffi.mjs", "use_effect")
pub fn use_effect(effect_fn: fn() -> Nil, deps: List(a)) -> Nil

/// 매 렌더링마다 실행 (deps 없음)
@external(javascript, "../react_ffi.mjs", "use_effect_always")
pub fn use_effect_always(effect_fn: fn() -> Nil) -> Nil

/// 마운트 시 한 번만 실행 (deps = [])
@external(javascript, "../react_ffi.mjs", "use_effect_once")
pub fn use_effect_once(effect_fn: fn() -> Nil) -> Nil

// === useEffect (cleanup 반환) ===
// Gleam fn() -> fn() -> Nil = JS에서 함수를 반환하는 함수 → React cleanup으로 인식

/// 의존성 배열과 함께 실행 (cleanup 함수 반환)
@external(javascript, "../react_ffi.mjs", "use_effect")
pub fn use_effect_cleanup(setup: fn() -> fn() -> Nil, deps: List(a)) -> Nil

/// 매 렌더링마다 실행 + cleanup
@external(javascript, "../react_ffi.mjs", "use_effect_always")
pub fn use_effect_always_cleanup(setup: fn() -> fn() -> Nil) -> Nil

/// 마운트 시 한 번만 실행 + cleanup
@external(javascript, "../react_ffi.mjs", "use_effect_once")
pub fn use_effect_once_cleanup(setup: fn() -> fn() -> Nil) -> Nil

// === useMemo / useCallback ===

/// 메모이제이션된 값 계산
@external(javascript, "../react_ffi.mjs", "use_memo")
pub fn use_memo(compute: fn() -> a, deps: List(b)) -> a

/// 메모이제이션된 콜백
@external(javascript, "../react_ffi.mjs", "use_callback")
pub fn use_callback(callback: fn(a) -> b, deps: List(c)) -> fn(a) -> b

// === useRef ===

/// ref 생성
@external(javascript, "../react_ffi.mjs", "use_ref")
pub fn use_ref(initial: a) -> Ref(a)

/// ref 현재 값 읽기
@external(javascript, "../react_ffi.mjs", "get_ref_current")
pub fn get_ref(ref: Ref(a)) -> a

/// ref 현재 값 설정
@external(javascript, "../react_ffi.mjs", "set_ref_current")
pub fn set_ref(ref: Ref(a), value: a) -> Nil
