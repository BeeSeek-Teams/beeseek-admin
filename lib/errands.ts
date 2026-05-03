import api from './api';

export interface ErrandPushMetricTotals {
  requests_total: number;
  candidates_total: number;
  matched_radius_total: number;
  sent_total: number;
  skipped_invalid_stop: number;
  skipped_linked_or_self: number;
  skipped_push_disabled: number;
  skipped_no_token: number;
  skipped_no_coords: number;
  skipped_out_of_radius: number;
  skipped_dedup: number;
  skipped_cooldown: number;
}

export interface ErrandPushMetricsResponse {
  windowDays: number;
  totals: ErrandPushMetricTotals;
  byDay: Array<{ day: string } & ErrandPushMetricTotals>;
}

export const getErrandPushMetrics = async (days = 7): Promise<ErrandPushMetricsResponse> => {
  const response = await api.get('/errands/admin/push-metrics', { params: { days } });
  return response.data;
};

