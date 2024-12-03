import moment from 'moment';

export function formatDateTime(dateString: string | undefined): string {
  return dateString ? moment(dateString).format('h:mma - D MMM, YYYY') : '';
}
