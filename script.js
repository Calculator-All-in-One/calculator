document.addEventListener('DOMContentLoaded', () => {
    const expressionInput = document.getElementById('expression');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultDiv = document.getElementById('result');

    calculateBtn.addEventListener('click', () => {
        const expression = expressionInput.value;
        try {
            const result = evaluateExpression(expression);
            resultDiv.textContent = `Result: ${result}`;
            resultDiv.style.color = 'green';
        } catch (error) {
            resultDiv.textContent = `Error: ${error.message}`;
            resultDiv.style.color = 'red';
        }
    });

    function parseNumber(str) {
        str = str.trim().toLowerCase();
        let multiplier = 1;

        if (str.endsWith('k')) { // Thousands
            multiplier = 1e3;
            str = str.slice(0, -1);
        } else if (str.endsWith('m')) { // Millions
            multiplier = 1e6;
            str = str.slice(0, -1);
        } else if (str.endsWith('b')) { // Billions
            multiplier = 1e9;
            str = str.slice(0, -1);
        } else if (str.endsWith('t')) { // Trillions
            multiplier = 1e12;
            str = str.slice(0, -1);
        } else if (str.endsWith('cr')) { // Crores
            multiplier = 1e7;
            str = str.slice(0, -2);
        } else if (str.endsWith('l')) { // Lakhs
            multiplier = 1e5;
            str = str.slice(0, -1);
        }


        const num = parseFloat(str);
        if (isNaN(num)) {
            throw new Error(`Invalid number format: ${str}`);
        }
        return num * multiplier;
    }

    function evaluateExpression(expression) {
        // Sanitize the expression to prevent arbitrary code execution
        // Allow numbers (including decimals and scientific notation), operators (+, -, *, /),
        // parentheses, and the defined suffixes (k, m, b, t, cr, l).
        const sanitizedExpression = expression.replace(/[^0-9a-zA-Z.+\-*/eE() ]/g, (match) => {
            // Allow defined suffixes
            if (['k', 'm', 'b', 't', 'cr', 'l'].some(suffix => match.toLowerCase().endsWith(suffix))) {
                return match;
            }
            throw new Error(`Invalid character in expression: ${match}`);
        });


        // Regex to find numbers with suffixes or standard numbers
        const numRegex = /([0-9.eE]+[kmbtlcr]*)/gi;

        // Replace numbers with suffixes with their parsed values
        let processedExpression = sanitizedExpression.replace(numRegex, (match) => {
            // Avoid double parsing if it's already a number from a previous replacement
            if (!isNaN(parseFloat(match)) && !/[kmbtlcr]/i.test(match)) {
                return match;
            }
            try {
                return parseNumber(match).toString();
            } catch (e) {
                // If parseNumber throws an error, re-throw it to be caught by the main try-catch
                throw e;
            }
        });

        // Final check for safety before evaluation
        // This regex looks for any characters that are not part of a valid mathematical expression.
        // It allows numbers (including decimals and scientific notation 'e' or 'E'),
        // operators (+, -, *, /), parentheses, and spaces.
        if (/[^0-9.+\-*/eE() ]/.test(processedExpression)) {
            throw new Error('Invalid expression format after processing suffixes.');
        }

        // Evaluate the processed expression
        // Warning: Using Function constructor for evaluation can be risky if not carefully sanitized.
        // The sanitization steps above are crucial.
        try {
            return new Function('return ' + processedExpression)();
        } catch (e) {
            throw new Error('Error evaluating expression. Ensure it is mathematically correct.');
        }
    }
});
