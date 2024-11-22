import moment from 'moment';

export function formatConnectionTime(dateString: string): string {
  return moment(dateString).format('h:mma - D MMM, YYYY');
}
