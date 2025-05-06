import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CacheManager } from "./cache-manager";

describe("CacheManager", () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager();
    vi.useFakeTimers(); // Enable fake timers
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore original timers
    vi.useRealTimers();
  });

  it("should set and get a value before TTL expires", () => {
    const key = "testKey";
    const value = { data: "testValue" };
    const ttl = 60; // 60 seconds

    cacheManager.set(key, value, ttl);
    const retrievedValue = cacheManager.get(key);

    expect(retrievedValue).toEqual(value);
  });

  it("should return null for a key that has not been set", () => {
    const retrievedValue = cacheManager.get("nonExistentKey");
    expect(retrievedValue).toBeNull();
  });

  it("should return null and delete the item if TTL has expired", () => {
    const key = "expiredKey";
    const value = "someData";
    const ttl = 30; // 30 seconds

    cacheManager.set(key, value, ttl);

    // Advance time beyond the TTL
    vi.advanceTimersByTime(31 * 1000); // Advance by 31 seconds

    const retrievedValue = cacheManager.get(key);
    expect(retrievedValue).toBeNull();

    // Try getting again to ensure it was deleted
    const retrievedValueAgain = cacheManager.get(key);
    expect(retrievedValueAgain).toBeNull();
  });

  it("should overwrite an existing key when set is called again", () => {
    const key = "overwriteKey";
    const initialValue = "initial";
    const newValue = "new";
    const ttl = 60;

    cacheManager.set(key, initialValue, ttl);
    expect(cacheManager.get(key)).toBe(initialValue);

    cacheManager.set(key, newValue, ttl);
    expect(cacheManager.get(key)).toBe(newValue);
  });

  it("should not return an expired item even if checked just before expiry", () => {
    const key = "edgeCaseKey";
    const value = { status: "pending" };
    const ttl = 10; // 10 seconds

    cacheManager.set(key, value, ttl);

    // Advance time almost to the expiry
    vi.advanceTimersByTime(9 * 1000 + 999); // 9.999 seconds
    expect(cacheManager.get(key)).toEqual(value);

    // Advance time just past the expiry
    vi.advanceTimersByTime(2); // Total 10.001 seconds
    expect(cacheManager.get(key)).toBeNull();
  });

  it("should generate a consistent key from an object", () => {
    const query1 = { param1: "a", param2: 123 };
    const query2 = { param1: "a", param2: 123 }; // Same object structure
    const query3 = { param2: 123, param1: "a" }; // Different order
    const query4 = { param1: "b", param2: 123 }; // Different value

    const key1 = cacheManager.generateKey(query1);
    const key2 = cacheManager.generateKey(query2);
    const key3 = cacheManager.generateKey(query3);
    const key4 = cacheManager.generateKey(query4);

    expect(key1).toBe(JSON.stringify(query1));
    expect(key1).toEqual(key2); // Should be equal for identical objects
    expect(key1).not.toEqual(key3); // Should differ if order differs in stringify
    expect(key1).not.toEqual(key4); // Should differ for different values
  });
});
