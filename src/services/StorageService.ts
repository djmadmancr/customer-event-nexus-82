
class StorageService {
  private currentUserId: string | null = null;

  setCurrentUserId(userId: string) {
    this.currentUserId = userId;
  }

  private getUserKey(key: string): string {
    const userId = this.currentUserId || this.getCurrentUserId();
    return `${key}_${userId}`;
  }

  private getCurrentUserId(): string {
    const savedUser = localStorage.getItem('demo-auth-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        return user.uid;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return 'demo-user';
  }

  getItem(key: string): string | null {
    return localStorage.getItem(this.getUserKey(key));
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(this.getUserKey(key), value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.getUserKey(key));
  }
}

export default new StorageService();
