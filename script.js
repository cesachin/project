// Simple calculator logic
(() => {
  const displayEl = document.querySelector('.display');
  const buttons = Array.from(document.querySelectorAll('.btn'));
  let expr = '';

  function updateDisplay() {
    displayEl.value = expr === '' ? '0' : expr;
  }

  function sanitizeForEval(input) {
    // replace display operators with JS operators, remove invalid chars
    let s = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    // Allow only digits, operators, parentheses, decimal point and spaces
    s = s.replace(/[^0-9+\-*/().\s]/g, '');
    return s;
  }

  function canAddDecimal() {
    // get the part after the last operator
    const lastNumber = expr.split(/[\+\-\*\/\(\)]/).pop() || '';
    return !lastNumber.includes('.');
  }

  function addValue(val) {
    const lastChar = expr.slice(-1);

    if (val === '.') {
      if (!canAddDecimal()) return;
      expr += '.';
      return;
    }

    if (val === '(') {
      // allow '(' at start or after operator
      if (expr === '' || /[+\-*/(]$/.test(expr)) {
        expr += '(';
      } else {
        // implicit multiplication: number followed by '('
        expr += '*(';
      }
      return;
    }

    if (val === ')') {
      // only add if there is an unmatched '('
      const open = (expr.match(/\(/g) || []).length;
      const close = (expr.match(/\)/g) || []).length;
      if (open > close && /[0-9)]$/.test(expr)) {
        expr += ')';
      }
      return;
    }

    if (/^[+\-*/]$/.test(val)) {
      // if empty and operator isn't -, ignore (allow negative start)
      if (expr === '' && val !== '-') return;
      // replace last operator if last char is operator
      if (/^[+\-*/]$/.test(lastChar)) {
        expr = expr.slice(0, -1) + val;
      } else {
        expr += val;
      }
      return;
    }

    // digits
    expr += val;
  }

  function clearAll() { expr = ''; updateDisplay(); }

  function backspace() {
    expr = expr.slice(0, -1);
  }

  function evaluateExpr() {
    if (expr === '') return;
    // if ends with operator, drop it
    let trimmed = expr.replace(/[+\-*/.]+$/, '');
    const toEval = sanitizeForEval(trimmed);
    if (toEval === '') return;
    try {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${toEval})`)();
      expr = String(result);
    } catch (e) {
      expr = 'Error';
      setTimeout(() => { expr = ''; updateDisplay(); }, 900);
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.value;
      if (v === 'C') {
        clearAll();
      } else if (v === 'back') {
        backspace();
      } else if (v === '=') {
        evaluateExpr();
      } else {
        // map displayed operator symbols to internal ones if needed
        const mapped = v === '×' ? '*' : (v === '÷' ? '/' : (v === '−' ? '-' : v));
        addValue(mapped);
      }
      updateDisplay();
    });
  });

  // keyboard support
  window.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') { addValue(e.key); }
    else if (e.key === '.') { addValue('.'); }
    else if (e.key === 'Enter' || e.key === '=') { evaluateExpr(); }
    else if (e.key === 'Backspace') { backspace(); }
    else if (e.key === 'Escape') { clearAll(); }
    else if (['+', '-', '*', '/','(',')'].includes(e.key)) { addValue(e.key); }
    else return;
    e.preventDefault();
    updateDisplay();
  });

  updateDisplay();
})();