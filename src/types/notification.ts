//Interface para Notification

export interface NotificationAppointmentRef {
  id: number;
  date: string | Date;
  status?: string | null;
  service?: { name: string } | null;
  employee?: { name: string } | null;
  client?: { name: string } | null;
}

export interface Notification {
  id: number;
  subject: string;
  time: string;
  read: boolean;
  appointment?: NotificationAppointmentRef;
  createdAt?: string | Date;
}