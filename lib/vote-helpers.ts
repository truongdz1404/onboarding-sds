export type VoteDirection = 'up' | 'down'
export type UserVote = VoteDirection | null

/** Normalize legacy vote values from Firebase. */
export function readVote(val: unknown): 1 | -1 | null {
  if (val === true || val === 1) return 1
  if (val === -1) return -1
  // Legacy comment votes used `false` to mean "removed upvote", not downvote
  if (val === false) return null
  if (val && typeof val === 'object' && 'createdAt' in (val as object)) return 1
  return null
}

export function toUserVote(v: 1 | -1 | null): UserVote {
  if (v === 1) return 'up'
  if (v === -1) return 'down'
  return null
}

export function fromUserVote(v: VoteDirection): 1 | -1 {
  return v === 'up' ? 1 : -1
}

/** Compute score delta when changing vote state. */
export function voteDelta(current: 1 | -1 | null, target: 1 | -1): number {
  if (current === target) return -target
  return target - (current ?? 0)
}
