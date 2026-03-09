// Mendix Reference 타입 — 연관 관계 (Association) 값
// ReferenceValue: 단일 참조, ReferenceSetValue: 다중 참조
// 둘 다 ModifiableValue 패턴을 따름

import gleam/option.{type Option}

// === 타입 ===

pub type ReferenceValue

pub type ReferenceSetValue

// === ReferenceValue (단일 참조) ===

/// 참조 값 (없으면 None)
@external(javascript, "../mendix_ffi.mjs", "get_modifiable_value")
pub fn value(ref: ReferenceValue) -> Option(a)

/// 참조 설정 (None → 참조 해제)
@external(javascript, "../mendix_ffi.mjs", "modifiable_set_value")
pub fn set_value(ref: ReferenceValue, value: Option(a)) -> Nil

/// 읽기 전용 여부
@external(javascript, "../mendix_ffi.mjs", "get_modifiable_read_only")
pub fn read_only(ref: ReferenceValue) -> Bool

/// 유효성 검사 메시지 (없으면 None)
@external(javascript, "../mendix_ffi.mjs", "get_modifiable_validation")
pub fn validation(ref: ReferenceValue) -> Option(String)

// === ReferenceSetValue (다중 참조) ===

/// 참조 목록 (없으면 None) — JS Array↔Gleam List 변환 포함
@external(javascript, "../mendix_ffi.mjs", "get_reference_set_value")
pub fn multi_value(rset: ReferenceSetValue) -> Option(List(a))

/// 참조 목록 설정 (None → 전체 해제) — Gleam List→JS Array 변환 포함
@external(javascript, "../mendix_ffi.mjs", "set_reference_set_value")
pub fn set_multi_value(rset: ReferenceSetValue, value: Option(List(a))) -> Nil

/// 읽기 전용 여부
@external(javascript, "../mendix_ffi.mjs", "get_modifiable_read_only")
pub fn multi_read_only(rset: ReferenceSetValue) -> Bool

/// 유효성 검사 메시지 (없으면 None)
@external(javascript, "../mendix_ffi.mjs", "get_modifiable_validation")
pub fn multi_validation(rset: ReferenceSetValue) -> Option(String)
