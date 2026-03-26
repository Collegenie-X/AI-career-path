/**
 * 왕국별 직업 JSON 파일을 하나로 병합하는 스크립트
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const jobsDir = path.join(dataDir, 'jobs');

const kingdomFiles = [
  'explore-kingdom-jobs.json',
  'create-kingdom-jobs.json',
  'tech-kingdom-jobs.json',
  'nature-kingdom-jobs.json',
  'connect-kingdom-jobs.json',
  'order-kingdom-jobs.json',
  'communicate-kingdom-jobs.json',
  'challenge-kingdom-jobs.json',
];

const allJobs = [];

kingdomFiles.forEach((filename) => {
  const filePath = path.join(jobsDir, filename);
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jobs = JSON.parse(fileContent);
    allJobs.push(...jobs);
    console.log(`✓ Loaded ${jobs.length} jobs from ${filename}`);
  } catch (error) {
    console.error(`✗ Error loading ${filename}:`, error.message);
  }
});

const outputPath = path.join(dataDir, 'jobs.json');
fs.writeFileSync(outputPath, JSON.stringify(allJobs, null, 2), 'utf-8');

console.log(`\n✓ Successfully merged ${allJobs.length} jobs into jobs.json`);
console.log(`Output: ${outputPath}`);
