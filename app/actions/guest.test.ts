import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginAsGuest, clearGuestSession } from './guest';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Guest Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loginAsGuest: should set the cookies and redirect to the dashboard', async () => {
    const mockSet = vi.fn();
    vi.mocked(cookies).mockResolvedValue({ set: mockSet } as any);

    await loginAsGuest('en');

    expect(mockSet).toHaveBeenCalledWith(
      'gloo_is_guest',
      'true',
      expect.objectContaining({ path: '/', httpOnly: true })
    );

    expect(mockSet).toHaveBeenCalledWith(
      'gloo_guest_id',
      expect.any(String),
      expect.any(Object)
    );

    expect(redirect).toHaveBeenCalledWith('/en/dashboard');
  });

  it('clearGuestSession: should delete guest cookies', async () => {
    const mockDelete = vi.fn();
    vi.mocked(cookies).mockResolvedValue({ delete: mockDelete } as any);

    await clearGuestSession();

    expect(mockDelete).toHaveBeenCalledWith('gloo_is_guest');
    expect(mockDelete).toHaveBeenCalledWith('gloo_guest_id');
  });
});