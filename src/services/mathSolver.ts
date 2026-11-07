/**
 * Bộ giải toán chạy trên trình duyệt, không dùng eval.
 * Hỗ trợ: + - * / ^ ! %, ngoặc, nhân ngầm (2x, 3(4+1)), hằng số pi/e,
 * hàm sqrt, cbrt, abs, sin, cos, tan, ln, log (cơ số 10), exp, round, floor, ceil
 * và phương trình một ẩn x bậc nhất / bậc hai.
 */

export type MathResult = { ok: true; text: string } | { ok: false; error: string };

type Vars = Record<string, number>;

const FUNCS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
};
const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E };

class Parser {
  private pos = 0;
  constructor(private s: string, private vars: Vars) {}

  parse(): number {
    const v = this.expr();
    this.ws();
    if (this.pos < this.s.length) throw new Error(`Ký tự không hợp lệ: "${this.s[this.pos]}"`);
    return v;
  }
  private ws() {
    while (this.s[this.pos] === ' ') this.pos++;
  }
  private peek(): string | undefined {
    this.ws();
    return this.s[this.pos];
  }
  private expr(): number {
    let v = this.term();
    for (;;) {
      const c = this.peek();
      if (c === '+') { this.pos++; v += this.term(); }
      else if (c === '-') { this.pos++; v -= this.term(); }
      else return v;
    }
  }
  private term(): number {
    let v = this.unary();
    for (;;) {
      const c = this.peek();
      if (c === '*') { this.pos++; v *= this.unary(); }
      else if (c === '/') {
        this.pos++;
        const d = this.unary();
        if (d === 0) throw new Error('Không thể chia cho 0');
        v /= d;
      } else if (c !== undefined && /[a-z(]/.test(c)) v *= this.power(); // nhân ngầm
      else return v;
    }
  }
  private unary(): number {
    const c = this.peek();
    if (c === '-') { this.pos++; return -this.unary(); }
    if (c === '+') { this.pos++; return this.unary(); }
    return this.power();
  }
  private power(): number {
    const base = this.postfix();
    if (this.peek() === '^') { this.pos++; return Math.pow(base, this.unary()); }
    return base;
  }
  private postfix(): number {
    let v = this.factor();
    for (;;) {
      const c = this.peek();
      if (c === '!') {
        this.pos++;
        if (!Number.isInteger(v) || v < 0 || v > 170) throw new Error('Giai thừa chỉ áp dụng cho số nguyên từ 0 đến 170');
        let r = 1;
        for (let i = 2; i <= v; i++) r *= i;
        v = r;
      } else if (c === '%') { this.pos++; v /= 100; }
      else return v;
    }
  }
  private factor(): number {
    const c = this.peek();
    if (c === undefined) throw new Error('Biểu thức chưa đầy đủ');
    if (c === '(') {
      this.pos++;
      const v = this.expr();
      if (this.peek() !== ')') throw new Error('Thiếu dấu ")"');
      this.pos++;
      return v;
    }
    const rest = this.s.slice(this.pos);
    const num = rest.match(/^(\d+(\.\d+)?|\.\d+)/);
    if (num) { this.pos += num[0].length; return parseFloat(num[0]); }
    const id = rest.match(/^[a-z]+/);
    if (id) {
      const name = id[0];
      this.pos += name.length;
      if (FUNCS[name] && this.peek() === '(') {
        this.pos++;
        const arg = this.expr();
        if (this.peek() !== ')') throw new Error('Thiếu dấu ")"');
        this.pos++;
        return FUNCS[name](arg);
      }
      if (name in this.vars) return this.vars[name];
      if (name in CONSTS) return CONSTS[name];
      throw new Error(`Không hiểu "${name}"`);
    }
    throw new Error(`Ký tự không hợp lệ: "${c}"`);
  }
}

const evaluate = (expr: string, vars: Vars = {}): number => new Parser(expr, vars).parse();

export const fmt = (n: number): string => {
  if (!Number.isFinite(n)) return String(n);
  return Number.isInteger(n) ? String(n) : String(parseFloat(n.toPrecision(10)));
};

export function normalize(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/√/g, 'sqrt')
    .replace(/π/g, 'pi')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/[\[{]/g, '(')
    .replace(/[\]}]/g, ')')
    .replace(/,/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Bỏ các từ dẫn như "giải", "tính", "bằng bao nhiêu". */
export function stripMathWords(raw: string): string {
  return raw
    .trim()
    .replace(/^(hãy |giúp (tôi|mình) |cho (tôi|mình) )?(giải phương trình|giải pt|giải|tính|solve|calculate)\s*:?\s*/i, '')
    .replace(/\s*(bằng bao nhiêu|là bao nhiêu|=\s*\?|\?)+\s*$/i, '')
    .trim();
}

const paren = (n: number) => (n < 0 ? `(${fmt(n)})` : fmt(n));

/** Hiển thị đa thức gọn: bỏ hệ số 0 và 1, gộp dấu. */
function polyText(a: number, b: number, c: number): string {
  const terms: [number, string][] = [[a, 'x²'], [b, 'x'], [c, '']];
  let out = '';
  for (const [k, v] of terms) {
    if (Math.abs(k) < 1e-12) continue;
    const abs = Math.abs(k);
    const body = v && Math.abs(abs - 1) < 1e-12 ? v : `${fmt(abs)}${v}`;
    out += out ? (k < 0 ? ` − ${body}` : ` + ${body}`) : (k < 0 ? `−${body}` : body);
  }
  return out || '0';
}

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

function solveEquation(lhs: string, rhs: string): MathResult {
  const f = (x: number) => evaluate(lhs, { x }) - evaluate(rhs, { x });
  const f0 = f(0), f1 = f(1), fm1 = f(-1);
  const c = f0;
  const a = (f1 + fm1) / 2 - c;
  const b = (f1 - fm1) / 2;
  if (!near(f(2), 4 * a + 2 * b + c) || !near(f(-3), 9 * a - 3 * b + c)) {
    return { ok: false, error: 'Mình mới giải được phương trình một ẩn x bậc nhất hoặc bậc hai (dạng đa thức).' };
  }
  const head = `Đưa về dạng chuẩn: ${polyText(a, b, c)} = 0\n`;

  if (near(a, 0) && near(b, 0)) {
    return { ok: true, text: head + (near(c, 0) ? '→ Phương trình nghiệm đúng với mọi x.' : '→ Phương trình vô nghiệm.') };
  }
  if (near(a, 0)) {
    const x = -c / b;
    return { ok: true, text: `${head}Đây là phương trình bậc nhất: x = −c/b = ${paren(-c)}/${paren(b)}\n→ x = ${fmt(x)}` };
  }
  const d = b * b - 4 * a * c;
  const steps = `${head}Δ = b² − 4ac = ${paren(b)}² − 4·${paren(a)}·${paren(c)} = ${fmt(d)}\n`;
  if (near(d, 0)) return { ok: true, text: `${steps}Δ = 0 → nghiệm kép: x = ${fmt(-b / (2 * a))}` };
  if (d < 0) return { ok: true, text: `${steps}Δ < 0 → phương trình vô nghiệm thực.` };
  const sq = Math.sqrt(d);
  return {
    ok: true,
    text: `${steps}Δ > 0 → hai nghiệm phân biệt:\nx₁ = (−b + √Δ)/2a = ${fmt((-b + sq) / (2 * a))}\nx₂ = (−b − √Δ)/2a = ${fmt((-b - sq) / (2 * a))}`,
  };
}

export function solveMath(raw: string): MathResult {
  const input = normalize(stripMathWords(raw));
  if (!input) return { ok: false, error: 'Bạn hãy nhập biểu thức, ví dụ: 2*(3+4)^2' };
  try {
    if (input.includes('=')) {
      const parts = input.split('=');
      if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
        return { ok: false, error: 'Phương trình cần đúng một dấu "=", ví dụ: 2x + 3 = 11' };
      }
      return solveEquation(parts[0], parts[1]);
    }
    if (/\bx\b|\dx|x\d|x\^|\)x/.test(input)) {
      return { ok: false, error: 'Có ẩn x nhưng thiếu dấu "=". Hãy nhập dạng: 2x + 3 = 11' };
    }
    const v = evaluate(input);
    if (!Number.isFinite(v)) return { ok: false, error: 'Kết quả không xác định (có thể do chia cho 0 hoặc số quá lớn).' };
    return { ok: true, text: `${input} = ${fmt(v)}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Không tính được biểu thức này.' };
  }
}
