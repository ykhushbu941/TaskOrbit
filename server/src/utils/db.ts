import fs from 'fs-extra';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../db.json');

const INITIAL_DATA = {
  users: [],
  projects: [],
  tasks: [],
  issues: [],
  messages: [],
  notifications: [],
  activityLog: [],
  tags: [
    { id: '1', name: 'Design', color: '#E8D5B7' },
    { id: '2', name: 'Bug', color: '#E05C5C' },
    { id: '3', name: 'Urgent', color: '#E8A838' }
  ]
};

export class DB {
  private static async read() {
    try {
      if (!fs.existsSync(DB_PATH)) {
        await fs.writeJson(DB_PATH, INITIAL_DATA, { spaces: 2 });
        return INITIAL_DATA;
      }
      return await fs.readJson(DB_PATH);
    } catch (error) {
      console.error('Error reading DB:', error);
      return INITIAL_DATA;
    }
  }

  private static async write(data: any) {
    await fs.writeJson(DB_PATH, data, { spaces: 2 });
  }

  static async find(collection: string, query?: (item: any) => boolean) {
    const data = await this.read();
    const items = data[collection] || [];
    return query ? items.filter(query) : items;
  }

  static async findOne(collection: string, query: (item: any) => boolean) {
    const items = await this.find(collection);
    return items.find(query);
  }

  static async insert(collection: string, item: any) {
    const data = await this.read();
    if (!data[collection]) data[collection] = [];
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data[collection].push(newItem);
    await this.write(data);
    return newItem;
  }

  static async update(collection: string, id: string, updates: any) {
    const data = await this.read();
    const index = data[collection].findIndex((item: any) => item.id === id);
    if (index === -1) return null;
    data[collection][index] = { ...data[collection][index], ...updates, updatedAt: new Date().toISOString() };
    await this.write(data);
    return data[collection][index];
  }

  static async delete(collection: string, id: string) {
    const data = await this.read();
    const index = data[collection].findIndex((item: any) => item.id === id);
    if (index === -1) return false;
    data[collection].splice(index, 1);
    await this.write(data);
    return true;
  }
}
