import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildSlots,
  getClinicNow,
  isSlotInPast,
  isValidDate,
  isWorkingDay,
  toMinutes,
  toTimeString,
} from '../src/utils/schedule.js';

describe('schedule utils', () => {
  it('đổi qua lại giữa chuỗi giờ và số phút', () => {
    assert.equal(toMinutes('08:30'), 510);
    assert.equal(toTimeString(510), '08:30');
    assert.equal(toTimeString(0), '00:00');
  });

  it('tạo khung giờ 30 phút và không gồm giờ kết thúc', () => {
    assert.deepEqual(buildSlots('08:00', '10:00'), ['08:00', '08:30', '09:00', '09:30']);
  });

  it('bỏ khung cuối nếu không đủ trọn 30 phút', () => {
    assert.deepEqual(buildSlots('08:00', '09:15'), ['08:00', '08:30']);
  });

  it('nhận diện ngày làm việc theo mã T2..CN', () => {
    // 2026-11-09 là thứ Hai, 2026-11-08 là Chủ nhật.
    assert.equal(isWorkingDay('T2,T3,T4,T5,T6', '2026-11-09'), true);
    assert.equal(isWorkingDay('T2,T3,T4,T5,T6', '2026-11-08'), false);
    assert.equal(isWorkingDay('CN', '2026-11-08'), true);
  });

  it('kiểm tra định dạng và tính hợp lệ của ngày', () => {
    assert.equal(isValidDate('2026-11-09'), true);
    assert.equal(isValidDate('2026-02-30'), false);
    assert.equal(isValidDate('09/11/2026'), false);
    assert.equal(isValidDate(undefined), false);
  });

  it('tính ngày hiện tại theo múi giờ Việt Nam', () => {
    // 20:00 UTC ngày 8/11 đã là 03:00 ngày 9/11 ở Việt Nam.
    assert.deepEqual(getClinicNow(new Date('2026-11-08T20:00:00Z')), { date: '2026-11-09', minutes: 180 });
  });

  it('coi khung giờ đã qua là không còn đặt được', () => {
    const now = { date: '2026-11-09', minutes: toMinutes('09:00') };
    assert.equal(isSlotInPast('2026-11-08', '15:00', now), true);
    assert.equal(isSlotInPast('2026-11-09', '09:00', now), true);
    assert.equal(isSlotInPast('2026-11-09', '09:30', now), false);
    assert.equal(isSlotInPast('2026-11-10', '08:00', now), false);
  });
});
