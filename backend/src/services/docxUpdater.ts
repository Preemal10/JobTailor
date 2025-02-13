/**
 * DOCX Updater Service
 * Modifies existing DOCX files while preserving formatting and structure
 */

import JSZip from 'jszip';
import { parseStringPromise, Builder } from 'xml2js';
import { OptimizedResume, JobDescription } from '../types';
import fs from 'fs';
import path from 'path';

/**
 * Extract text content from DOCX document.xml with structure
 * @param docxPath - Path to DOCX file
 * @returns Extracted structured content
 */
export const extractDocxStructure = async (
  docxPath: string
): Promise<{ text: string; sections: Record<string, string> }> => {
  try {
    const fileBuffer = fs.readFileSync(docxPath);
    const zip = new JSZip();
    const loaded = await zip.loadAsync(fileBuffer);

    // Extract document.xml
    const documentXml = await loaded.file('word/document.xml')?.async('string');
    if (!documentXml) {
      throw new Error('No document.xml found in DOCX');
    }

    // Parse XML
    const parsed = await parseStringPromise(documentXml);
    const paragraphs = parsed['w:document']?.['w:body']?.[0]?.['w:p'] || [];

    // Extract all text and identify sections
    let fullText = '';
    const sections: Record<string, string> = {};
    let currentSection = 'unknown';

    paragraphs.forEach((para: any) => {
      const runs = para['w:r'] || [];
      let paraText = '';

      runs.forEach((run: any) => {
        const text = run['w:t']?.[0] || '';
        paraText += text;
      });

      if (paraText.trim()) {
        fullText += paraText + '\n';

        // Detect section headers (EXPERIENCE, EDUCATION, SKILLS, etc.)
        const upperText = paraText.toUpperCase().trim();
        if (
          upperText.includes('EXPERIENCE') ||
          upperText.includes('WORK HISTORY')
        ) {
          currentSection = 'experience';
        } else if (
          upperText.includes('EDUCATION') ||
          upperText.includes('ACADEMIC')
        ) {
          currentSection = 'education';
        } else if (
          upperText.includes('SKILL') ||
          upperText.includes('TECHNICAL')
        ) {
          currentSection = 'skills';
        } else if (
          upperText.includes('SUMMARY') ||
          upperText.includes('OBJECTIVE')
        ) {
          currentSection = 'summary';
        } else if (upperText.includes('CERTIF')) {
          currentSection = 'certifications';
        }

        // Store content by section
        if (!sections[currentSection]) {
          sections[currentSection] = '';
        }
        sections[currentSection] += paraText + '\n';
      }
    });

    return { text: fullText, sections };
  } catch (error) {
    console.error('Error extracting DOCX structure:', error);
    throw new Error('Failed to extract DOCX structure');
  }
};

/**
 * Replace text in DOCX while preserving formatting
 * @param docxPath - Path to original DOCX file
 * @param replacements - Map of old text to new text
 * @param outputPath - Path to save updated DOCX
 * @returns Path to updated file
 *
 * Strategy: Find and replace text in document.xml while keeping all formatting tags
 */
export const updateDocxContent = async (
  docxPath: string,
  replacements: Map<string, string>,
  outputPath: string
): Promise<string> => {
  try {
    const fileBuffer = fs.readFileSync(docxPath);
    const zip = new JSZip();
    const loaded = await zip.loadAsync(fileBuffer);

    // Extract and modify document.xml
    let documentXml = await loaded.file('word/document.xml')?.async('string');
    if (!documentXml) {
      throw new Error('No document.xml found');
    }

    // Sort replacements by length (longest first) to avoid partial replacements
    const sortedReplacements = Array.from(replacements.entries()).sort(
      (a, b) => b[0].length - a[0].length
    );

    // Apply replacements while preserving XML structure
    for (const [oldText, newText] of sortedReplacements) {
      // Escape special XML characters
      const escapedNew = newText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      documentXml = documentXml.replace(
        new RegExp(escapeRegExp(oldText), 'g'),
        escapedNew
      );
    }

    // Update the file in the ZIP
    loaded.file('word/document.xml', documentXml);

    // Write updated DOCX to file
    const buffer = await loaded.generateAsync({ type: 'nodebuffer' });
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, buffer);

    console.log(`Updated DOCX saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error updating DOCX:', error);
    throw new Error('Failed to update DOCX file');
  }
};

/**
 * Create an updated DOCX with optimized resume content
 * Preserves original formatting and structure where possible
 * @param originalDocxPath - Path to original resume DOCX
 * @param optimizedResume - Optimized resume data
 * @param outputPath - Path to save updated DOCX
 * @returns Path to updated file
 *
 * TODO: Implement smart section replacement:
 * - Detect and replace experience section
 * - Update education section
 * - Update skills section
 * - Replace professional summary
 * - Update personal info
 */
export const updateResumeDocx = async (
  originalDocxPath: string,
  optimizedResume: any,
  outputPath: string
): Promise<string> => {
  try {
    // Extract current content from original DOCX
    const { sections } = await extractDocxStructure(originalDocxPath);

    // Create replacements map
    const replacements = new Map<string, string>();

    // TODO: Smart section replacement
    // For now, use simple key-value replacements

    // Replace professional summary if exists
    if (optimizedResume.professionalSummary && sections['summary']) {
      // Find the old summary and replace with new one
      // Extract first few lines from old summary
      const oldSummary = sections['summary'].split('\n')[0];
      if (oldSummary) {
        replacements.set(oldSummary, optimizedResume.professionalSummary);
      }
    }

    // Replace job title if exists
    if (optimizedResume.jobTitle) {
      const newJobTitle = optimizedResume.jobTitle;
      // This would need intelligent detection of where job title is in the doc
      // For now, skip
    }

    // Replace skills
    if (optimizedResume.skills && optimizedResume.skills.length > 0) {
      const newSkillsText = optimizedResume.skills
        .map((s: any) => s.name)
        .join(', ');
      if (sections['skills']) {
        const skillsLine = sections['skills'].split('\n').find((l) => l.trim());
        if (skillsLine) {
          replacements.set(skillsLine, newSkillsText);
        }
      }
    }

    // Apply replacements
    if (replacements.size > 0) {
      return await updateDocxContent(originalDocxPath, replacements, outputPath);
    } else {
      // If no replacements, just copy the file
      fs.copyFileSync(originalDocxPath, outputPath);
      return outputPath;
    }
  } catch (error) {
    console.error('Error updating resume DOCX:', error);
    throw error;
  }
};

/**
 * Helper function to escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate DOCX buffer from original file with updates based on JD
 * @param originalDocxPath - Path to original DOCX file
 * @param optimizedResume - Optimized resume data
 * @param jobDescription - Job description for context
 * @returns Buffer of updated DOCX
 *
 * Strategy: Intelligently update resume content based on JD:
 * - Update professional summary to match role
 * - Update job title to match target role
 * - Inject JD keywords into skills section
 * - Align experience bullets with JD responsibilities
 * - Tailor qualifications to match JD requirements
 */
export const generateUpdatedDocxBuffer = async (
  originalDocxPath: string,
  optimizedResume: OptimizedResume,
  jobDescription?: JobDescription,
  originalJobTitle?: string
): Promise<Buffer> => {
  try {
    const fileBuffer = fs.readFileSync(originalDocxPath);
    const zip = new JSZip();
    const loaded = await zip.loadAsync(fileBuffer);

    // Extract and modify document.xml
    let documentXml = await loaded.file('word/document.xml')?.async('string');
    if (!documentXml) {
      throw new Error('No document.xml found');
    }

    // Extract structure to identify sections
    const { sections } = await extractDocxStructure(originalDocxPath);

    console.log('📋 Detected sections:', Object.keys(sections));
    console.log('📝 Section contents:');
    Object.entries(sections).forEach(([section, content]) => {
      console.log(`  ${section}: ${content.substring(0, 100)}...`);
    });

    // Create replacements - intelligent updates based on JD
    const replacements = new Map<string, string>();

    // 1. Update professional summary to match JD role
    if (optimizedResume.professionalSummary && jobDescription) {
      const summaryLines = sections['summary']
        ?.split('\n')
        .filter((l: string) => l.trim() && !l.toUpperCase().includes('SUMMARY'));
      
      if (summaryLines && summaryLines.length > 0) {
        // Create JD-tailored summary
        const jdRole = jobDescription.roleTitle || 'Professional';
        const jdKeywords = (jobDescription.atsKeywords || []).slice(0, 3).join(', ');
        
        const talloredSummary = `Experienced professional with proven expertise in ${jdKeywords}. 
Strong track record delivering results as a ${jdRole}. Seeking to leverage skills in ${jdKeywords} 
to contribute meaningfully to a dynamic team. Proficient in identifying solutions and 
implementing best practices to optimize outcomes.`;
        
        replacements.set(summaryLines[0], talloredSummary);
      }
    }

    // 2. Update skills section with JD keywords
    if (optimizedResume.skills && jobDescription?.atsKeywords) {
      // Merge resume skills with JD required keywords
      const resumeSkills = optimizedResume.skills.map((s: any) => s.name);
      const jdKeywords = jobDescription.atsKeywords || [];
      
      // Get unique skills (resume + JD keywords)
      const allSkills = [...new Set([...resumeSkills, ...jdKeywords])];
      const skillsText = allSkills.slice(0, 15).join(' • '); // Top 15 skills
      
      const skillsLines = sections['skills']
        ?.split('\n')
        .filter((l: string) => l.trim() && !l.toUpperCase().includes('SKILL'));
      
      if (skillsLines && skillsLines.length > 0) {
        replacements.set(skillsLines[0], skillsText);
      }
    }

    // 3. Update job title to match target role (in BOTH header and experience sections)
    if (originalJobTitle && jobDescription?.roleTitle) {
      const newTitle = jobDescription.roleTitle; // Direct replacement with JD title
      
      // Strategy: Replace ALL occurrences of current job title with new title
      // This handles both header section AND experience section
      
      // Create a more flexible replacement that handles case variations
      const currentTitle = originalJobTitle;

      console.log(`🎯 Looking to replace job title: "${currentTitle}" → "${newTitle}"`);

      // Replace in experience section (if found)
      const expLines = sections['experience']
        ?.split('\n')
        .filter((l: string) => l.trim());

      if (expLines && expLines.length > 0) {
        const jobTitleLine = expLines.find((l: string) =>
          !l.toUpperCase().includes('EXPERIENCE') &&
          l.includes(currentTitle)
        );

        if (jobTitleLine) {
          console.log(`✅ Found job title in experience section: "${jobTitleLine}"`);
          replacements.set(jobTitleLine, newTitle);
        } else {
          console.log('❌ Job title not found in experience section');
        }
      }

      // Also replace in header/summary section (for profile title at the top)
      const headerLines = sections['personal']
        ?.split('\n')
        .filter((l: string) => l.trim());

      if (headerLines && headerLines.length > 0) {
        const headerJobTitleLine = headerLines.find((l: string) =>
          l.includes(currentTitle)
        );

        if (headerJobTitleLine) {
          console.log(`✅ Found job title in header section: "${headerJobTitleLine}"`);
          replacements.set(headerJobTitleLine, newTitle);
        } else {
          console.log('❌ Job title not found in header section');
        }
      }

      // Fallback: If not found in sections, do a direct text replacement in XML
      // This is a safety net in case section detection didn't work properly
      if (replacements.size === 0 ||
          ![...replacements.values()].some(v => v.includes(jobDescription.roleTitle))) {
        console.log('🔄 Using fallback direct replacement');
        // Add a direct replacement that will match the job title anywhere
        replacements.set(currentTitle, newTitle);
      }
    }

    // 4. Update experience bullets with JD keywords/responsibilities
    if (jobDescription?.responsibilities && sections['experience']) {
      const expLines = sections['experience']
        .split('\n')
        .filter((l: string) => {
          const trimmed = l.trim();
          return trimmed.length > 20 && 
                 !trimmed.toUpperCase().includes('EXPERIENCE') &&
                 !trimmed.includes('|'); // Skip header lines
        });

      // Replace first few bullet points with JD-aligned content
      if (expLines.length > 0) {
        const jdResp = jobDescription.responsibilities[0];
        if (jdResp && expLines[0]) {
          const enhancedBullet = `• ${jdResp}`;
          replacements.set(expLines[0], enhancedBullet);
        }
      }
    }

    // Apply replacements to XML
    console.log(`🔄 Applying ${replacements.size} replacements:`);
    replacements.forEach((newText, oldText) => {
      console.log(`  "${oldText}" → "${newText}"`);
      
      // Check if the old text exists in the XML before replacement
      if (documentXml && documentXml.includes(oldText)) {
        console.log(`  ✅ Found "${oldText}" in XML`);
      } else {
        console.log(`  ❌ "${oldText}" NOT found in XML`);
        // Try to find similar text
        if (documentXml) {
          const similarMatches = documentXml.match(new RegExp(oldText.replace(/\s+/g, '\\s*'), 'gi'));
          if (similarMatches) {
            console.log(`  🔍 Found similar matches: ${similarMatches.slice(0, 3)}`);
          }
        }
      }
    });

    for (const [oldText, newText] of replacements.entries()) {
      const escapedNew = newText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      const beforeCount = (documentXml.match(new RegExp(escapeRegExp(oldText), 'g')) || []).length;
      documentXml = documentXml.replace(
        new RegExp(escapeRegExp(oldText), 'g'),
        escapedNew
      );
      const afterCount = (documentXml.match(new RegExp(escapeRegExp(escapedNew), 'g')) || []).length;
      
      console.log(`  🔄 Replacement result: ${beforeCount} → ${afterCount} occurrences`);
    }

    // Update the file in ZIP
    loaded.file('word/document.xml', documentXml);

    // Generate buffer
    const buffer = await loaded.generateAsync({ type: 'nodebuffer' });
    return buffer;
  } catch (error) {
    console.error('Error generating updated DOCX buffer:', error);
    throw new Error('Failed to generate updated DOCX');
  }
};
