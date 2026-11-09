import { Language, TestCase, TestResult, Verdict } from '../types';

export interface RunResult {
  status: Verdict;
  output: string;
  executionTimeMs: number;
  memoryUsedKB: number;
  error?: string;
}

export interface GradeResult {
  status: Verdict;
  score: number;
  totalScore: number;
  executionTimeMs: number;
  memoryUsedKB: number;
  testResults: TestResult[];
  compileError?: string;
}

/**
 * Pre-checks C and C++ syntax to simulate compiler errors with GCC-like diagnostics.
 */
function checkSyntax(code: string, language: Language): string | null {
  const lines = code.split('\n');

  // Check main function existence
  const hasMain = lines.some(l => /\b(int|void)\s+main\s*\(/.test(l));
  if (!hasMain) {
    const filename = language === 'cpp' ? 'solution.cpp' : 'solution.c';
    return `${filename}: In function 'main':\n${filename}:1:1: error: undefined reference to 'main'\ncollect2: error: ld returned 1 exit status`;
  }

  // Check balanced braces
  let openBraces = 0;
  let openParens = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const prevChar = i > 0 ? code[i - 1] : '';

    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (stringChar === char) {
        inString = false;
      }
      continue;
    }

    if (inString) continue;

    if (char === '{') openBraces++;
    else if (char === '}') {
      openBraces--;
      if (openBraces < 0) {
        const filename = language === 'cpp' ? 'solution.cpp' : 'solution.c';
        return `${filename}: error: stray '}' in program\n${filename}: line unexpected end of block`;
      }
    } else if (char === '(') openParens++;
    else if (char === ')') {
      openParens--;
      if (openParens < 0) {
        const filename = language === 'cpp' ? 'solution.cpp' : 'solution.c';
        return `${filename}: error: expected ';' before ')' token`;
      }
    }
  }

  if (openBraces > 0) {
    const filename = language === 'cpp' ? 'solution.cpp' : 'solution.c';
    return `${filename}:${lines.length}:1: error: expected '}' at end of input`;
  }
  if (openParens > 0) {
    const filename = language === 'cpp' ? 'solution.cpp' : 'solution.c';
    return `${filename}:${lines.length}:1: error: expected ')' before ';' token`;
  }

  // Look for obvious missing semicolon in statements like "int x = 5\n"
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    if (
      line.length > 0 &&
      !line.startsWith('#') &&
      !line.startsWith('//') &&
      !line.startsWith('/*') &&
      !line.endsWith(';') &&
      !line.endsWith('{') &&
      !line.endsWith('}') &&
      !line.endsWith(':') &&
      !line.endsWith(',') &&
      !line.endsWith('*/')
    ) {
      if (
        /^(int|long|double|float|char|bool|string|vector|cin|cout|return|printf|scanf)\b/.test(line) ||
        /^[a-zA-Z_]\w*\s*=[^;]+$/.test(line)
      ) {
        // Next line check (not continuation)
        const nextLine = idx + 1 < lines.length ? lines[idx + 1].trim() : '';
        if (
          !nextLine.startsWith('{') &&
          !nextLine.startsWith(';') &&
          !nextLine.startsWith('.') &&
          !nextLine.startsWith('>>') &&
          !nextLine.startsWith('<<')
        ) {
          const filename = language === 'cpp' ? 'solution.cpp' : 'solution.c';
          return `${filename}:${idx + 1}:${line.length + 1}: error: expected ';' before end of line\n  ${line}\n  ^`;
        }
      }
    }
  }

  return null;
}

/**
 * Transpiles common C/C++ code constructs to an executable JavaScript sandbox.
 * Supports: cin >> ..., cout << ..., scanf, printf, loops, vectors, arrays, basic functions.
 */
function transpileCppToJs(code: string, language: Language): string {
  let js = code;

  // 1. Remove comments
  js = js.replace(/\/\*[\s\S]*?\*\//g, '');
  js = js.replace(/\/\/.*$/gm, '');

  // 2. Remove preprocessor directives
  js = js.replace(/#include\s*<[^>]+>/g, '');
  js = js.replace(/#include\s*"[^"]+"/g, '');
  js = js.replace(/using\s+namespace\s+std\s*;/g, '');
  js = js.replace(/#define\s+([a-zA-Z0-9_]+)\s+(.+)$/gm, 'const $1 = $2;');

  // 3. Types removal (int, long long, double, float, char, bool, void, etc.)
  js = js.replace(/\b(long\s+long|unsigned\s+long\s+long|long|int|double|float|char|bool|void|auto)\s+([a-zA-Z_]\w*)\s*(\[.*?\])/g, 'let $2 = [];');
  js = js.replace(/\b(long\s+long|unsigned\s+long\s+long|long|int|double|float|char|bool|void|auto)\s+([a-zA-Z_]\w*)/g, 'let $2');
  js = js.replace(/\bvector\s*<[^>]+>\s+([a-zA-Z_]\w*)/g, 'let $1 = []');
  js = js.replace(/\bstring\s+([a-zA-Z_]\w*)/g, 'let $1');

  // Replace fast I/O idioms
  js = js.replace(/cin\.tie\s*\([^)]*\)\s*;/g, '');
  js = js.replace(/ios_base::sync_with_stdio\s*\([^)]*\)\s*;/g, '');
  js = js.replace(/ios::sync_with_stdio\s*\([^)]*\)\s*;/g, '');

  // 4. Transform C++ vector / string operations
  js = js.replace(/\.push_back\s*\(/g, '.push(');
  js = js.replace(/\.size\s*\(\s*\)/g, '.length');
  js = js.replace(/\.empty\s*\(\s*\)/g, '.length === 0');
  js = js.replace(/\.front\s*\(\s*\)/g, '[0]');
  js = js.replace(/\.back\s*\(\s*\)/g, '[slice(-1)[0]]');
  js = js.replace(/sort\s*\(\s*([a-zA-Z_]\w*)\.begin\s*\(\s*\)\s*,\s*\1\.end\s*\(\s*\)\s*\)/g, '$1.sort((a,b)=>a-b)');

  // 5. C++ std::cin >> var1 >> var2
  // We'll replace cin >> a with `a = __readNext(typeof a)`
  js = js.replace(/cin\s*(>>\s*[a-zA-Z_]\w*(\[[^\]]+\])?)+;/g, match => {
    const parts = match.replace(/cin\s*/, '').replace(/;/g, '').split('>>');
    return parts
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(varName => `${varName} = __readNext();`)
      .join('\n');
  });

  // 6. C++ std::cout << a << " " << endl;
  js = js.replace(/cout\s*(<<\s*[^;]+)+;/g, match => {
    const body = match.replace(/^cout\s*<</, '').replace(/;$/, '');
    const segments = body.split('<<').map(s => s.trim());
    const jsPrints = segments.map(seg => {
      if (seg === 'endl' || seg === "'\\n'" || seg === '"\\n"') {
        return `__print('\\n');`;
      }
      return `__print(${seg});`;
    });
    return jsPrints.join('\n');
  });

  // 7. C scanf("%d %s", &a, str)
  js = js.replace(/scanf\s*\(\s*["'][^"']*["']\s*,\s*([^)]+)\)\s*;/g, (_, args) => {
    const vars = args.split(',').map((v: string) => v.trim().replace(/^&/, ''));
    return vars.map((v: string) => `${v} = __readNext();`).join('\n');
  });

  // 8. C printf(...)
  js = js.replace(/printf\s*\(\s*["']([^"']*)["']\s*(?:,\s*([^)]+))?\)\s*;/g, (_, formatStr, args) => {
    if (!args) {
      // Just plain string with possible escapes
      const sanitized = formatStr.replace(/\\n/g, '\\n');
      return `__print("${sanitized}");`;
    }
    const varList = args.split(',').map((a: string) => a.trim());
    return `__cPrintf("${formatStr}", [${varList.join(',')}]);`;
  });

  // 9. Standard C/C++ math and utility wrappers
  js = js.replace(/\babs\s*\(/g, 'Math.abs(');
  js = js.replace(/\bmin\s*\(/g, 'Math.min(');
  js = js.replace(/\bmax\s*\(/g, 'Math.max(');
  js = js.replace(/\bsqrt\s*\(/g, 'Math.sqrt(');
  js = js.replace(/\bpow\s*\(/g, 'Math.pow(');
  js = js.replace(/\bfloor\s*\(/g, 'Math.floor(');
  js = js.replace(/\bceil\s*\(/g, 'Math.ceil(');

  // 10. Wrap main() invocation
  // Replace `let main = function` or `function main`
  js = js.replace(/(?:let|function)\s+main\s*\([^)]*\)\s*\{/, 'function __main() {');

  return js;
}

/**
 * Runs the C/C++ code against a single test input with timeout protection.
 */
export async function executeCode(
  code: string,
  input: string,
  language: Language,
  timeLimitMs: number = 1000
): Promise<RunResult> {
  const startTime = performance.now();

  // Step 1: Syntax check
  const syntaxError = checkSyntax(code, language);
  if (syntaxError) {
    return {
      status: 'CE',
      output: '',
      executionTimeMs: 0,
      memoryUsedKB: 0,
      error: syntaxError,
    };
  }

  // Step 2: Transpile to JS runner
  let transpiled: string;
  try {
    transpiled = transpileCppToJs(code, language);
  } catch (err: any) {
    return {
      status: 'CE',
      output: '',
      executionTimeMs: 0,
      memoryUsedKB: 0,
      error: `Compiler parsing error: ${err.message || 'Unknown syntax'}`,
    };
  }

  // Tokenize input for cin / scanf
  const tokens = input
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 0);
  let tokenIdx = 0;
  let outputBuffer = '';
  let opCount = 0;
  const maxOps = 3000000; // Loop iteration threshold to catch TLE

  const sandboxContext = {
    __readNext: () => {
      if (tokenIdx >= tokens.length) return '';
      const token = tokens[tokenIdx++];
      const num = Number(token);
      return !isNaN(num) && token.trim() !== '' ? num : token;
    },
    __print: (val: any) => {
      outputBuffer += val !== undefined && val !== null ? String(val) : '';
    },
    __cPrintf: (formatStr: string, args: any[]) => {
      let argIdx = 0;
      let res = formatStr.replace(/%(?:d|i|f|lf|s|c|lld)/g, () => {
        if (argIdx < args.length) {
          const val = args[argIdx++];
          return String(val);
        }
        return '';
      });
      res = res.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
      outputBuffer += res;
    },
    __tick: () => {
      opCount++;
      if (opCount > maxOps) {
        throw new Error('TLE_EXCEEDED');
      }
    },
  };

  // Inject opCount guards into while and for loops to prevent infinite loops
  let guardedCode = transpiled
    .replace(/\bwhile\s*\(([^)]+)\)\s*\{/g, 'while ($1) { __tick(); ')
    .replace(/\bfor\s*\(([^)]+)\)\s*\{/g, 'for ($1) { __tick(); ');

  const runnerSource = `
    return (function(__ctx) {
      const __readNext = __ctx.__readNext;
      const __print = __ctx.__print;
      const __cPrintf = __ctx.__cPrintf;
      const __tick = __ctx.__tick;
      
      ${guardedCode}

      if (typeof __main === 'function') {
        __main();
      }
    });
  `;

  try {
    const fn = new Function(runnerSource);
    fn()(sandboxContext);

    const endTime = performance.now();
    const elapsed = Math.max(1, Math.round(endTime - startTime));

    // Simulated memory footprint
    const simulatedMemory = Math.round(1024 + Math.random() * 800 + (code.length * 2));

    return {
      status: 'AC',
      output: outputBuffer,
      executionTimeMs: Math.min(elapsed, timeLimitMs - 1),
      memoryUsedKB: simulatedMemory,
    };
  } catch (err: any) {
    const endTime = performance.now();
    const elapsed = Math.max(1, Math.round(endTime - startTime));

    if (err.message === 'TLE_EXCEEDED' || elapsed >= timeLimitMs) {
      return {
        status: 'TLE',
        output: outputBuffer,
        executionTimeMs: timeLimitMs + 50,
        memoryUsedKB: 2400,
        error: `Time Limit Exceeded (Threshold: ${timeLimitMs}ms)`,
      };
    }

    return {
      status: 'RTE',
      output: outputBuffer,
      executionTimeMs: elapsed,
      memoryUsedKB: 1800,
      error: `Runtime Error: ${err.message || 'Segmentation fault (core dumped)'}`,
    };
  }
}

/**
 * Normalizes output strings by trimming line ends and trailing newlines for fair grading.
 */
function normalizeOutput(str: string): string {
  return str
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Grades full test cases for a problem submission.
 */
export async function gradeSubmission(
  code: string,
  testCases: TestCase[],
  language: Language,
  timeLimitMs: number = 1000
): Promise<GradeResult> {
  const testResults: TestResult[] = [];
  let totalScore = 0;
  let earnedScore = 0;
  let maxTimeMs = 0;
  let maxMemoryKB = 0;
  let overallVerdict: Verdict = 'AC';
  let compileErrorText: string | undefined;

  // Initial syntax compilation check
  const syntaxError = checkSyntax(code, language);
  if (syntaxError) {
    return {
      status: 'CE',
      score: 0,
      totalScore: 100,
      executionTimeMs: 0,
      memoryUsedKB: 0,
      testResults: [],
      compileError: syntaxError,
    };
  }

  // Iterate over each test case
  for (const tc of testCases) {
    totalScore += tc.weight;
    const run = await executeCode(code, tc.input, language, timeLimitMs);

    maxTimeMs = Math.max(maxTimeMs, run.executionTimeMs);
    maxMemoryKB = Math.max(maxMemoryKB, run.memoryUsedKB);

    if (run.status === 'CE') {
      overallVerdict = 'CE';
      compileErrorText = run.error;
      break;
    }

    if (run.status === 'TLE') {
      testResults.push({
        testCaseId: tc.id,
        verdict: 'T',
        timeMs: run.executionTimeMs,
        memoryKB: run.memoryUsedKB,
        inputSnippet: tc.isHidden ? '[ซ่อน / Hidden]' : tc.input.slice(0, 40),
        expectedSnippet: tc.isHidden ? '[ซ่อน / Hidden]' : tc.output.slice(0, 40),
        actualSnippet: 'Time Limit Exceeded',
      });
      if (overallVerdict === 'AC') overallVerdict = 'TLE';
      continue;
    }

    if (run.status === 'RTE') {
      testResults.push({
        testCaseId: tc.id,
        verdict: 'X',
        timeMs: run.executionTimeMs,
        memoryKB: run.memoryUsedKB,
        inputSnippet: tc.isHidden ? '[ซ่อน / Hidden]' : tc.input.slice(0, 40),
        expectedSnippet: tc.isHidden ? '[ซ่อน / Hidden]' : tc.output.slice(0, 40),
        actualSnippet: `Runtime Error: ${run.error || 'Fault'}`,
      });
      if (overallVerdict === 'AC') overallVerdict = 'RTE';
      continue;
    }

    // Compare output
    const isCorrect = normalizeOutput(run.output) === normalizeOutput(tc.output);

    if (isCorrect) {
      earnedScore += tc.weight;
      testResults.push({
        testCaseId: tc.id,
        verdict: 'P',
        timeMs: run.executionTimeMs,
        memoryKB: run.memoryUsedKB,
        inputSnippet: tc.isHidden ? '[ซ่อน / Hidden]' : tc.input.slice(0, 40),
        expectedSnippet: tc.isHidden ? '[ซ่อน / Hidden]' : tc.output.slice(0, 40),
        actualSnippet: tc.isHidden ? '[ซ่อน / Hidden]' : run.output.slice(0, 40),
      });
    } else {
      testResults.push({
        testCaseId: tc.id,
        verdict: '-',
        timeMs: run.executionTimeMs,
        memoryKB: run.memoryUsedKB,
        inputSnippet: tc.isHidden ? '[ซ่อน / Hidden]' : tc.input.slice(0, 40),
        expectedSnippet: tc.isHidden ? '[ซ่อน / Hidden]' : tc.output.slice(0, 40),
        actualSnippet: tc.isHidden ? '[ซ่อน / Hidden]' : run.output.slice(0, 40),
      });
      if (overallVerdict === 'AC') overallVerdict = 'WA';
    }
  }

  // Calculate final proportional score
  const finalScore = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
  if (finalScore === 100) {
    overallVerdict = 'AC';
  } else if (overallVerdict === 'AC' && finalScore < 100) {
    overallVerdict = 'WA';
  }

  return {
    status: overallVerdict,
    score: finalScore,
    totalScore: 100,
    executionTimeMs: maxTimeMs,
    memoryUsedKB: maxMemoryKB,
    testResults,
    compileError: compileErrorText,
  };
}
