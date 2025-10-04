import { Medicine } from './medicineService';

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

export interface ReminderStats {
  todaysPendingReminders: number;
  todaysTakenReminders: number;
  upcomingReminders: number;
  todaysDoseCompletion: string;
}

class ReminderService {
  private readonly STORAGE_KEY = 'reminders_dashboard';

  private getRemindersFromStorage(): Reminder[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveRemindersToStorage(reminders: Reminder[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reminders));
  }

  async getAllReminders(): Promise<Reminder[]> {
    return Promise.resolve(this.getRemindersFromStorage());
  }

  async getReminderById(id: number): Promise<Reminder> {
    const reminders = this.getRemindersFromStorage();
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) {
      throw new Error(`Reminder with id ${id} not found`);
    }
    return Promise.resolve(reminder);
  }

  async createReminder(reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reminder> {
    const reminders = this.getRemindersFromStorage();
    const now = new Date().toISOString();
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    reminders.push(newReminder);
    this.saveRemindersToStorage(reminders);
    return Promise.resolve(newReminder);
  }

  async updateReminder(id: number, reminderUpdate: Partial<Reminder>): Promise<Reminder> {
    const reminders = this.getRemindersFromStorage();
    const index = reminders.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Reminder with id ${id} not found`);
    }
    const updatedReminder = {
      ...reminders[index],
      ...reminderUpdate,
      updatedAt: new Date().toISOString(),
    };
    reminders[index] = updatedReminder;
    this.saveRemindersToStorage(reminders);
    return Promise.resolve(updatedReminder);
  }

  async deleteReminder(id: number): Promise<void> {
    const reminders = this.getRemindersFromStorage();
    const filtered = reminders.filter(r => r.id !== id);
    this.saveRemindersToStorage(filtered);
    return Promise.resolve();
  }

  async getPendingReminders(): Promise<Reminder[]> {
    const reminders = this.getRemindersFromStorage();
    return Promise.resolve(reminders.filter(r => !r.taken && r.active));
  }

  async getOverdueReminders(): Promise<Reminder[]> {
    const reminders = this.getRemindersFromStorage();
    const now = new Date();
    return Promise.resolve(
      reminders.filter(r => !r.taken && new Date(r.reminderTime) < now)
    );
  }

  async getUpcomingReminders(hours: number = 4): Promise<Reminder[]> {
    const reminders = this.getRemindersFromStorage();
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    return Promise.resolve(
      reminders.filter(r => {
        const reminderTime = new Date(r.reminderTime);
        return !r.taken && reminderTime > now && reminderTime <= futureTime;
      })
    );
  }

  async getRemindersByMedicine(medicineId: number): Promise<Reminder[]> {
    const reminders = this.getRemindersFromStorage();
    return Promise.resolve(
      reminders.filter(r => r.medicine.id === medicineId)
    );
  }

  async markReminderAsTaken(id: number): Promise<Reminder> {
    return this.updateReminder(id, { 
      taken: true, 
      takenAt: new Date().toISOString() 
    });
  }

  async getReminderStats(): Promise<ReminderStats> {
    const reminders = this.getRemindersFromStorage();
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
      todaysPendingReminders: todaysPending,
      todaysTakenReminders: todaysTaken,
      upcomingReminders,
      todaysDoseCompletion: completion,
    });
  }
}

export const reminderService = new ReminderService();
