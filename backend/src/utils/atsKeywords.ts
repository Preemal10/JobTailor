/**
 * ATS Keywords Utility
 * Contains common ATS keywords for different technologies and skills
 */

/**
 * Common ATS keywords organized by category
 */
export const ATS_KEYWORDS = {
  programming_languages: [
    'C++',
    'C#',
    'Java',
    'Python',
    'JavaScript',
    'TypeScript',
    'Ruby',
    'PHP',
    'Go',
    'Rust',
    'Swift',
    'Kotlin',
    'R',
    'MATLAB',
  ],
  frontend: [
    'React',
    'Vue',
    'Angular',
    'HTML',
    'CSS',
    'SASS',
    'Webpack',
    'Next.js',
    'Svelte',
    'jQuery',
    'Bootstrap',
    'Material UI',
    'Redux',
    'GraphQL',
  ],
  backend: [
    'Node.js',
    'Express',
    'Django',
    'Flask',
    'Spring Boot',
    'ASP.NET',
    'FastAPI',
    'Ruby on Rails',
    'Laravel',
    'Gin',
    'Fastify',
  ],
  databases: [
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'DynamoDB',
    'Cassandra',
    'Oracle',
    'SQLite',
    'Firebase',
    'Elasticsearch',
  ],
  cloud_platforms: [
    'AWS',
    'Azure',
    'Google Cloud',
    'Heroku',
    'DigitalOcean',
    'Vercel',
    'Netlify',
  ],
  tools_devops: [
    'Docker',
    'Kubernetes',
    'Git',
    'GitLab',
    'GitHub',
    'Jenkins',
    'CircleCI',
    'Travis CI',
    'Terraform',
    'Ansible',
  ],
  soft_skills: [
    'Leadership',
    'Communication',
    'Problem Solving',
    'Teamwork',
    'Project Management',
    'Agile',
    'Scrum',
    'Kanban',
    'Time Management',
    'Critical Thinking',
  ],
};

/**
 * Check if a keyword exists as a whole word in text
 * Uses word boundary matching to avoid false positives
 */
const keywordExistsInText = (text: string, keyword: string): boolean => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(text);
};

/**
 * Extract ATS keywords from text
 * @param text - Text to search for keywords
 * @param keywords - Array of keywords to search for
 * @returns Array of found keywords
 */
export const extractATSKeywords = (text: string, keywords: string[]): string[] => {
  const foundKeywords: string[] = [];

  keywords.forEach((keyword) => {
    if (keywordExistsInText(text, keyword)) {
      foundKeywords.push(keyword);
    }
  });

  return [...new Set(foundKeywords)]; // Remove duplicates
};

/**
 * Get all ATS keywords from a category
 * @param category - Category name
 * @returns Array of keywords for the category
 */
export const getKeywordsByCategory = (
  category: keyof typeof ATS_KEYWORDS
): string[] => {
  return ATS_KEYWORDS[category] || [];
};

/**
 * Get all ATS keywords across all categories
 * @returns Flattened array of all keywords
 */
export const getAllATSKeywords = (): string[] => {
  const allKeywords: string[] = [];
  Object.values(ATS_KEYWORDS).forEach((categoryKeywords) => {
    allKeywords.push(...categoryKeywords);
  });
  return [...new Set(allKeywords)]; // Remove duplicates
};

/**
 * Calculate keyword match percentage
 * @param text - Text to analyze
 * @param requiredKeywords - Keywords that should be present
 * @returns Percentage of matched keywords
 */
export const calculateKeywordMatchPercentage = (
  text: string,
  requiredKeywords: string[]
): number => {
  if (requiredKeywords.length === 0) return 0;

  const foundKeywords = extractATSKeywords(text, requiredKeywords);
  return (foundKeywords.length / requiredKeywords.length) * 100;
};

/**
 * Get missing keywords
 * @param text - Text to analyze
 * @param requiredKeywords - Keywords that should be present
 * @returns Array of keywords not found in text
 */
export const getMissingKeywords = (
  text: string,
  requiredKeywords: string[]
): string[] => {
  const foundKeywords = new Set(extractATSKeywords(text, requiredKeywords));
  return requiredKeywords.filter((keyword) => !foundKeywords.has(keyword));
};

/**
 * Suggest keywords to add
 * @param text - Current text
 * @param jobDescription - Job description text
 * @returns Array of suggested keywords to add
 */
export const suggestKeywordsToAdd = (
  text: string,
  jobDescription: string
): string[] => {
  const allKeywords = getAllATSKeywords();
  const jobKeywords = extractATSKeywords(jobDescription, allKeywords);
  const currentKeywords = new Set(extractATSKeywords(text, allKeywords));

  return jobKeywords.filter((keyword) => !currentKeywords.has(keyword));
};
