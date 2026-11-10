import { useCallback, useState } from 'react';
import { useAsync } from '../../../shared/hooks/useAsync';
import { getErrorMessage } from '../../../shared/utils/errors';
import { appointmentApi } from '../services/appointmentApi';

/** Lịch khám của người đăng nhập kèm hành động đổi trạng thái (xác nhận, từ chối, hoàn thành, hủy). */
export function useAppointments() {
  const { data, loading, error, reload } = useAsync(appointmentApi.getAll);
  const [pendingId, setPendingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const changeStatus = useCallback(
    async (id, status) => {
      setPendingId(id);
      setActionError('');

      try {
        await appointmentApi.updateStatus(id, status);
      } catch (err) {
        setActionError(getErrorMessage(err, 'Không thể cập nhật trạng thái lịch khám.'));
      } finally {
        // Tải lại cả khi lỗi để danh sách phản ánh đúng trạng thái mới nhất trên máy chủ.
        reload();
        setPendingId(null);
      }
    },
    [reload],
  );

  return {
    appointments: data ?? [],
    loading: loading && !data,
    error,
    pendingId,
    actionError,
    changeStatus,
  };
}
