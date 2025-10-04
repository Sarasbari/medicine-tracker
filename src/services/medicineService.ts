export interface Medicine {
  id?: number;
  name: string;
  dosage: string;
  frequency: string;
  intakeTimes: string[];
  stock: number;
  threshold: number;
  notes?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicineStats {
  activeMedicines: number;
  lowStockMedicines: number;
}

class MedicineService {
  private readonly STORAGE_KEY = 'medicines_data';
  private readonly COUNTER_KEY = 'medicines_counter';

  // Helper to get medicines from localStorage
  private getMedicinesFromStorage(): Medicine[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Helper to save medicines to localStorage
  private saveMedicinesToStorage(medicines: Medicine[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(medicines));
  }

  // Helper to get and increment ID counter
  private getNextId(): number {
    const counter = localStorage.getItem(this.COUNTER_KEY);
    const nextId = counter ? parseInt(counter) + 1 : 1;
    localStorage.setItem(this.COUNTER_KEY, nextId.toString());
    return nextId;
  }

  async getAllMedicines(): Promise<Medicine[]> {
    return Promise.resolve(this.getMedicinesFromStorage());
  }

  async getMedicineById(id: number): Promise<Medicine> {
    const medicines = this.getMedicinesFromStorage();
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) {
      throw new Error(`Medicine with id ${id} not found`);
    }
    return Promise.resolve(medicine);
  }

  async createMedicine(medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medicine> {
    const medicines = this.getMedicinesFromStorage();
    const now = new Date().toISOString();
    const newMedicine: Medicine = {
      ...medicine,
      id: this.getNextId(),
      createdAt: now,
      updatedAt: now,
    };
    medicines.push(newMedicine);
    this.saveMedicinesToStorage(medicines);
    return Promise.resolve(newMedicine);
  }

  async updateMedicine(id: number, medicineUpdate: Partial<Medicine>): Promise<Medicine> {
    const medicines = this.getMedicinesFromStorage();
    const index = medicines.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error(`Medicine with id ${id} not found`);
    }
    const updatedMedicine = {
      ...medicines[index],
      ...medicineUpdate,
      updatedAt: new Date().toISOString(),
    };
    medicines[index] = updatedMedicine;
    this.saveMedicinesToStorage(medicines);
    return Promise.resolve(updatedMedicine);
  }

  async deleteMedicine(id: number): Promise<void> {
    const medicines = this.getMedicinesFromStorage();
    const filtered = medicines.filter(m => m.id !== id);
    this.saveMedicinesToStorage(filtered);
    return Promise.resolve();
  }

  async takeMedicine(id: number): Promise<Medicine> {
    const medicines = this.getMedicinesFromStorage();
    const index = medicines.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error(`Medicine with id ${id} not found`);
    }
    if (medicines[index].stock > 0) {
      medicines[index].stock -= 1;
      medicines[index].updatedAt = new Date().toISOString();
    }
    this.saveMedicinesToStorage(medicines);
    return Promise.resolve(medicines[index]);
  }

  async restockMedicine(id: number, quantity: number): Promise<Medicine> {
    const medicines = this.getMedicinesFromStorage();
    const index = medicines.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error(`Medicine with id ${id} not found`);
    }
    medicines[index].stock += quantity;
    medicines[index].updatedAt = new Date().toISOString();
    this.saveMedicinesToStorage(medicines);
    return Promise.resolve(medicines[index]);
  }

  async getLowStockMedicines(): Promise<Medicine[]> {
    const medicines = this.getMedicinesFromStorage();
    return Promise.resolve(medicines.filter(m => m.stock <= m.threshold));
  }

  async searchMedicines(name: string): Promise<Medicine[]> {
    const medicines = this.getMedicinesFromStorage();
    const searchTerm = name.toLowerCase();
    return Promise.resolve(
      medicines.filter(m => m.name.toLowerCase().includes(searchTerm))
    );
  }

  async getMedicineStats(): Promise<MedicineStats> {
    const medicines = this.getMedicinesFromStorage();
    return Promise.resolve({
      activeMedicines: medicines.filter(m => m.active).length,
      lowStockMedicines: medicines.filter(m => m.stock <= m.threshold).length,
    });
  }
}

export const medicineService = new MedicineService();
