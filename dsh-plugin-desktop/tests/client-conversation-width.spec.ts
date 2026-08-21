import { describe, expect, it } from 'vitest'
import {
  DESKTOP_CHAT_CONTENT_MAX_PX,
  DESKTOP_CHAT_CONTENT_MIN_PX,
  DESKTOP_CHAT_CONTENT_PREFERRED_VW,
  DESKTOP_CONVERSATION_WIDTH_RULES,
  resolveDesktopChatContentWidth,
} from '../src/client/styles.ts'

describe('desktop conversation width override', () => {
  it('scopes the override to the upstream conversation root under the desktop shell marker', () => {
    // The attribute selector lifts specificity above the upstream single-class
    // `.wSkVaW_root` declaration that pins `--dsh-chat-content-width: 748px`.
    expect(DESKTOP_CONVERSATION_WIDTH_RULES).toContain('[data-dsh-desktop-shell] .wSkVaW_root')
  })

  it('declares a responsive clamp for the chat-content-width token', () => {
    const match = DESKTOP_CONVERSATION_WIDTH_RULES.match(
      /--dsh-chat-content-width:\s*clamp\((\d+)px,\s*(\d+)vw,\s*(\d+)px\)/,
    )
    expect(match).not.toBeNull()
    const [, minStr, preferredStr, maxStr] = match!
    expect(Number(minStr)).toBe(DESKTOP_CHAT_CONTENT_MIN_PX)
    expect(Number(preferredStr)).toBe(DESKTOP_CHAT_CONTENT_PREFERRED_VW)
    expect(Number(maxStr)).toBe(DESKTOP_CHAT_CONTENT_MAX_PX)
  })

  it('keeps the upstream default on a non-maximized window and widens the dialog on maximize', () => {
    // 1280px default window: 56vw falls below the floor, so the upstream default wins.
    expect(resolveDesktopChatContentWidth(1280)).toBe(DESKTOP_CHAT_CONTENT_MIN_PX)
    // A maximized wide window widens the dialog beyond the upstream default.
    const maximized = resolveDesktopChatContentWidth(1920)
    expect(maximized).toBeGreaterThan(DESKTOP_CHAT_CONTENT_MIN_PX)
    expect(maximized).toBeLessThanOrEqual(DESKTOP_CHAT_CONTENT_MAX_PX)
    // Wider viewports keep widening until the readability cap.
    expect(resolveDesktopChatContentWidth(2560)).toBeGreaterThanOrEqual(maximized)
    expect(resolveDesktopChatContentWidth(2560)).toBeLessThanOrEqual(DESKTOP_CHAT_CONTENT_MAX_PX)
    // Very wide monitors are capped for readability.
    expect(resolveDesktopChatContentWidth(4096)).toBe(DESKTOP_CHAT_CONTENT_MAX_PX)
  })

  it('never reports a width below the floor or above the cap', () => {
    expect(resolveDesktopChatContentWidth(0)).toBe(DESKTOP_CHAT_CONTENT_MIN_PX)
    expect(resolveDesktopChatContentWidth(Number.MAX_SAFE_INTEGER)).toBe(DESKTOP_CHAT_CONTENT_MAX_PX)
  })
})
