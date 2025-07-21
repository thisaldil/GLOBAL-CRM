// utils/emailWrapper.js

/**
 * Static email header template
 * @param {Object} variables - Object containing placeholder values
 * @returns {string} HTML string for email header
 */
const getEmailHeader = (variables = {}) => {
  const { company = "XXX", date = new Date().toLocaleDateString() } = variables;

  return `
    <div style="background:#e63946;padding:20px;color:white;text-align:center;">
      <h1>${company}</h1>
      <p>${date}</p>
    </div>
  `;
};

/**
 * Static email footer template
 * @param {Object} variables - Object containing placeholder values
 * @returns {string} HTML string for email footer
 */
const getEmailFooter = (variables = {}) => {
  const { company = "XXX", year = new Date().getFullYear() } = variables;

  return `
    <div style="background:#f1f1f1;padding:20px;text-align:center;font-size:12px;color:#777;">
      &copy; ${year} ${company}. All rights reserved.
    </div>
  `;
};

/**
 * Wraps email content with header and footer
 * @param {string} bodyContent - The main email body content
 * @param {Object} variables - Object containing placeholder values
 * @returns {string} Complete HTML email string
 */
const wrapEmailContent = (bodyContent, variables = {}) => {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const defaultVariables = {
    company: "Your Company",
    date: today,
    year: new Date().getFullYear(),
    ...variables,
  };

  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email</title>
      </head>
      <body style="font-family:sans-serif;background:#f4f4f4;margin:0;padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;">
          <tr>
            <td align="center">
              <table width="600" style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                <tr>
                  <td>${getEmailHeader(defaultVariables)}</td>
                </tr>
                <tr>
                  <td style="padding:30px;">
                    ${bodyContent}
                  </td>
                </tr>
                <tr>
                  <td>${getEmailFooter(defaultVariables)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

/**
 * Personalizes email content by replacing placeholders
 * @param {string} htmlContent - HTML content with placeholders
 * @param {Object} customer - Customer object with personal data
 * @returns {string} Personalized HTML content
 */
const personalizeEmail = (htmlContent, customer) => {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const year = new Date().getFullYear();

  return htmlContent
    .replace(/{{fullName}}/g, customer.fullName || "Valued Customer")
    .replace(/{{company}}/g, customer.company || "XXX")
    .replace(/{{date}}/g, today)
    .replace(/{{year}}/g, year);
};

/**
 * Complete email processing function
 * @param {string} templateBody - Email template body content
 * @param {Object} customer - Customer object
 * @returns {string} Final personalized HTML email
 */
const processEmailTemplate = (templateBody, customer) => {
  const wrappedContent = wrapEmailContent(templateBody);
  return personalizeEmail(wrappedContent, customer);
};

module.exports = {
  getEmailHeader,
  getEmailFooter,
  wrapEmailContent,
  personalizeEmail,
  processEmailTemplate,
};
