export interface Appointment {
  id?: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  phone?: string;
  reason?: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentStats {
  upcomingAppointments: number;
}

class AppointmentService {
  private readonly STORAGE_KEY = 'appointments_data';
  private readonly COUNTER_KEY = 'appointments_counter';

  // Helper to get appointments from localStorage
  private getAppointmentsFromStorage(): Appointment[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Helper to save appointments to localStorage
  private saveAppointmentsToStorage(appointments: Appointment[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(appointments));
  }

  // Helper to get and increment ID counter
  private getNextId(): number {
    const counter = localStorage.getItem(this.COUNTER_KEY);
    const nextId = counter ? parseInt(counter) + 1 : 1;
    localStorage.setItem(this.COUNTER_KEY, nextId.toString());
    return nextId;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return Promise.resolve(this.getAppointmentsFromStorage());
  }

  async getAppointmentById(id: number): Promise<Appointment> {
    const appointments = this.getAppointmentsFromStorage();
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) {
      throw new Error(`Appointment with id ${id} not found`);
    }
    return Promise.resolve(appointment);
  }

  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const appointments = this.getAppointmentsFromStorage();
    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      ...appointment,
      id: this.getNextId(),
      createdAt: now,
      updatedAt: now,
    };
    appointments.push(newAppointment);
    this.saveAppointmentsToStorage(appointments);
    return Promise.resolve(newAppointment);
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<Appointment>): Promise<Appointment> {
    const appointments = this.getAppointmentsFromStorage();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Appointment with id ${id} not found`);
    }
    const updatedAppointment = {
      ...appointments[index],
      ...appointmentUpdate,
      updatedAt: new Date().toISOString(),
    };
    appointments[index] = updatedAppointment;
    this.saveAppointmentsToStorage(appointments);
    return Promise.resolve(updatedAppointment);
  }

  async deleteAppointment(id: number): Promise<void> {
    const appointments = this.getAppointmentsFromStorage();
    const filtered = appointments.filter(a => a.id !== id);
    this.saveAppointmentsToStorage(filtered);
    return Promise.resolve();
  }

  async getUpcomingAppointments(): Promise<Appointment[]> {
    const appointments = this.getAppointmentsFromStorage();
    return Promise.resolve(appointments.filter(a => a.status === 'UPCOMING'));
  }

  async getPastAppointments(): Promise<Appointment[]> {
    const appointments = this.getAppointmentsFromStorage();
    return Promise.resolve(appointments.filter(a => a.status !== 'UPCOMING'));
  }

  async getNextUpcomingAppointment(): Promise<Appointment | null> {
    try {
      const upcoming = await this.getUpcomingAppointments();
      if (upcoming.length === 0) return null;
      // Sort by date and return the first one
      upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return upcoming[0];
    } catch (error) {
      return null;
    }
  }

  async getAppointmentsByStatus(status: string): Promise<Appointment[]> {
    const appointments = this.getAppointmentsFromStorage();
    return Promise.resolve(appointments.filter(a => a.status === status));
  }

  async searchAppointmentsByDoctor(doctor: string): Promise<Appointment[]> {
    const appointments = this.getAppointmentsFromStorage();
    const searchTerm = doctor.toLowerCase();
    return Promise.resolve(
      appointments.filter(a => a.doctorName.toLowerCase().includes(searchTerm))
    );
  }

  async markAppointmentAsCompleted(id: number): Promise<Appointment> {
    return this.updateAppointment(id, { status: 'COMPLETED' });
  }

  async cancelAppointment(id: number): Promise<Appointment> {
    return this.updateAppointment(id, { status: 'CANCELLED' });
  }

  async getAppointmentStats(): Promise<AppointmentStats> {
    const appointments = this.getAppointmentsFromStorage();
    return Promise.resolve({
      upcomingAppointments: appointments.filter(a => a.status === 'UPCOMING').length,
    });
  }
}

export const appointmentService = new AppointmentService();
