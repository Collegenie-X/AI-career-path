#!/usr/bin/env node
/**
 * 커리어 패스 템플릿 v2 마이그레이션
 * - categoryTags, activitySubtype, links[] 필드 추가
 * - 기존 url은 links[0]으로 동기화
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const CATEGORY_TAGS = ['project', 'award', 'paper', 'intern', 'volunteer', 'camp', 'activity'];

function inferCategoryTags(item) {
  const text = `${item.title ?? ''} ${item.description ?? ''}`.toLowerCase();
  const tags = new Set();

  if (item.type === 'portfolio' || /프로젝트|해커톤|앱|웹|서비스|개발|데모|포트폴리오|github/i.test(text)) tags.add('project');
  if (item.type === 'award' || /수상|대회|올림피아드|입상|경진|경진대회|공모전|토론대회|모의재판/i.test(text)) tags.add('award');
  if (/논문|연구|r&e|탐구|리서치|보고서|학술제/i.test(text)) tags.add('paper');
  if (/인턴|intern|현장실습/i.test(text)) tags.add('intern');
  if (/봉사|volunteer|사회공헌|보건실/i.test(text)) tags.add('volunteer');
  if (/캠프|camp|부트캠프|summer program|체험|영재교육원|헌법교실/i.test(text)) tags.add('camp');
  if (item.type === 'activity') tags.add('activity');

  return Array.from(tags);
}

function inferActivitySubtype(item, tags) {
  if (item.type !== 'activity') return undefined;
  if (tags.includes('intern')) return 'intern';
  if (tags.includes('volunteer')) return 'volunteer';
  if (tags.includes('camp')) return 'camp';
  if (tags.includes('paper')) return 'research';
  if (tags.includes('project')) return 'project';
  return 'general';
}

function buildLinks(item) {
  if (Array.isArray(item.links) && item.links.length > 0) return item.links;
  if (!item.url) return undefined;
  return [{ title: item.title ?? '공식 링크', url: item.url, kind: 'official' }];
}

function migrateItem(item) {
  const categoryTags = item.categoryTags?.length ? item.categoryTags : inferCategoryTags(item);
  const activitySubtype = item.activitySubtype ?? inferActivitySubtype(item, categoryTags);
  const links = buildLinks(item);

  return {
    ...item,
    categoryTags,
    ...(activitySubtype && { activitySubtype }),
    ...(links && { links }),
  };
}

function migrateTemplate(template) {
  return {
    ...template,
    years: (template.years ?? []).map((year) => ({
      ...year,
      items: (year.items ?? []).map(migrateItem),
    })),
  };
}

function migrateFile(relPath) {
  const fullPath = join(ROOT, relPath);
  const raw = readFileSync(fullPath, 'utf-8');
  const data = JSON.parse(raw);
  const migrated = Array.isArray(data) ? data.map(migrateTemplate) : migrateTemplate(data);
  writeFileSync(fullPath, JSON.stringify(migrated, null, 2) + '\n', 'utf-8');
  console.log('Migrated:', relPath);
}

const FILES = [
  'frontend/data/career-path-templates-admission.json',
  'frontend/data/career-path-templates-highschool.json',
  'app/dreampath-app/src/data/career-path-templates-admission.json',
  'app/dreampath-app/src/data/career-path-templates-highschool.json',
];

FILES.forEach(migrateFile);
console.log('Done. v2 migration complete.');
