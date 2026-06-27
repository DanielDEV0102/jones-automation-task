[README_1.md](https://github.com/user-attachments/files/29424487/README_1.md)

# Jones Automation Task
**Submitted by: Daniel Golan**

---

## Repository Structure

```
jones-automation-task/
├── tests/
│   └── example.spec.js                        # All Playwright tests
├── Answers to mock-up Daniel Golan.pdf        # Part 2 answers
└── README_1.md
```

---

## Part 1 — Playwright Automation

### Setup

```bash
npm install
npx playwright install chromium
```

### Run the tests

```bash
# Run all tests
npx playwright test

# Run with browser visible
npx playwright test --headed

# Run a specific test
npx playwright test -g "Form filling"

# View full test report
npx playwright show-report
```

### Tests overview

| Test Name | What it checks |
|-----------|---------------|
| **Form filling** | Fills all fields correctly and verifies the Thank You page |
| **Email validation** | Tests invalid email formats (missing @, missing domain, etc.) |
| **Website URL validation** | Tests invalid URL formats (no protocol, spaces, etc.) |
| **Phone validation** | Tests invalid phone formats — also exposes a real bug (see below) |
| **Required fields validation in order** | Submits the form one field at a time to verify which fields are required |
| **Label floats when input is clicked** | Verifies the label animation — position, background color, and text color on focus |

---

## Bugs found during testing

### Phone field — no input validation
The phone field accepts any input including letters and special characters.
The `Phone validation` test will **fail** — this is intentional and documents the bug.
The browser returns no validation error, meaning the field has no input restrictions.



### URL field — incomplete validation
The following invalid URLs are accepted by the form and pass through to submission:

| Invalid URL | Why it should be rejected |
|-------------|--------------------------|
| `https://getjones` | No domain extension (.com, .io, etc.) |
| `http://getjonesd asd` | Spaces inside the URL |
| `http:getjonesd` | Missing `//` after protocol |

### Email field — incomplete validation
The following invalid email is accepted by the form:

| Invalid Email | Why it should be rejected |
|---------------|--------------------------|
| `john@gmail` | Missing domain extension (.com, .io, etc.) |

---

## Part 2 — UI Mock-up Analysis

Full answers are in: `Answers to mock-up Daniel Golan.pdf`

### What's covered

- **Section A** — Bugs found in the billing widget across
- **Section B** — 3 test cases
- **Section C** — Product solution for the most severe bug (missing CVV field)
