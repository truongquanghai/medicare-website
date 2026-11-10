import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { APPOINTMENT_STATUS as S, ROLES, canRoleSetStatus, canTransition } from '../src/constants/appointment.js';

describe('quy tắc chuyển trạng thái lịch khám', () => {
  it('cho phép luồng xác nhận → hoàn thành', () => {
    assert.equal(canTransition(S.PENDING, S.CONFIRMED), true);
    assert.equal(canTransition(S.CONFIRMED, S.COMPLETED), true);
  });

  it('không cho đổi trạng thái của lịch đã kết thúc', () => {
    for (const finalStatus of [S.COMPLETED, S.CANCELLED, S.REJECTED]) {
      for (const target of Object.values(S)) {
        assert.equal(canTransition(finalStatus, target), false, `${finalStatus} → ${target}`);
      }
    }
  });

  it('không cho hoàn thành lịch chưa được xác nhận', () => {
    assert.equal(canTransition(S.PENDING, S.COMPLETED), false);
  });

  it('bệnh nhân chỉ được hủy lịch', () => {
    assert.equal(canRoleSetStatus(ROLES.PATIENT, S.CANCELLED), true);
    assert.equal(canRoleSetStatus(ROLES.PATIENT, S.CONFIRMED), false);
  });

  it('bác sĩ xác nhận, từ chối, hoàn thành nhưng không hủy thay bệnh nhân', () => {
    assert.equal(canRoleSetStatus(ROLES.DOCTOR, S.CONFIRMED), true);
    assert.equal(canRoleSetStatus(ROLES.DOCTOR, S.REJECTED), true);
    assert.equal(canRoleSetStatus(ROLES.DOCTOR, S.COMPLETED), true);
    assert.equal(canRoleSetStatus(ROLES.DOCTOR, S.CANCELLED), false);
  });

  it('không ai được đưa lịch quay về "Chờ xác nhận"', () => {
    for (const role of Object.values(ROLES)) assert.equal(canRoleSetStatus(role, S.PENDING), false);
  });
});
