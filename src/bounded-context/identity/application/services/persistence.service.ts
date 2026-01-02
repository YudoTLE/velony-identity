export abstract class PersistenceService {
  public abstract transaction<T>(callback: () => Promise<T>): Promise<T>;
}
