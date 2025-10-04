export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

class AuthService {
  private readonly USER_KEY = 'current_user';
  private readonly USERS_KEY = 'registered_users';

  // Get current logged-in user
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Get all registered users
  private getRegisteredUsers(): Array<{ email: string; password: string; user: User }> {
    const usersData = localStorage.getItem(this.USERS_KEY);
    return usersData ? JSON.parse(usersData) : [];
  }

  // Save registered users
  private saveRegisteredUsers(users: Array<{ email: string; password: string; user: User }>): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<User> {
    const users = this.getRegisteredUsers();
    const userRecord = users.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!userRecord) {
      throw new Error('Invalid email or password');
    }

    // Save current user
    localStorage.setItem(this.USER_KEY, JSON.stringify(userRecord.user));
    return Promise.resolve(userRecord.user);
  }

  // Register new user
  async register(data: RegisterData): Promise<User> {
    const users = this.getRegisteredUsers();
    
    // Check if email already exists
    if (users.some(u => u.email === data.email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      createdAt: new Date().toISOString(),
    };

    users.push({
      email: data.email,
      password: data.password,
      user: newUser,
    });

    this.saveRegisteredUsers(users);
    localStorage.setItem(this.USER_KEY, JSON.stringify(newUser));
    
    return Promise.resolve(newUser);
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));

    // Update in registered users list
    const users = this.getRegisteredUsers();
    const userIndex = users.findIndex(u => u.user.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].user = updatedUser;
      this.saveRegisteredUsers(users);
    }

    return Promise.resolve(updatedUser);
  }
}

export const authService = new AuthService();
