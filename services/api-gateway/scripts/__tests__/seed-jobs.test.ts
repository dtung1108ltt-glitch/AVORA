/**
 * Test cho logic transform dữ liệu trong scripts/seed-jobs.ts — không cần Supabase,
 * không cần OpenRouter key, chỉ kiểm tra các hàm thuần (pure function) map đúng dữ liệu.
 *
 * Chạy:
 *   cd services/api-gateway
 *   npx tsx --test scripts/__tests__/seed-jobs.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  splitList,
  computeAccessibilityScore,
  buildRequirements,
  buildAccessibilityFeatures,
  buildDescription,
  buildEmbeddingText,
  type SeedRow,
} from '../seed-jobs.js';

const sampleRow: SeedRow = {
  disability_group: 'Khuyết tật vận động',
  role: 'Nhân viên nhập liệu (Data Entry)',
  industry: 'Văn phòng / CNTT',
  description: 'Nhập, kiểm tra và xử lý dữ liệu trên máy tính',
  skills: 'Tin học văn phòng, gõ phím nhanh, cẩn thận',
  support_needed: 'Bàn làm việc phù hợp xe lăn, phần mềm hỗ trợ nếu cần',
  work_type: 'Tại nhà / Văn phòng',
  salary_range: '5 - 8',
  location: 'Toàn quốc (làm từ xa)',
  severity: 'Nhẹ - Vừa',
  source: 'vieclam24h.vn; joboko.com',
};

test('splitList: tách chuỗi phân cách bởi dấu phẩy/chấm phẩy, loại bỏ khoảng trắng thừa', () => {
  assert.deepEqual(splitList('a, b,c ;  d'), ['a', 'b', 'c', 'd']);
});

test('splitList: chuỗi rỗng -> mảng rỗng', () => {
  assert.deepEqual(splitList(''), []);
});

test('computeAccessibilityScore: severity có 2 mức + remote -> 40+15+15+15=85', () => {
  assert.equal(computeAccessibilityScore(sampleRow), 85);
});

test('computeAccessibilityScore: severity đủ 3 mức + remote -> tối đa 100 (không vượt quá)', () => {
  const row = { ...sampleRow, severity: 'Nhẹ - Vừa - Nặng' };
  assert.equal(computeAccessibilityScore(row), 100);
});

test('computeAccessibilityScore: chỉ 1 mức severity, không remote -> 40+15=55', () => {
  const row = { ...sampleRow, severity: 'Nhẹ', work_type: 'Văn phòng', location: 'Hà Nội' };
  assert.equal(computeAccessibilityScore(row), 55);
});

test('buildRequirements: lấy từ trường skills, tách thành mảng', () => {
  assert.deepEqual(buildRequirements(sampleRow), ['Tin học văn phòng', 'gõ phím nhanh', 'cẩn thận']);
});

test('buildAccessibilityFeatures: có tag nhóm khuyết tật ở đầu mảng + support_needed', () => {
  const result = buildAccessibilityFeatures(sampleRow);
  assert.equal(result[0], 'Phù hợp: Khuyết tật vận động');
  assert.ok(result.includes('Bàn làm việc phù hợp xe lăn'));
  assert.ok(result.includes('phần mềm hỗ trợ nếu cần'));
});

test('buildDescription: gộp mô tả + ngành + mức độ phù hợp', () => {
  const result = buildDescription(sampleRow);
  assert.ok(result.includes('Nhập, kiểm tra và xử lý dữ liệu trên máy tính'));
  assert.ok(result.includes('Văn phòng / CNTT'));
  assert.ok(result.includes('Nhẹ - Vừa'));
});

test('buildEmbeddingText: gộp đủ các trường quan trọng để embed, không rỗng', () => {
  const result = buildEmbeddingText(sampleRow);
  assert.ok(result.includes('Nhân viên nhập liệu'));
  assert.ok(result.includes('Khuyết tật vận động'));
  assert.ok(result.length > 20);
});