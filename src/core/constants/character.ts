export const enum KeyAction {
  FORWARD = "FORWARD",
  BACKWARD = "BACKWARD",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  SPRINT = "SPRINT",
  JUMP = "JUMP",
}

export const CHARACTER_CONTROL_KEYS: Record<KeyAction, string[]> = {
  FORWARD: ["KeyW", "ArrowUp"] as const,
  BACKWARD: ["KeyS", "ArrowDown"] as const,
  LEFT: ["KeyA", "ArrowLeft"] as const,
  RIGHT: ["KeyD", "ArrowRight"] as const,
  SPRINT: ["ShiftLeft", "ShiftRight"] as const,
  JUMP: ["Space"] as const,
} as const;

export const KEY_TO_ACTION_MAP: Record<string, KeyAction> = Object.fromEntries(
  Object.entries(CHARACTER_CONTROL_KEYS).flatMap(([action, keys]) =>
    keys.map((key) => [key, action])
  )
) as Record<string, KeyAction>;

export const ALL_CHARACTER_CONTROL_KEYS = Object.values(
  CHARACTER_CONTROL_KEYS
).flatMap((keys) => keys);

export const CHARACTER_DIMENSIONS = {
  HEIGHT: 1.9,
  RADIUS: 0.5,
  STEP_HEIGHT: 0.4,
};

export const CHARACTER_SPEED = {
  WALK: 8,
  RUN: 20,
  JUMP: 4,
  ROTATION: 8,
};
