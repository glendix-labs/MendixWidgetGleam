// Mendix Big.js 타입 — 고정밀 십진수 Gleam opaque 래퍼
// EditableValue<BigJs.Big>에서 반환되는 Big.js 객체를 타입 안전하게 다룸

import gleam/order.{type Order, Eq, Gt, Lt}

// === 타입 ===

pub type Big

// === 생성 ===

/// 문자열로 Big 생성
@external(javascript, "../mendix_ffi.mjs", "big_from_string")
pub fn from_string(s: String) -> Big

/// 정수로 Big 생성
@external(javascript, "../mendix_ffi.mjs", "big_from_int")
pub fn from_int(n: Int) -> Big

/// 부동소수점으로 Big 생성
@external(javascript, "../mendix_ffi.mjs", "big_from_float")
pub fn from_float(f: Float) -> Big

// === 변환 ===

/// 문자열로 변환
@external(javascript, "../mendix_ffi.mjs", "big_to_string")
pub fn to_string(b: Big) -> String

/// Float로 변환 (정밀도 손실 가능)
@external(javascript, "../mendix_ffi.mjs", "big_to_float")
pub fn to_float(b: Big) -> Float

/// Int로 변환 (소수점 이하 버림)
@external(javascript, "../mendix_ffi.mjs", "big_to_int")
pub fn to_int(b: Big) -> Int

/// 고정 소수점 문자열 (소수점 이하 dp자리)
@external(javascript, "../mendix_ffi.mjs", "big_to_fixed")
pub fn to_fixed(b: Big, dp: Int) -> String

// === 산술 ===

/// 덧셈
@external(javascript, "../mendix_ffi.mjs", "big_add")
pub fn add(a: Big, b: Big) -> Big

/// 뺄셈
@external(javascript, "../mendix_ffi.mjs", "big_sub")
pub fn subtract(a: Big, b: Big) -> Big

/// 곱셈
@external(javascript, "../mendix_ffi.mjs", "big_mul")
pub fn multiply(a: Big, b: Big) -> Big

/// 나눗셈
@external(javascript, "../mendix_ffi.mjs", "big_div")
pub fn divide(a: Big, b: Big) -> Big

/// 절대값
@external(javascript, "../mendix_ffi.mjs", "big_abs")
pub fn absolute(b: Big) -> Big

/// 부호 반전
@external(javascript, "../mendix_ffi.mjs", "big_negate")
pub fn negate(b: Big) -> Big

// === 비교 ===

/// 비교 (Gleam Order 반환)
pub fn compare(a: Big, b: Big) -> Order {
  case cmp(a, b) {
    x if x < 0 -> Lt
    x if x > 0 -> Gt
    _ -> Eq
  }
}

/// 동등 비교
@external(javascript, "../mendix_ffi.mjs", "big_eq")
pub fn equal(a: Big, b: Big) -> Bool

// === 내부 FFI ===

@external(javascript, "../mendix_ffi.mjs", "big_cmp")
fn cmp(a: Big, b: Big) -> Int
