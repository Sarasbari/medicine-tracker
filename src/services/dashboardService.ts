import { medicineService, Medicine } from './medicineService';
import { appointmentService, Appointment } from './appointmentService';

export interface Reminder {
  id?: number;
  medicine: Medicine;
  reminderTime: string;
  taken: boolean;
  active: boolean;
  takenAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  activeMedicines: number;
  lowStockMedicines: number;
  todaysPendingReminders: number;
  todaysTakenReminders: number;
  upcomingReminders: number;
  upcomingAppointments: number;
  todaysDoseCompletion: string;
}

export interface DashboardData {
  stats: DashboardStats;
  upcomingReminders: Reminder[];
  nextAppointment: Appointment | null;
  lowStockMedicines: Medicine[];
  overdueReminders: Reminder[];
}

class DashboardService {
  private getRemindersFromStorage(): Reminder[] {
    const data = localStorage.getItem('reminders_dashboard');
    return data ? JSON.parse(data) : [];
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const medicines = await medicineService.getAllMedicines();
    const appointments = await appointmentService.getAllAppointments();
    const reminders = this.getRemindersFromStorage();
    
    const activeMedicines = medicines.filter(m => m.active).length;
    const lowStockMedicines = medicines.filter(m => m.stock <= m.threshold).length;
    const upcomingAppointments = appointments.filter(a => a.status === 'UPCOMING').length;
    
    const today = new Date().toDateString();
    const todaysReminders = reminders.filter(r => 
      new Date(r.reminderTime).toDateString() === today
    );
    const todaysTaken = todaysReminders.filter(r => r.taken).length;
    const todaysPending = todaysReminders.length - todaysTaken;
    const upcomingReminders = reminders.filter(r => 
      !r.taken && new Date(r.reminderTime) > new Date()
    ).length;
    
    const completion = todaysReminders.length > 0 
      ? `${todaysTaken}/${todaysReminders.length}`
      : '0/0';

    return Promise.resolve({
      activeMedicines,
      lowStockMedicines,
      todaysPendingReminders: todaysPending,
      todaysTakenReminders: todaysTaken,
      upcomingReminders,
      upcomingAppointments,
      todaysDoseCompletion: completion,
    });
  }

  async getDashboardData(): Promise<DashboardData> {
    const medicines = await medicineService.getAllMedicines();
    const appointments = await appointmentService.getAllAppointments();
    const reminders = this.getRemindersFromStorage();
    
    const stats = await this.getDashboardStats();
    
    const now = new Date();
    const upcomingReminders = reminders
      .filter(r => !r.taken && new Date(r.reminderTime) > now)
      .sort((a, b) => new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime())
      .slice(0, 5);
    
    const overdueReminders = reminders.filter(r => 
      !r.taken && new Date(r.reminderTime) < now
    );
    
    const lowStockMedicines = medicines.filter(m => m.stock <= m.threshold);
    
    const upcomingAppointments = appointments
      .filter(a => a.status === 'UPCOMING')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

    return Promise.resolve({
      stats,
      upcomingReminders,
      nextAppointment,
      lowStockMedicines,
      overdueReminders,
    });
  }
}

export const dashboardService = new DashboardService();
