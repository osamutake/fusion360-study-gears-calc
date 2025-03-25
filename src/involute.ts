const { tan, abs } = Math;

// involute function
export function inv(x: number) {
  return tan(x) - x;
}

// inverse involute function
export function inverse_inv(inva: number) {
  if (inva == 0) return 0;
  if (inva < 0) return -inverse_inv(-inva);
  let a = inva > 2.4 ? Math.atan(inva) : 1.441 * inva ** (1 / 3) - 0.374 * inva;
  let a_prev = 2;
  for (let i = 0; i < 20; i++) {
    const tana = tan(a);
    a += (inva - tana + a) / tana ** 2;
    if (abs(a_prev - a) < 1e-15) return a;
    a_prev = a;
  }
  return a;
}
